import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/generateToken'
import { MESSAGES } from '@/constants/messages'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: MESSAGES.VERIFICATION_INVALID }, { status: 400 })
    }

    const hashed = hashToken(token)

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: hashed },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: MESSAGES.VERIFICATION_INVALID }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      const email = verificationToken.identifier
      await prisma.verificationToken.delete({ where: { token: hashed } })
      return NextResponse.json(
        { error: MESSAGES.VERIFICATION_INVALID, email },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({ where: { token: hashed } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: MESSAGES.GENERIC_ERROR }, { status: 500 })
  }
}
