import { Html, Body, Head, Heading, Container, Text, Link, Preview } from '@react-email/components'

interface ResetPasswordEmailProps {
  resetUrl: string
}

export default function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            Click the button below to reset your password. This link expires in 1 hour.
          </Text>
          <Link href={resetUrl} style={button}>
            Reset Password
          </Link>
          <Text style={text}>
            If you did not request a password reset, ignore this email.
          </Text>
          <Text style={text}>
            If the button does not work, copy and paste this URL into your browser:
          </Text>
          <Text style={linkText}>{resetUrl}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
}

const button = {
  backgroundColor: '#e11d48',
  borderRadius: '4px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '200px',
}

const linkText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  wordBreak: 'break-all' as const,
}
