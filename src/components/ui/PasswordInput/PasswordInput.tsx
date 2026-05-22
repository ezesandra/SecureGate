'use client'

import { useState, useCallback } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import PasswordStrength from '../PasswordStrength/PasswordStrength'
import styles from './PasswordInput.module.css'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  strengthIndicator?: boolean
}

export default function PasswordInput({
  id,
  label,
  error,
  strengthIndicator = false,
  onBlur,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    onBlur?.(e)
  }, [onBlur])

  const inputClass = [
    styles.input,
    touched && !error ? styles.inputTouched : '',
    error ? styles.inputError : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.wrapper}>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={inputClass}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onBlur={handleBlur}
          {...props}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {strengthIndicator && <PasswordStrength password={String(props.value || '')} />}
    </div>
  )
}
