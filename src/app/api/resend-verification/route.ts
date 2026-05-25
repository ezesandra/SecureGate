import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { strictRatelimit } from '@/lib/rate-limit'
import { generateToken, hashToken } from '@/lib/generateToken'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await strictRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const rawToken = generateToken()
    const hashedToken = hashToken(rawToken)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    await sendVerificationEmail(email, user.name, rawToken)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Resend verification failed:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 })
  }
}
