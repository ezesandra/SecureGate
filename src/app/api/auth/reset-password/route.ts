import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { token, password } = result.data

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetTokenRecord) {
      return NextResponse.json({ error: 'This reset link is invalid.' }, { status: 400 })
    }

    if (resetTokenRecord.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email: resetTokenRecord.email },
      data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 })
  }
}
