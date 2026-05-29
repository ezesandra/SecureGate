import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { signupSchema } from '@/lib/validations/signup'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = signupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, email, password } = result.data

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    const token = crypto.randomBytes(32).toString('hex')

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    try {
      await sendVerificationEmail(email, token)
    } catch (emailError) {
      console.error('Verification email failed:', emailError)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
