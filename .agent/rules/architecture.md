---
trigger: always_on
---

# Architecture Rules — SecureGate

## Framework
- Next.js 14, App Router only. No Pages Router.
- TypeScript is mandatory across the entire codebase.
- All routes are inside `src/app/`.

---

## Folder Structure

```
SecureGate/
├── src/                          # All source code
│   ├── app/                      # Next.js App Router pages and API routes
│   │   ├── (auth)/               # Auth page group (login, signup, forgot/reset password)
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── dashboard/            # Protected dashboard (requires authentication)
│   │   ├── verify-email/         # Email verification pending / confirm pages
│   │   ├── api/                  # API route handlers
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   └── layout.tsx
│   ├── components/               # Shared UI components
│   │   ├── ui/                   # Primitives (Button, Input, FormError, etc.)
│   │   └── forms/                # Form-specific (SignupForm, LoginForm, etc.)
│   ├── lib/                      # Shared utilities and configuration
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── rate-limit.ts         # Rate limiter (Upstash + in-memory fallback)
│   │   ├── generateToken.ts      # Crypto-based token generation
│   │   └── validations/          # Zod validation schemas
│   ├── types/                    # Shared TypeScript types
│   ├── constants/                # Error messages and app constants
│   ├── styles/                   # Global styles and CSS design tokens
│   │   ├── globals.css
│   │   └── design-tokens.css
│   └── middleware.ts             # Next.js middleware (session checks, redirects)
├── public/                       # Static assets
└── Tokens/                       # Design token source files (colors, typography)
```

---

## Prisma Schema Contract

### User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### VerificationToken
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### PasswordResetToken
```prisma
model PasswordResetToken {
  id      String   @id @default(cuid())
  email   String
  token   String   @unique
  expires DateTime
}
```

---

## Routing & Middleware Rules

- `middleware.ts` at `src/` root must protect `/dashboard` using NextAuth's `withAuth` or `getToken`
- If no valid session → redirect to `/login`
- If session exists but `emailVerified` is null → redirect to `/verify-email/pending`
- The middleware must never expose why access was denied — just redirect silently

---

## Data Flow Contract
Client validation is UX only. Server validation is the law.

---

## Prisma Client Singleton

Always import Prisma from `src/lib/prisma.ts`. Never instantiate `new PrismaClient()` directly in a route.

```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Session Strategy

- Use **JWT sessions** (not database sessions) via NextAuth
- Justify: avoids extra DB reads on every request; session data is signed with `NEXTAUTH_SECRET`
- Store `id`, `email`, `emailVerified` in the JWT token callback

---

## next.config.js — Required Security Headers

```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'" },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```

---

## Phase Order

Build phases must be completed in order — do not skip ahead.

| Phase | Name | Deliverables |
|-------|------|-------------|
| 1 | Foundation | Project scaffold, Prisma schema + migration, NextAuth config, Prisma singleton, design tokens |
| 2 | Authentication | Signup, login, email verification routes + pages, middleware, JWT session config |
| 3 | Dashboard & Password | Protected dashboard page, forgot password, reset password |
| 4 | Polish | Rate limiting, error boundaries, accessibility audit, security header verification |

