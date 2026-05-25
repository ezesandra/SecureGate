'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import Input from '@/components/ui/Input/Input'
import PasswordInput from '@/components/ui/PasswordInput/PasswordInput'
import Button from '@/components/ui/Button/Button'
import Alert from '@/components/ui/Alert/Alert'

import { MESSAGES } from '@/constants/messages'

import styles from '../auth.module.css'
import Link from 'next/link'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const router = useRouter()

  // Fallback focus for client-side navigation where autoFocus may not work
  useEffect(() => {
    const el = document.getElementById('name') as HTMLInputElement | null
    if (el) el.focus()
  }, [])

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target as HTMLInputElement
    const trimmed = String(value).trim()
    if (!trimmed) {
      const msg = 'Field cannot be empty'
      if (name === 'name') setNameError(msg)
      if (name === 'email') setEmailError(msg)
      if (name === 'password') setPasswordError(msg)
    } else if (name === 'name' && trimmed.length < 2) {
      setNameError('Name must be at least 2 characters')
    } else if (name === 'email' && !emailRegex.test(trimmed)) {
      setEmailError('Enter a valid email address (e.g. example@gmail.com)')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Client-side validation before sending
    let hasError = false
    const nameVal = String(formData.get('name') || '').trim()
    const emailVal = String(formData.get('email') || '').trim()
    const passwordVal = String(formData.get('password') || '').trim()

    if (!nameVal) {
      setNameError('Field cannot be empty')
      hasError = true
    } else if (nameVal.length < 2) {
      setNameError('Name must be at least 2 characters')
      hasError = true
    }
    if (!emailVal) {
      setEmailError('Field cannot be empty')
      hasError = true
    } else if (!emailRegex.test(emailVal)) {
      setEmailError('Enter a valid email address (e.g. example@gmail.com)')
      hasError = true
    }
    if (!passwordVal) {
      setPasswordError('Field cannot be empty')
      hasError = true
    }

    if (hasError) {
      setIsLoading(false)
      return
    }

    const data = { ...Object.fromEntries(formData) }

    const res = await fetch('/api/signup', {
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

    router.push(`/verify-email/pending?email=${encodeURIComponent(emailVal)}`)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your account</h1>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            id="name"
            label="Enter Full Name"
            type="text"
            name="name"
            required
            autoComplete="name"
            disabled={isLoading}
            autoFocus
            onBlur={handleBlur}
            onChange={(e) => {
              const val = (e as React.ChangeEvent<HTMLInputElement>).target.value
              setName(val)
              if (val.trim().length > 0 && val.trim().length < 2) {
                setNameError('Name must be at least 2 characters')
              } else {
                setNameError(null)
              }
            }}
            value={name}
            error={nameError || undefined}
          />
          <Input
            id="email"
            label="Enter Email Address"
            type="email"
            name="email"
            required
            autoComplete="email"
            disabled={isLoading}
            onBlur={handleBlur}
            onChange={(e) => {
              const val = (e as React.ChangeEvent<HTMLInputElement>).target.value
              setEmail(val)
              if (val.trim().length > 0 && !emailRegex.test(val.trim())) {
                setEmailError('Enter a valid email address (e.g. example@gmail.com)')
              } else {
                setEmailError(null)
              }
            }}
            value={email}
            error={emailError || undefined}
          />
          <PasswordInput
            id="password"
            label="Create Password"
            name="password"
            required
            autoComplete="new-password"
            onBlur={handleBlur}
            onChange={(e) => {
              setPassword((e as React.ChangeEvent<HTMLInputElement>).target.value)
              setPasswordError(null)
            }}
            value={password}
            strengthIndicator={true}
            disabled={isLoading}
            error={passwordError || undefined}
          />
          <Button type="submit" isLoading={isLoading} variant="primary">
            Create account
          </Button>
        </form>
        <div className={styles.links}>
          <Link href="/login" className={styles.link}>Already have an account? Sign in</Link>
        </div>
      </div>
    </main>
  )
}
