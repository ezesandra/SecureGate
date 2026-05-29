import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      createdAt: Date
      emailVerified: Date | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    createdAt: Date
    emailVerified: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    createdAt: Date
    emailVerified: Date | null
  }
}
