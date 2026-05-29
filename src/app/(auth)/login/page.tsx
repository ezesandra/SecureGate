'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResetBanner, setShowResetBanner] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      setShowResetBanner(true)
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg bg-surface-card p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Sign in to SecureGate</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {showResetBanner && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <span className="flex-1">Password reset successful. Please log in.</span>
            <button
              onClick={() => setShowResetBanner(false)}
              className="text-current opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="email"
            label="Email address"
            type="email"
            name="email"
            required
            autoComplete="email"
            disabled={isLoading}
          />
          <PasswordInput
            id="password"
            label="Password"
            name="password"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
          <Button type="submit" isLoading={isLoading} variant="primary">
            Sign in
          </Button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">
            Forgot your password?
          </Link>
          <Link href="/signup" className="text-sm text-blue-400 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
