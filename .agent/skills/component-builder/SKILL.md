---
name: component-builder
description: Use when building UI pages, form components, reusable primitives (Button, Input, FormError, PasswordStrength, Alert, Spinner), auth pages, Dashboard, and email templates for SecureGate.
---

# Component Builder Skill — SecureGate

## Before You Start

1. Read `.agent/rules/design-system.md` — it governs all styling decisions
2. Read `.agent/rules/code-style.md` — it governs all TypeScript and file conventions
3. Read `.agent/rules/security.md` — it governs auth, validation, and CSRF enforcement
4. Import `Tokens/colors.css` and `Tokens/typography.css` directly in `src/styles/globals.css`
5. Do not use Tailwind CSS

---

## Component Anatomy

Every component is made of two files that share the same name:

- `Button.tsx` — component logic
- `Button.module.css` — scoped styles

Components live in a folder matching their name: `src/components/ui/Button/Button.tsx` + `Button.module.css`.

There are two categories:
- **UI primitives** (`src/components/ui/`) — reusable building blocks (Button, Input, Alert, FormError, Spinner, PasswordStrength)
- **Form pages** (`src/components/forms/`) — page-specific compositions (SignupForm, LoginForm)

Auth page components live in `src/app/(auth)/` as route-level page files, not in `src/components/`.

---

## Page Component Pattern

All auth pages (Signup, Login, Forgot Password, Reset Password) follow this structure:

```tsx
// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { signIn } from 'next-auth/react'

import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'

import { MESSAGES } from '@/constants/messages'

import styles from './page.module.css'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(MESSAGES.AUTH_ERROR)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in to SecureGate</h1>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            id="email"
            label="Email address"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
          <Button type="submit" isLoading={isLoading} variant="primary">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  )
}
```

---

## Signup Page Pattern

```tsx
// src/app/(auth)/signup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'
import PasswordStrength from '@/components/ui/PasswordStrength/PasswordStrength'

import { MESSAGES } from '@/constants/messages'

import styles from './page.module.css'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = { ...Object.fromEntries(formData), csrfToken }

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error || MESSAGES.GENERIC_ERROR)
      setIsLoading(false)
      return
    }

    router.push('/verify-email/pending')
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your account</h1>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            id="name"
            label="Full name"
            type="text"
            name="name"
            required
            autoComplete="name"
          />
          <Input
            id="email"
            label="Email address"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            name="password"
            required
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength password={password} />
          <Button type="submit" isLoading={isLoading} variant="primary">
            Create account
          </Button>
        </form>
      </div>
    </main>
  )
}
```

---

## Reusable UI Component Contracts

### Input

```tsx
// src/components/ui/Input/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export default function Input({ id, label, error, ...props }: InputProps) {
  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
```

### Button

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : children}
    </button>
  )
}
```

### PasswordStrength

```tsx
// Rendered below the password input on the Signup page only
type Strength = 'weak' | 'fair' | 'strong'

function getStrength(password: string): Strength {
  if (password.length < 8) return 'weak'
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\\|,.<>\/?]/.test(password)
  const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  if (score === 3) return 'strong'
  if (score >= 2) return 'fair'
  return 'weak'
}
```

### Alert

```tsx
// src/components/ui/Alert/Alert.tsx
// Page-level messages — rendered above the submit button
interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info'
  children: React.ReactNode
  onClose?: () => void
}

export default function Alert({ variant = 'error', children, onClose }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role="alert" aria-live="polite">
      <span className={styles.icon} aria-hidden="true" />
      <span>{children}</span>
      {onClose && (
        <button className={styles.close} onClick={onClose} aria-label="Dismiss">
          &times;
        </button>
      )}
    </div>
  )
}
```

### FormError

```tsx
// src/components/ui/FormError/FormError.tsx
// Field-level error — rendered below the input
interface FormErrorProps {
  id: string
  message: string
}

export default function FormError({ id, message }: FormErrorProps) {
  return (
    <span id={id} className={styles.error} role="alert">
      {message}
    </span>
  )
}
```

### Spinner

```tsx
// src/components/ui/Spinner/Spinner.tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label="Loading"
    >
      <span className={styles.visuallyHidden}>Loading...</span>
    </span>
  )
}
```

---

## PasswordInput

```tsx
// src/components/ui/PasswordInput/PasswordInput.tsx
// Wraps Input with a show/hide password toggle button
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  strengthIndicator?: boolean
}

export default function PasswordInput({
  id,
  label,
  error,
  strengthIndicator = false,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.wrapper}>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
```

---

## Email Templates (React Email)

```tsx
// src/components/emails/VerificationEmail.tsx
import { Html, Button, Text, Head, Preview } from '@react-email/components'

interface VerificationEmailProps {
  verificationUrl: string
  name: string
}

export default function VerificationEmail({
  verificationUrl,
  name,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your SecureGate account</Preview>
      <Text>Hi {name}, please verify your email to activate your SecureGate account.</Text>
      <Button href={verificationUrl}>Verify Email</Button>
      <Text>This link expires in 15 minutes. If you did not sign up, ignore this email.</Text>
    </Html>
  )
}
```

```tsx
// src/components/emails/ResetPasswordEmail.tsx
import { Html, Button, Text, Head, Preview } from '@react-email/components'

interface ResetPasswordEmailProps {
  resetUrl: string
  name: string
}

export default function ResetPasswordEmail({
  resetUrl,
  name,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your SecureGate password</Preview>
      <Text>Hi {name}, click the button below to reset your password.</Text>
      <Button href={resetUrl}>Reset Password</Button>
      <Text>This link expires in 1 hour. If you did not request this, ignore this email.</Text>
    </Html>
  )
}
```

---

## Loading States

Every form must show a loading state during submission:
- Button displays a CSS spinner, text is hidden
- Button and all inputs are disabled while `isLoading` is true
- No double submission is possible

## Checklist Before Completing Any Component

- [ ] Component has its own `.module.css` file
- [ ] All color/spacing/typography values use CSS tokens — no hardcoded values
- [ ] All form inputs have associated `<label>` elements
- [ ] Error inputs have `aria-invalid="true"` and error linked via `aria-describedby`
- [ ] Field-level errors use FormError (`<span>`); page-level errors use Alert (`<div>`)
- [ ] Error states use `role="alert"`
- [ ] Error messages imported from `@/constants/messages.ts` — no hardcoded strings
- [ ] Loading state is implemented on the submit button
- [ ] CSRF token included in API route submissions
- [ ] No Tailwind classes anywhere
- [ ] No inline `style` props (except truly dynamic computed values)
- [ ] Component is typed with a proper TypeScript interface