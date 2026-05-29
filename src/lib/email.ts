import { Resend } from 'resend'
import VerificationEmail from '@/emails/VerificationEmail'
import ResetPasswordEmail from '@/emails/ResetPasswordEmail'
import { render } from '@react-email/components'

const resend = new Resend(process.env.RESEND_API_KEY)

const fromAddress = process.env.RESEND_FROM || 'noreply@yourdomain.com'

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${token}`

  const { error } = await resend.emails.send({
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

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: 'Reset your password',
    html: await render(ResetPasswordEmail({ resetUrl })),
  })

  if (error) {
    console.error('Failed to send reset email:', error)
  }
}
