import { Resend } from 'resend'
import VerificationEmail from '@/emails/VerificationEmail'
import ResetPasswordEmail from '@/emails/ResetPasswordEmail'
import { render } from '@react-email/components'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const fromAddress = process.env.RESEND_FROM || 'noreply@yourdomain.com'

function isDev() {
  return process.env.NODE_ENV !== 'production'
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${token}`

  if (isDev()) {
    console.log('')
    console.log('╔══════════════════════════════════════════════╗')
    console.log('║        DEV: Verification Email              ║')
    console.log('╠══════════════════════════════════════════════╣')
    console.log(`║  To: ${email.padEnd(37)}║`)
    console.log(`║  URL: ${verificationUrl.padEnd(35)}║`)
    console.log('╚══════════════════════════════════════════════╝')
    console.log('')
    return
  }

  const { error } = await resend!.emails.send({
    from: fromAddress,
    to: email,
    subject: 'Verify your email',
    html: await render(VerificationEmail({ verificationUrl })),
  })

  if (error) {
    console.error('Failed to send verification email:', error)
  }
}

export async function sendResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

  if (isDev()) {
    console.log('')
    console.log('╔══════════════════════════════════════════════╗')
    console.log('║        DEV: Password Reset Email            ║')
    console.log('╠══════════════════════════════════════════════╣')
    console.log(`║  To: ${email.padEnd(37)}║`)
    console.log(`║  URL: ${resetUrl.padEnd(37)}║`)
    console.log('╚══════════════════════════════════════════════╝')
    console.log('')
    return
  }

  const { error } = await resend!.emails.send({
    from: fromAddress,
    to: email,
    subject: 'Reset your password',
    html: await render(ResetPasswordEmail({ resetUrl })),
  })

  if (error) {
    console.error('Failed to send reset email:', error)
  }
}
