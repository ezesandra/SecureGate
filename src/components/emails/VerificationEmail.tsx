import { Html, Body, Head, Heading, Container, Text, Link, Preview } from '@react-email/components'

interface VerificationEmailProps {
  name: string
  verificationUrl: string
}

export default function VerificationEmail({ name, verificationUrl }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your SecureGate account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to SecureGate</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Please verify your email address by clicking the link below. This link will expire in 15 minutes.
          </Text>
          <Text style={text}>
            <Link href={verificationUrl} style={button}>
              Verify Email
            </Link>
          </Text>
          <Text style={text}>
            Or copy and paste this link into your browser: <br />
            {verificationUrl}
          </Text>
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
  backgroundColor: '#2563eb',
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
