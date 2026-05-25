import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email') || process.env.SMTP_USER || ''
  try {
    const token = `test-${Date.now()}`
    await sendVerificationEmail(email, 'Test User', token)
    return NextResponse.json({ ok: true, message: `Sent test email to ${email}` })
  } catch (err) {
    console.error('Test email failed:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
