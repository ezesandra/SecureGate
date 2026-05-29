'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PasswordInput from '@/components/ui/PasswordInput'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Link from 'next/link'

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const { token } = params
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, token }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error || 'Something went wrong. Please try again later.')
      if (json.error && json.error.includes('expired')) {
        setIsExpired(true)
      }
      setIsLoading(false)
      return
    }

    router.push('/login?reset=true')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg bg-surface-card p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Set new password</h1>

        {error && <Alert variant="error">{error}</Alert>}
        {isExpired && (
          <p className="mt-3 text-sm">
            <Link href="/forgot-password" className="text-blue-400 hover:underline">
              Request a new reset link
            </Link>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <PasswordInput
            id="password"
            label="New Password"
            name="password"
            required
            autoComplete="new-password"
            onChange={(e) => setPassword((e as React.ChangeEvent<HTMLInputElement>).target.value)}
            value={password}
            strengthIndicator={true}
            disabled={isLoading}
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
