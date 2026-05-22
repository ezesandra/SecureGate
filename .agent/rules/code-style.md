---
trigger: always_on
---

# Code Style Rules — SecureGate

## Language
- TypeScript is mandatory everywhere — no `.js` files except `next.config.js`
- `strict: true` must be set in `tsconfig.json`
- No use of `any` — use proper types or `unknown` with type guards

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `LoginForm.tsx` |
| Hooks | camelCase with `use` prefix | `usePasswordStrength.ts` |
| API routes | kebab-case folders | `forgot-password/route.ts` |
| Lib utilities | camelCase | `generateToken.ts` |
| CSS Modules | camelCase classes | `styles.formGroup` |
| Zod schemas | camelCase with `Schema` suffix | `signupSchema` |
| Types/Interfaces | PascalCase with descriptive name | `SignupFormData` |
| App Router files | lowercase kebab-case | `error.tsx`, `loading.tsx` |
| Environment variables | UPPER_SNAKE_CASE | `NEXTAUTH_SECRET` |
| Constants | PascalCase objects or UPPER_SNAKE_CASE values | `MESSAGES` |
| Test files | `<name>.test.ts` or `<name>.spec.ts` | `signupSchema.test.ts` |

---

## File Conventions

- One component per file
- Component file and its CSS Module share the same name: `Button.tsx` + `Button.module.css`
- No barrel files (`index.ts`) unless there are more than 5 exports from a folder
- All shared types go in `src/types/` if they are used across more than one file
- App Router reserved file names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts` — do not create custom files with these names for any other purpose
- Test files sit adjacent to the file they test: `Button.test.tsx` beside `Button.tsx`

---

## TypeScript Patterns

### API Route Handler shape

#### POST handler (mutations)
```ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse body
  // 2. Validate with Zod
  // 3. Business logic
  // 4. Return response
}
```

#### GET handler (fetch only)
```ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Auth check
  const token = await getToken({ req })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // 2. Fetch data
  // 3. Return response
}
```

### Zod validation pattern
```ts
import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\\|,.<>\/?]/, 'Must contain at least one special character'),
})

export type SignupFormData = z.infer<typeof signupSchema>
```

### Error response shape (consistent across all routes)
```ts
// Success
return NextResponse.json({ success: true }, { status: 200 })

// Validation error
return NextResponse.json(
  { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
  { status: 400 }
)

// Auth error (never reveal specifics)
return NextResponse.json(
  { error: 'Invalid email or password' },
  { status: 401 }
)

// Server error (never reveal internals)
return NextResponse.json(
  { error: 'Something went wrong. Please try again later.' },
  { status: 500 }
)
```

---

### Server Action pattern (optional — use when form logic does not need a separate API route)

```ts
'use server'

import { z } from 'zod'
import { signupSchema } from '@/lib/validations/signup'

export async function signupAction(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const result = signupSchema.safeParse(raw)

  if (!result.success) {
    return { error: 'Invalid input', fields: result.error.flatten().fieldErrors }
  }

  // Business logic...
}
```

- Server Actions must validate inputs with Zod before any DB or business logic — same rule as API routes
- Prefer API routes (`route.ts`) for actions that need to be called from non-form contexts
- Never return raw Prisma objects or stack traces from a Server Action

### App Router Page pattern

```tsx
// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard — SecureGate',
}

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session?.user?.emailVerified) {
    redirect('/login')
  }

  // Render page content
}
```

- `layout.tsx` wraps child pages and persists across navigations — use it for shared UI shells
- `loading.tsx` shows during page data fetching — use a skeleton or spinner
- `error.tsx` catches runtime errors in a page subtree — must be a Client Component (`'use client'`)
- `not-found.tsx` renders for 404 responses — call `notFound()` from `next/navigation` to trigger

---

## React Component Patterns

- Use functional components only — no class components
- Use `'use client'` directive only when the component requires browser APIs or event handlers
- Server Components are the default in App Router — prefer them where possible
- Server Components may be `async` functions — use `await` for data fetching directly in the component body
- Export `metadata` from `layout.tsx` and `page.tsx` for SEO and page titles — never use `<title>` or `<head>` directly
- All form submissions must show a loading state while the request is in flight
- All forms must have accessible `<label>` elements linked to inputs via `htmlFor` / `id`

---

## Import Order

Enforce this order (ESLint import plugin recommended). A blank line must separate each group:

1. React and Next.js imports (`react`, `next/*`)
2. Third-party libraries (`bcryptjs`, `zod`, `next-auth`, etc.)
3. Internal lib utilities (`@/lib/...`)
4. Internal components (`@/components/...`)
5. Constants (`@/constants/...`)
6. Types (`@/types/...`)
7. CSS Modules (last — `*.module.css`)

---

## What Is Forbidden

- `console.log` and `debugger` statements in committed code — remove before commit
- Hardcoded strings for error messages — define them as constants in a `src/constants/messages.ts` file
- API keys, secrets, or tokens hardcoded anywhere (strings, comments, or unignored files)
- `// @ts-ignore` — use `// @ts-expect-error` with a justification comment instead
- Inline styles — all styling via CSS Modules and design tokens
- `any` type — use `unknown` with type guards
- Direct `new PrismaClient()` outside of `src/lib/prisma.ts`
- Tailwind CSS classes — this project does not use Tailwind