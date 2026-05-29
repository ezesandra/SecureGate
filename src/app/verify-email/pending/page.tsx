'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function PendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    if (!email) return
    setSending(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok || data.success) {
        setSent(true)
        setMessage('Verification email sent! Check your inbox.')
      } else {
        setMessage(data.error || 'Something went wrong.')
      }
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="w-full max-w-sm rounded-lg bg-surface-card p-8 text-center shadow-lg">
      <h1 className="mb-4 text-2xl font-bold text-white">Please verify your email before continuing</h1>
      <p className="mb-6 text-gray-400">
        We sent a verification link to your email. Please check your inbox and click the link to activate your account.
      </p>
      {email && (
        <div>
          <button
            onClick={handleResend}
            disabled={sending || sent}
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${
              sent
                ? 'cursor-not-allowed bg-green-600'
                : 'bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-800/50'
            }`}
          >
            {sending ? 'Sending...' : sent ? 'Sent!' : 'Resend verification email'}
          </button>
          {message && (
            <p className={`mt-3 text-sm ${sent ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Suspense fallback={<div className="rounded-lg bg-surface-card p-8 text-white">Loading...</div>}>
        <PendingContent />
      </Suspense>
    </div>
  )
}
