# Reflection

## Session Strategy: JWT

We chose the **JWT session strategy** over the database session strategy for the following reasons:

- **No additional database queries** — JWT sessions do not require a database lookup on every request, which reduces latency and database load.
- **Simpler infrastructure** — No session table or session cleanup job is needed.
- **Stateless** — JWTs are self-contained, making the system easier to scale horizontally without shared session storage.
- **Sufficient for auth-only use cases** — Since we only store `id` and `emailVerified` in the token, the payload remains small and well within size limits.

The trade-off is that JWTs cannot be revoked server-side before they expire (24h default). For this application, the convenience and performance benefits outweigh that concern.

---

## Self-Test Checklist (Phase 5 — Rate Limiting & Security)

| Test | Expected Result | Actual Result |
|------|----------------|---------------|
| Submit login with wrong password 6 times | Blocked on attempt 6 with rate limit message | `loginRatelimit` (5 req/10 min) fires in `authorize()` before credentials check; attempt 6 returns "Too many login attempts. Please try again in 10 minutes." |
| Submit forgot-password with unregistered email | Same success message as registered email | Route returns `"If that email is registered, you will receive a reset link shortly."` regardless of whether email exists |
| Click an expired verification link | "This verification link has expired" + resend option | API returns `{ error, code: 'EXPIRED', email }`; frontend shows error + "Resend verification email" button |
| Click an expired reset link | "This reset link has expired. Please request a new one." | API checks `expires < new Date()`, returns specific error with link to `/forgot-password` |
| Submit sign up form with empty fields | Zod validation error per field | Frontend validates per field before submit, also shows generic error from API if reached |
| Manually delete session cookie and visit /dashboard | Redirect to /login | `proxy.ts` (middleware) checks `getToken()` — redirects to `/login` when no token found |
| Submit reset-password with a token that was already used | "This reset link is invalid." | Token is deleted after use, so `findUnique` returns null → "This reset link is invalid." |

---

## Phase 6 — UI Polish & Deployment

### Design System
- Background: `#0a0a0a` (dark neutral)
- Cards/surfaces: `#111111` (slightly lighter)
- Accent: `#2563eb` (blue-600)
- Font: Inter via `next/font/google`
- Border radius: `rounded-lg` (0.5rem)
- Focus rings: `focus:ring-2 focus:ring-blue-500` on all interactive elements

### Accessibility
- All inputs have `<label>` with matching `htmlFor` / `id`
- All buttons have descriptive text
- Focus states visible on all interactive elements
- Error messages associated via `aria-describedby`
- Password strength bar includes text label (not color-only)

### Environment Variables Required for Deployment
```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
RESEND_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

### Build Status
`npm run build` passes with zero errors.
