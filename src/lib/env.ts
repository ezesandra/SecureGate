const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'RESEND_API_KEY'] as const

export function validateEnv() {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}
