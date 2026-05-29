import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'This verification link is invalid.' }, { status: 400 })
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: 'This verification link is invalid.' }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json({
        error: 'This verification link has expired.',
        code: 'EXPIRED',
        email: verificationToken.identifier,
      }, { status: 400 })
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({ where: { token } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 })
  }
}
