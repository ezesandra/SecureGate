'use client'

import { useState, useCallback } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export default function Input({ id, label, error, onBlur, className = '', ...props }: InputProps) {
  const [touched, setTouched] = useState(false)

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    onBlur?.(e)
  }, [onBlur])

  const borderColor = error ? 'border-red-500' : touched ? 'border-gray-500' : 'border-gray-700'

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-400">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${borderColor} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
