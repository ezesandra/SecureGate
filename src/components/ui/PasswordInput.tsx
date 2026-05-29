'use client'

import { useState, useCallback, useMemo } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  strengthIndicator?: boolean
}

const requirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains an uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains a number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Contains a special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(p) },
]

function getStrength(password: string): 'weak' | 'fair' | 'strong' | null {
  if (!password) return null
  if (password.length < 8) return 'weak'
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)
  const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  if (score >= 3) return 'strong'
  if (score >= 2) return 'fair'
  return 'weak'
}

const strengthColors = {
  weak: { bar: 'bg-red-500', text: 'text-red-400', label: 'Weak' },
  fair: { bar: 'bg-amber-500', text: 'text-amber-400', label: 'Fair' },
  strong: { bar: 'bg-green-500', text: 'text-green-400', label: 'Strong' },
}

export default function PasswordInput({
  id,
  label,
  error,
  strengthIndicator = false,
  onBlur,
  className = '',
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    onBlur?.(e)
  }, [onBlur])

  const borderColor = error ? 'border-red-500' : touched ? 'border-gray-500' : 'border-gray-700'
  const password = String(props.value || '')
  const strength = useMemo(() => getStrength(password), [password])
  const unmet = useMemo(() => requirements.filter((r) => !r.test(password)), [password])

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-400">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-lg border bg-gray-800 px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${borderColor} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onBlur={handleBlur}
          {...props}
        />
        <button
          type="button"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <span id={`${id}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </span>
      )}
      {strengthIndicator && strength && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {(['weak', 'fair', 'strong'] as const).map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ['weak', 'fair', 'strong'].indexOf(level) <= ['weak', 'fair', 'strong'].indexOf(strength)
                    ? strengthColors[strength].bar
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className={`text-xs ${strengthColors[strength].text}`}>
            Password strength: {strengthColors[strength].label}
          </p>
          {unmet.length > 0 && (
            <ul className="space-y-0.5">
              {unmet.map((req) => (
                <li key={req.label} className="text-xs text-gray-500">
                  {req.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
