'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

import Input from '@/components/ui/Input/Input'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'
import { MESSAGES } from '@/constants/messages'
import styles from '../auth.module.css'
import Link from 'next/link'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Email address is required'
  if (!emailRegex.test(trimmed)) return 'Enter a valid email address'
  return null
}

function validatePassword(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Password is required'
  return null
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setEmailError(emailErr)
    setPasswordError(passwordErr)

    if (emailErr || passwordErr) return

    setIsLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(result.error === 'CredentialsSignin' ? MESSAGES.AUTH_ERROR : result.error)
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
            disabled={isLoading}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError(validateEmail(e.target.value))
            }}
            onBlur={(e) => setEmailError(validateEmail(e.target.value))}
            error={emailError || undefined}
          />
          <PasswordInput
            id="password"
            label="Password"
            name="password"
            required
            autoComplete="current-password"
            disabled={isLoading}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) setPasswordError(null)
            }}
            onBlur={(e) => setPasswordError(validatePassword(e.target.value))}
            error={passwordError || undefined}
          />
          <Button type="submit" isLoading={isLoading} variant="primary">
            Sign in
          </Button>
        </form>
        <div className={styles.links}>
          <Link href="/forgot-password" className={styles.link}>Forgot your password?</Link>
          <Link href="/signup" className={styles.link}>Create an account</Link>
        </div>
      </div>
    </main>
  )
}
