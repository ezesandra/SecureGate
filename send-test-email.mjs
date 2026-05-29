import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import nodemailer from 'nodemailer'

async function send() {
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

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: 'SecureGate test email',
      text: 'This is a test email from SecureGate.',
    })

    console.log('Message sent:', info.messageId)
    console.log(info)
  } catch (err) {
    console.error('Send failed:', err)
    process.exit(1)
  }
}

send()
