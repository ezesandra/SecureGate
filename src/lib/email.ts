import nodemailer from 'nodemailer'
import VerificationEmail from '@/components/emails/VerificationEmail'
import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail'
import { render } from '@react-email/components'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const fromAddress = process.env.SMTP_FROM || 'noreply@securegate.app'

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${token}`

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Verify your SecureGate account',
    html: await render(VerificationEmail({ verificationUrl, name })),
  })
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Reset your SecureGate password',
    html: await render(ResetPasswordEmail({ resetUrl, name })),
  })
}
