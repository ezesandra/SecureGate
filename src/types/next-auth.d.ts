import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      emailVerified: Date | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    emailVerified: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    emailVerified: Date | null
  }
}
