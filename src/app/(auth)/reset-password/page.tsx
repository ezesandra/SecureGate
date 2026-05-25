'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'
import { MESSAGES } from '@/constants/messages'
import styles from '../auth.module.css'
import { Suspense } from 'react'

function validatePassword(value: string) {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter'
  if (!/[0-9]/.test(value)) return 'Must contain at least one number'
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return 'Must contain at least one special character'
  return null
}

function validateConfirmPassword(password: string, confirm: string) {
  if (!confirm) return 'Please confirm your password'
  if (password !== confirm) return 'Passwords do not match'
  return null
}

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Invalid reset link')
      return
    }

    const pwdErr = validatePassword(password)
    const confirmErr = validateConfirmPassword(password, confirmPassword)
    setPasswordError(pwdErr)
    setConfirmPasswordError(confirmErr)

    if (pwdErr || confirmErr) return

    setIsLoading(true)

    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.fields?.password?.[0] || json.error || MESSAGES.GENERIC_ERROR)
      setIsLoading(false)
      return
    }

    router.push('/login?reset=success')
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Set new password</h1>
      {error && <Alert variant="error">{error}</Alert>}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <PasswordInput
          id="password"
          label="New Password"
          name="password"
          required
          autoComplete="new-password"
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) setPasswordError(validatePassword(e.target.value))
          }}
          onBlur={(e) => setPasswordError(validatePassword(e.target.value))}
          value={password}
          strengthIndicator={true}
          disabled={isLoading}
          error={passwordError || undefined}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (confirmPasswordError) setConfirmPasswordError(null)
          }}
          onBlur={(e) => setConfirmPasswordError(validateConfirmPassword(password, e.target.value))}
          value={confirmPassword}
          disabled={isLoading}
          error={confirmPasswordError || undefined}
        />
        <Button type="submit" isLoading={isLoading} variant="primary">
          Update password
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<div className={styles.card}>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}
