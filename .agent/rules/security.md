---
trigger: always_on
---

# Security Rules — SecureGate

## Governing Principle
**Kerckhoffs's Principle**: Security must not rely on the secrecy of the implementation. It must come from the strength of hashing, the integrity of tokens, and the correct use of secrets stored in environment variables.

Murphy's Law is in effect on every endpoint. Anything that can go wrong will go wrong. Build accordingly.

---

## Password Hashing

- Always use `bcryptjs` — never `crypto`, `SHA-256`, `MD5`, or any other algorithm for passwords
- Salt rounds must be exactly `12`
- Hash on the server, in the API route, before any DB write — never trust a pre-hashed value from the client

```ts
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash(plainTextPassword, 12)
```

- To compare on login:
```ts
const isValid = await bcrypt.compare(plainTextPassword, hashedPassword)
```

- If `isValid` is false: return `{ error: 'Invalid email or password' }` — never specify which field is wrong

---

## Token Generation

All verification and reset tokens must be generated using Node's built-in `crypto` module:

```ts
import crypto from 'crypto'

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
```

- Verification tokens expire in **15 minutes**
- Password reset tokens expire in **1 hour**
- Tokens are single-use — delete from DB immediately after successful use
- **Hash tokens with SHA-256 before storing in the database** — never store raw tokens
- Before using any token, always check: does it exist? has it expired?
- Cleanup: delete expired tokens on-read (shown below) and periodically via a scheduled function to prevent DB bloat

Create a token:
```ts
const rawToken = generateToken()
const hashedToken = hashToken(rawToken)

await prisma.verificationToken.create({
  data: {
    identifier: email,
    token: hashedToken,
    expires: new Date(Date.now() + 15 * 60 * 1000),
  },
})

// Send `rawToken` in the email link, not the hash
```

Look up and validate:
```ts
const hashed = hashToken(incomingToken)

const token = await prisma.verificationToken.findUnique({
  where: { token: hashed },
})

if (!token) {
  return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 400 })
}

if (token.expires < new Date()) {
  await prisma.verificationToken.delete({ where: { token: hashed } })
  return NextResponse.json({ error: 'This link has expired.' }, { status: 400 })
}
```

---

## Input Validation

- All API routes must validate incoming request bodies with Zod **before** any database operation
- Zod schemas live in `src/lib/validations/`
- Client-side validation is for UX only — server-side Zod is the enforcing law

```ts
const result = schema.safeParse(body)

if (!result.success) {
  return NextResponse.json(
    { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
    { status: 400 }
  )
}
```

Never pass unvalidated `req.body` directly to Prisma.

---

## Error Messages — What Must Never Be Leaked

| Scenario | Wrong ❌ | Correct ✅ |
|---|---|---|
| Wrong password | "Incorrect password" | "Invalid email or password" |
| Email not found on login | "No account with that email" | "Invalid email or password" |
| Forgot password — email not found | "Email not registered" | "If this email is registered, you will receive a reset link" |
| Token expired | Full error + DB detail | "This link is invalid or has expired" |
| Server crash | Stack trace | "Something went wrong. Please try again later." |

The rule: a response must never confirm whether a piece of data exists in the system unless the user already has a verified right to know it.

---

## Rate Limiting

Apply rate limiting to these endpoints:

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/auth/signin` (via NextAuth) | 5 attempts | 10 minutes per IP |
| `POST /api/signup` | 3 attempts | 10 minutes per IP |
| `POST /api/forgot-password` | 3 attempts | 10 minutes per IP |
| `POST /api/reset-password` | 5 attempts | 15 minutes per IP |

Using Upstash Redis (`@upstash/ratelimit`):

```ts
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: false,
})

export const strictRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: false,
})
```

In a standalone route (signup, forgot-password, reset-password):
```ts
const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
const { success } = await authRatelimit.limit(ip)

if (!success) {
  return NextResponse.json(
    { error: 'Too many attempts. Please try again later.' },
    { status: 429 }
  )
}
```

For signin via NextAuth's `[...nextauth]` catch-all, apply rate limiting inside the NextAuth `authorize` callback:

```ts
// In NextAuth config providers array
async authorize(credentials, req) {
  const ip = req?.headers?.['x-forwarded-for'] ?? '127.0.0.1'
  const { success } = await authRatelimit.limit(ip)

  if (!success) {
    throw new Error('Too many attempts. Please try again later.')
  }
  // Proceed with credential validation...
}
```

If Upstash is unavailable, implement a simple in-memory Map-based limiter as a fallback — documented in `src/lib/rate-limit.ts`.

---

## CSRF & CORS

- All state-changing API routes must reject requests without a valid CSRF token
- NextAuth's `[...nextauth]` handler includes CSRF protection automatically — do not disable it
- Custom API routes (signup, forgot-password, reset-password) must validate the CSRF token from NextAuth:
  ```ts
  import { csrfToken } from 'next-auth/csrf'

  const token = await csrfToken({ req: request })
  if (body.csrfToken !== token) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
  }
  ```
- CORS: in production, set `Access-Control-Allow-Origin` to the deployment domain only. Never use `*` for origins. Configure in `next.config.js` headers or Vercel `vercel.json`.

---

## Session Security

- JWT sessions via NextAuth must set a `maxAge` to prevent eternal tokens:
  ```ts
  // In NextAuth config
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  }
  ```
- Store only `id`, `email`, and `emailVerified` in the JWT — never store passwords or tokens
- Rotate `NEXTAUTH_SECRET` if there is any suspicion of compromise

---

## Logging & Audit

- Log these security events with a timestamp and IP:
  - Failed login attempts (without revealing which field was wrong)
  - Password reset requests
  - Email verification attempts
  - Account creation
- Never log:
  - Passwords (plaintext or hashed)
  - Raw tokens
  - Secrets or API keys
- Use `console.error` for server-side logging — never `console.log` in production
- Do not expose logs to the client under any circumstance

---

## XSS Prevention

- React's JSX escaping is the primary defense — never use `dangerouslySetInnerHTML`
- If dynamic HTML is unavoidable (e.g., rich email content), sanitize with a library like DOMPurify on the server before rendering
- Never interpolate user input directly into `<script>` tags or `href` attributes with `javascript:` URLs

---

## Environment Variables

Required variables — all must be present in `.env.local` locally and in Vercel's environment variable dashboard for production:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `NEXTAUTH_URL` | Full URL of the deployment (e.g. `http://localhost:3000` locally) |
| `NEXTAUTH_SECRET` | Random string to sign JWTs — generate with `openssl rand -base64 32` |
| `RESEND_API_KEY` | API key from Resend for transactional emails |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token for rate limiting |

Validate required variables on startup:

```ts
const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'RESEND_API_KEY'] as const

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}
```