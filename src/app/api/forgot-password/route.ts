import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations/forgot-password'
import { sendResetEmail } from '@/lib/email'
import { MESSAGES } from '@/constants/messages'

export async function POST(req: NextRequest) {
  try {
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

      try { await sendResetEmail(email, token) } catch (e) { console.error('Reset email failed:', e) }
    }

    return NextResponse.json({ message: MESSAGES.FORGOT_SUCCESS }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: MESSAGES.GENERIC_ERROR }, { status: 500 })
  }
}
