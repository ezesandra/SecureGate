'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'
import { MESSAGES } from '@/constants/messages'
import styles from '../login/page.module.css'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState('')

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
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const data = { ...Object.fromEntries(formData), csrfToken }

    const res = await fetch('/api/forgot-password', {
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
