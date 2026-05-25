'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'
import styles from './page.module.css'

export default function VerifyEmailPendingPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setResending(true)
    setError(null)
    setResent(false)

    try {
      const email = new URLSearchParams(window.location.search).get('email') || ''
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setResent(true)
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.text}>
          We&apos;ve sent a verification link to your email address. Please click the link to activate your account.
        </p>
        {resent && <Alert variant="success">Verification email resent! Check your inbox.</Alert>}
        {error && <Alert variant="error">{error}</Alert>}
        <div style={{ marginTop: '1.5rem' }}>
          <Button type="button" variant="secondary" isLoading={resending} onClick={handleResend}>
            Resend verification email
          </Button>
        </div>
      </div>
    </main>
  )
}
