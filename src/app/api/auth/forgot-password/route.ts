import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations/forgot-password'
import { forgotPasswordRatelimit } from '@/lib/ratelimit'
import { sendResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await forgotPasswordRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { email } = result.data

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      const token = crypto.randomBytes(32).toString('hex')

      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expires: new Date(Date.now() + 60 * 60 * 1000),
        },
      })

      await sendResetEmail(email, token)
    }

    return NextResponse.json({
      message: 'If that email is registered, you will receive a reset link shortly.',
    }, { status: 200 })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 })
  }
}
