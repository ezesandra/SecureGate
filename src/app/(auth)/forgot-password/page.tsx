'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function validateEmail(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return 'Email address is required'
    if (!emailRegex.test(trimmed)) return 'Enter a valid email address'
    return null
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const emailValue = String(formData.get('email') || '')
    const emailValidation = validateEmail(emailValue)

    if (emailValidation) {
      setEmailError(emailValidation)
      return
    }

    setIsLoading(true)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error || 'Something went wrong. Please try again later.')
      setIsLoading(false)
      return
    }

    setSuccess(json.message)
    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg bg-surface-card p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Reset Password</h1>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="email"
            label="Email address"
            type="email"
            name="email"
            required
            autoComplete="email"
            disabled={isLoading || !!success}
            value={email}
            onChange={(e) => {
              const next = e.target.value
              setEmail(next)
              if (emailError) {
                setEmailError(validateEmail(next))
              }
            }}
            onBlur={(e) => setEmailError(validateEmail(e.target.value))}
            error={emailError || undefined}
          />
          <Button type="submit" isLoading={isLoading} disabled={!!success} variant="primary">
            Send reset link
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
