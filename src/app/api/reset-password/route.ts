import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { strictRatelimit } from '@/lib/rate-limit'
import { hashToken } from '@/lib/generateToken'
import { resetPasswordSchema } from '@/lib/validations/reset-password'
import { MESSAGES } from '@/constants/messages'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await strictRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: MESSAGES.RATE_LIMIT_ERROR }, { status: 429 })
    }

    const body = await req.json()
    const result = resetPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, password } = result.data

    const hashed = hashToken(token)

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashed },
    })

    if (!resetTokenRecord) {
      return NextResponse.json({ error: MESSAGES.RESET_INVALID }, { status: 400 })
    }

    if (resetTokenRecord.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token: hashed } })
      return NextResponse.json({ error: MESSAGES.RESET_INVALID }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email: resetTokenRecord.email },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.delete({ where: { token: hashed } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: MESSAGES.GENERIC_ERROR }, { status: 500 })
  }
}
