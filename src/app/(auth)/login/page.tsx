'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

import Input from '@/components/ui/Input/Input'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'
import { MESSAGES } from '@/constants/messages'
import styles from '../signup/page.module.css'
import Link from 'next/link'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
      setError(MESSAGES.AUTH_ERROR)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in to SecureGate</h1>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
        <div className={styles.links}>
          <Link href="/forgot-password" className={styles.link}>Forgot your password?</Link>
          <Link href="/signup" className={styles.link}>Create an account</Link>
        </div>
      </div>
    </main>
  )
}
