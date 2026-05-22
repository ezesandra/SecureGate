'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner/Spinner'
import Alert from '@/components/ui/Alert/Alert'
import styles from '../pending/page.module.css'

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
  const { token } = params
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json().then(data => ({ status: res.status, ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success')
          setTimeout(() => router.push('/login'), 2000)
        } else {
          setStatus('error')
          setErrorMsg(data.error)
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('Something went wrong')
      })
  }, [token, router])

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Email Verification</h1>
        {status === 'loading' && (
          <div>
            <Spinner size="lg" />
            <p className={styles.text} style={{ marginTop: '1rem' }}>Verifying your email...</p>
          </div>
        )}
        {status === 'success' && (
          <Alert variant="success">Your email has been verified! Redirecting to login...</Alert>
        )}
        {status === 'error' && (
          <Alert variant="error">{errorMsg || 'Verification failed'}</Alert>
        )}
      </div>
    </main>
  )
}
