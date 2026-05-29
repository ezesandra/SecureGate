import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import nodemailer from 'nodemailer'

async function run(email, rawToken) {
  if (!email || !rawToken) {
    console.error('Usage: node send-reset-email.mjs email token')
    process.exit(1)
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.verify()
    console.log('Transport verified')

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password reset - SecureGate (test)',
      text: `Reset your password: ${resetUrl}`,
      html: `<p>Reset your password by visiting <a href="${resetUrl}">${resetUrl}</a></p>`,
    })

    console.log('Message sent:', info.messageId)
    console.log(info)
  } catch (err) {
    console.error('Send failed:', err)
    process.exit(1)
  }
}

run(process.argv[2], process.argv[3])
