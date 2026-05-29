import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function run(email) {
  if (!email) {
    console.error('Usage: node run-forgot-password.mjs email@example.com')
    process.exit(1)
  }

  try {
    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log('User not found, creating test user...')
      user = await prisma.user.create({ data: { email, name: 'Test User', password: 'placeholder' } })
    }

    // Generate token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    // Create password reset token record
    const expires = new Date(Date.now() + 60 * 60 * 1000)
    const prt = await prisma.passwordResetToken.create({ data: { email, token: hashedToken, expires } })

    console.log('Created passwordResetToken id=', prt.id, 'expires=', prt.expires.toISOString())

    // Send email via nodemailer (simple HTML)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.verify()
    console.log('SMTP transport verified')

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password reset - SecureGate (test)',
      text: `Reset your password: ${resetUrl}`,
      html: `<p>Reset your password by visiting <a href="${resetUrl}">${resetUrl}</a></p>`,
    })

    console.log('Email send info:', info.messageId)

    // Read back record from DB
    const dbRecord = await prisma.passwordResetToken.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    console.log('DB token record (hashed):', dbRecord?.token)
    console.log('Raw token (use in reset URL):', rawToken)

    await prisma.$disconnect()
  } catch (err) {
    console.error('Error during forgot-password run:', err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

const email = process.argv[2]
run(email)
