'use client'

import { useState, useCallback } from 'react'
import styles from './Input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export default function Input({ id, label, error, onBlur, ...props }: InputProps) {
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
      <input
        id={id}
        className={inputClass}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
