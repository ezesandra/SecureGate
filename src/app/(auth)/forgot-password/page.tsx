'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'
import { MESSAGES } from '@/constants/messages'
import styles from '../auth.module.css'
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

    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error || MESSAGES.GENERIC_ERROR)
      setIsLoading(false)
      return
    }

    setSuccess(json.message)
    setIsLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
        <div className={styles.links}>
          <Link href="/login" className={styles.link}>Back to login</Link>
        </div>
      </div>
    </main>
  )
}
