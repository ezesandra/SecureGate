'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'

export default function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resentMsg, setResentMsg] = useState<string | null>(null)
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
          if (data.code === 'EXPIRED' && data.email) {
            setExpiredEmail(data.email)
          }
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('Something went wrong')
      })
  }, [token, router])

  const handleResend = async () => {
    if (!expiredEmail) return
    setResending(true)
    setResentMsg(null)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: expiredEmail }),
      })
      const data = await res.json()
      if (res.ok || data.success) {
        setResent(true)
        setResentMsg('A new verification link has been sent to your email.')
      }
    } catch {
      setResentMsg('Something went wrong. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm rounded-lg bg-surface-card p-8 text-center shadow">
        <h1 className="mb-6 text-2xl font-bold text-white">Email Verification</h1>

        {status === 'loading' && (
          <div>
            <Spinner size="lg" />
            <p className="mt-4 text-gray-400">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            Your email has been verified. You can now log in.
          </div>
        )}

        {status === 'error' && (
          <>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMsg || 'Verification failed'}
            </div>
            {expiredEmail && !resent && (
              <div className="mt-4">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-800/50"
                >
                  {resending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            )}
            {resentMsg && (
              <p className={`mt-3 text-sm ${resent ? 'text-green-400' : 'text-red-400'}`}>
                {resentMsg}
              </p>
            )}
          </>
        )}

        {status === 'success' && (
          <div className="mt-6">
            <Link href="/login" className="text-sm text-blue-400 hover:underline">
              Go to login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
