import { NextRequest, NextResponse } from 'next/server'
import { csrfToken } from 'next-auth/csrf'
import { prisma } from '@/lib/prisma'
import { strictRatelimit } from '@/lib/rate-limit'
import { generateToken, hashToken } from '@/lib/generateToken'
import { sendPasswordResetEmail } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validations/forgot-password'
import { MESSAGES } from '@/constants/messages'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await strictRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: MESSAGES.RATE_LIMIT_ERROR }, { status: 429 })
    }

    const body = await req.json()
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const tokenData = await csrfToken({ req })
    if (body.csrfToken !== tokenData) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
    }

    const { email } = result.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      const rawToken = generateToken()
      const hashedToken = hashToken(rawToken)

      await prisma.passwordResetToken.create({
        data: {
          email,
          token: hashedToken,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      })

      await sendPasswordResetEmail(email, user.name, rawToken)
    }

    return NextResponse.json({ message: MESSAGES.FORGOT_SUCCESS }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: MESSAGES.GENERIC_ERROR }, { status: 500 })
  }
}
