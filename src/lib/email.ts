import nodemailer from 'nodemailer'
import VerificationEmail from '@/emails/VerificationEmail'
import ResetPasswordEmail from '@/emails/ResetPasswordEmail'
import { render } from '@react-email/components'

function createTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return null
}

const transport = createTransport()
const fromAddress = process.env.SMTP_FROM || 'noreply@localhost'

function isDev() {
  return process.env.NODE_ENV !== 'production'
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${token}`

  if (!transport) {
    console.log('')
    console.log('╔══════════════════════════════════════════════╗')
    console.log('║        DEV: Verification Email              ║')
    console.log('╠══════════════════════════════════════════════╣')
    console.log(`║  To: ${email.padEnd(37)}║`)
    console.log(`║  URL: ${verificationUrl}`)
    console.log('╚══════════════════════════════════════════════╝')
    console.log('')
    return
  }

  const html = await render(VerificationEmail({ verificationUrl }))
  await transport.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Verify your email',
    html,
  })
}

export async function sendResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

  if (!transport) {
    console.log('')
    console.log('╔══════════════════════════════════════════════╗')
    console.log('║        DEV: Password Reset Email            ║')
    console.log('╠══════════════════════════════════════════════╣')
    console.log(`║  To: ${email.padEnd(37)}║`)
    console.log(`║  URL: ${resetUrl}`)
    console.log('╚══════════════════════════════════════════════╝')
    console.log('')
    return
  }

  const html = await render(ResetPasswordEmail({ resetUrl }))
  await transport.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Reset your password',
    html,
  })
}
