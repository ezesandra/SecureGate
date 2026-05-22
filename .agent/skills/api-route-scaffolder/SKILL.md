---
name: api-route-scaffolder
description: Use when creating Next.js App Router API routes for signup, email verification, forgot/reset password, and NextAuth configuration in SecureGate.
---

# API Route Scaffolder Skill — SecureGate

## Before You Start

1. Read `.agent/rules/security.md` — it governs all security decisions in routes
2. Read `.agent/rules/architecture.md` — it defines the folder structure and data flow contract
3. Read `.agent/rules/code-style.md` — it defines the TypeScript patterns and error response shapes

---

## Route Handler Template

Every API route follows this exact order of operations:

```
1. Parse request body
2. Validate with Zod (return 400 if invalid)
3. Validate CSRF token (return 403 if invalid)
4. Apply rate limiting if applicable (return 429 if exceeded)
5. Business logic (DB query, token operation, email send)
6. Return safe JSON response (never leak internals)
```

```ts
// Template: src/app/api/[route-name]/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'
import { csrfToken } from 'next-auth/csrf'

import { prisma } from '@/lib/prisma'
import { authRatelimit, strictRatelimit } from '@/lib/rate-limit'
import { generateToken, hashToken } from '@/lib/generateToken'

const schema = z.object({
  // define fields here
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // CSRF check
    const token = await csrfToken({ req })
    if (body.csrfToken !== token) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
    }

    // Rate limit
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await authRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { /* destructure validated fields */ } = result.data

    // Business logic here

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
```

Validate required env vars before the server starts — add to the root layout or a startup file:
```ts
const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'RESEND_API_KEY'] as const
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`)
}
```

---

## Signup Route

**File:** `src/app/api/signup/route.ts`

Steps:
1. Validate `name`, `email`, `password` with Zod (`signupSchema`)
2. Validate CSRF token
3. Apply rate limiting (3 per 10 min per IP)
4. Check if email already exists in DB — if yes, still return success (do not confirm email existence)
5. Hash password: `bcrypt.hash(password, 12)`
6. Create user with `emailVerified: null`
7. Generate verification token: `generateToken()`, then `hashToken(rawToken)`
8. Save hash to `VerificationToken` with `expires = now + 15 minutes`
9. Send verification email (containing the raw token) via Resend
10. Return `{ success: true }`

**Critical:** Step 2 must return the same response shape whether the email exists or not.

---

## Email Verification Route

**File:** `src/app/api/verify-email/route.ts`  
Or handled in the page server component at `src/app/(auth)/verify-email/[token]/page.tsx`

Steps:
1. Read `token` from URL params
2. Hash incoming token: `hashToken(token)`, look up hash in `VerificationToken` table
3. If not found → return error: `"This link is invalid or has expired"`
4. If `token.expires < new Date()` → delete token, return error: `"This link has expired"`
5. Set `emailVerified = new Date()` on the user record
6. Delete the token from `VerificationToken`
7. Redirect to `/login` with success message

---

## Forgot Password Route

**File:** `src/app/api/forgot-password/route.ts`

Steps:
1. Apply rate limiting (3 per 10 min per IP)
2. Validate CSRF token
3. Validate `email` with Zod
4. Look up user by email
5. **Whether user exists or not:** generate a token and return the same success message
6. If user exists: hash with `hashToken(rawToken)`, save hash to `PasswordResetToken` with `expires = now + 1 hour`, send reset email (containing the raw token)
7. Always return: `{ message: "If this email is registered, you will receive a reset link" }`

**Critical:** The response must be identical regardless of whether the email is found.

---

## Reset Password Route

**File:** `src/app/api/reset-password/route.ts`

Steps:
1. Validate `token` and `password` with Zod
2. Validate CSRF token
3. Hash incoming token: `hashToken(token)`, look up hash in `PasswordResetToken`
4. If not found → `"This link is invalid or has expired"`
5. If expired → delete token, return `"This link has expired"`
6. Hash new password: `bcrypt.hash(password, 12)`
7. Update user's password by email
8. Delete the used token from `PasswordResetToken`
9. Return `{ success: true }` and redirect to `/login`

---

## NextAuth Configuration

**File:** `src/lib/auth.ts`

```ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { authRatelimit } from '@/lib/rate-limit'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limit
        const ip = (req as any)?.headers?.['x-forwarded-for'] ?? '127.0.0.1'
        const { success } = await authRatelimit.limit(ip)
        if (!success) throw new Error('Too many attempts. Please try again later.')

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.emailVerified = token.emailVerified as Date | null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
```

---

## Rate Limiting Integration

Rate limiting configuration and usage is defined in `.agent/rules/security.md`. Import the appropriate limiter from `@/lib/rate-limit` and call `.limit(ip)` before business logic.

---

## Checklist Before Completing Any Route

- [ ] Zod validation runs before any DB operation
- [ ] CSRF token validated on every state-changing route
- [ ] Rate limiting applied where required (signin, signup, forgot-password, reset-password)
- [ ] Tokens hashed with `hashToken()` before storing in DB
- [ ] Passwords hashed with `bcrypt.hash(password, 12)` — never stored plain
- [ ] Tokens generated with `crypto.randomBytes(32).toString('hex')`
- [ ] Token expiry checked before use
- [ ] Used tokens deleted immediately after use
- [ ] Error messages never confirm email existence
- [ ] No stack traces, Prisma errors, or `any` types in responses
- [ ] `catch` block returns generic `500` message only
- [ ] `maxAge` set on JWT session (24 hours)
- [ ] Env vars validated on startup