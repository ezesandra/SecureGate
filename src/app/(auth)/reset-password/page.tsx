'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'
import { MESSAGES } from '@/constants/messages'
import styles from '../login/page.module.css'
import { Suspense } from 'react'

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

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

    if (!token) {
      setError('Invalid token')
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const data = { ...Object.fromEntries(formData), token, csrfToken }

    const res = await fetch('/api/reset-password', {
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
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          strengthIndicator={true}
          disabled={isLoading}
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
