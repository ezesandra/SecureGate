import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { csrfToken } from 'next-auth/csrf'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { strictRatelimit } from '@/lib/rate-limit'
import { generateToken, hashToken } from '@/lib/generateToken'
import { sendVerificationEmail } from '@/lib/email'
import { signupSchema } from '@/lib/validations/signup'
import { MESSAGES } from '@/constants/messages'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const result = signupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', fields: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const token = await csrfToken({ req })
    if (body.csrfToken !== token) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
    }

    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await strictRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: MESSAGES.RATE_LIMIT_ERROR }, { status: 429 })
    }

    const { name, email, password } = result.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })
      
      const rawToken = generateToken()
      const hashedToken = hashToken(rawToken)

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: hashedToken,
          expires: new Date(Date.now() + 15 * 60 * 1000),
        },
      })

      await sendVerificationEmail(email, name, rawToken)
    }

    // Always return success even if email exists
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: MESSAGES.GENERIC_ERROR }, { status: 500 })
  }
}
