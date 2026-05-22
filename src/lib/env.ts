const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] as const

export function validateEnv() {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}
