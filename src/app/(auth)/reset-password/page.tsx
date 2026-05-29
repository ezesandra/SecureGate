'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PasswordInput from '@/components/ui/PasswordInput'
import Button from '@/components/ui/Button'
import Link from 'next/link'
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

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, token }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error || 'Something went wrong. Please try again later.')
      setIsLoading(false)
      return
    }

    router.push('/login?reset=true')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg bg-surface-card p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Set new password</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link href="/login" className="text-sm text-blue-400 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Suspense fallback={<div className="rounded-lg bg-surface-card p-8 text-white">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
