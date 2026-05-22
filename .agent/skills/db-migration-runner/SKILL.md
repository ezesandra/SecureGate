---
name: db-migration-runner
description: Use when modifying the Prisma schema, creating models, adding fields, running migrations, or touching prisma/schema.prisma for SecureGate.
---

# DB Migration Runner Skill — SecureGate

## Before You Start

1. Read `.agent/rules/architecture.md` — it defines the authoritative Prisma schema contract
2. Never modify a migration file that has already been applied to the database
3. Never run `prisma db push` in production — use `prisma migrate deploy`

---

## The Three Models (Do Not Add or Remove Without Explicit Instruction)

The authoritative schema contract is defined in `.agent/rules/architecture.md`. Always reference it before any migration. Do not add or remove models without explicit instruction.

---

## Commands

### Initial setup (run once)
```bash
npx prisma init
```
This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env.local`.

### After any schema change in development
```bash
npx prisma migrate dev --name describe_your_change
```
This creates a new migration file and applies it to the local DB.

### Apply existing migrations to a new environment (e.g. CI, staging)
```bash
npx prisma migrate deploy
```

### Regenerate the Prisma client after schema changes
```bash
npx prisma generate
```
This is run automatically after `migrate dev` but must be run manually after `migrate deploy`.

### Inspect the DB visually during development
```bash
npx prisma studio
```

---

## Prisma Client Singleton

The Prisma client singleton is defined in `.agent/rules/architecture.md`. Never instantiate `new PrismaClient()` directly — always import via `import { prisma } from '@/lib/prisma'`.

---

## Common Operations

### Create a new user
```ts
const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    emailVerified: null,
  },
})
```

### Find user by email
```ts
const user = await prisma.user.findUnique({
  where: { email },
})
```

### Mark email as verified
```ts
await prisma.user.update({
  where: { email },
  data: { emailVerified: new Date() },
})
```

### Save a verification token
```ts
await prisma.verificationToken.create({
  data: {
    identifier: email,
    token,
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  },
})
```

### Look up and validate a verification token
```ts
const record = await prisma.verificationToken.findUnique({
  where: { token },
})

if (!record || record.expires < new Date()) {
  // expired or not found
}
```

### Delete a used token
```ts
await prisma.verificationToken.delete({
  where: { token },
})
```

### Save a password reset token
```ts
await prisma.passwordResetToken.create({
  data: {
    email,
    token,
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  },
})
```

### Update user password after reset
```ts
await prisma.user.update({
  where: { email },
  data: { password: hashedPassword },
})
```

---

## Rules

- Always wrap Prisma operations in try/catch in API routes — never let a Prisma error surface to the client
- Never select the `password` field unless you specifically need it for comparison:
```ts
// Safe — password excluded
const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true, email: true, name: true, emailVerified: true },
})

// Only when comparing on login
const user = await prisma.user.findUnique({
  where: { email },
})
```
- `DATABASE_URL` must always come from environment variables — never hardcoded

---

## Checklist Before Any Migration

- [ ] Schema change reviewed against `.agent/rules/architecture.md`
- [ ] `DATABASE_URL` is set correctly in `.env.local`
- [ ] Migration name is descriptive (e.g. `add_password_reset_token`)
- [ ] `prisma generate` has been run after `migrate dev`
- [ ] No existing migration files were modified
- [ ] Prisma Studio confirms tables exist with correct columns after migration