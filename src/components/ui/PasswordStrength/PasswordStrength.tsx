import { useMemo } from 'react'
import styles from './PasswordStrength.module.css'

interface PasswordStrengthProps {
  password?: string
}

type Strength = 'weak' | 'fair' | 'strong'

const requirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains an uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains a number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Contains a special character', test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
]

function getStrength(password: string): Strength {
  if (!password || password.length < 8) return 'weak'
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  if (score === 3) return 'strong'
  if (score >= 2) return 'fair'
  return 'weak'
}

export default function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const strength = password ? getStrength(password) : null
  const unmet = useMemo(() => requirements.filter((r) => !r.test(password)), [password])

  return (
    <div className={styles.container}>
      {strength && (
        <p className={styles.label}>
          Password strength: <span className={styles[`text-${strength}`]}>{strength}</span>
        </p>
      )}
      {unmet.length > 0 && (
        <ul className={styles.list}>
          {unmet.map((req) => (
            <li key={req.label} className={styles.listItem}>{req.label}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
