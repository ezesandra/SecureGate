import { Resend } from 'resend'
import VerificationEmail from '@/components/emails/VerificationEmail'
import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail'
import { render } from '@react-email/components'

const resend = new Resend(process.env.RESEND_API_KEY || '')
const fromAddress = process.env.RESEND_FROM || 'noreply@securegate.app'

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${token}`

  await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: 'Verify your SecureGate account',
    html: await render(VerificationEmail({ verificationUrl, name })),
  })
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: 'Reset your SecureGate password',
    html: await render(ResetPasswordEmail({ resetUrl, name })),
  })
}
