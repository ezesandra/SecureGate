import { Html, Body, Head, Heading, Container, Text, Link, Preview } from '@react-email/components'

interface VerificationEmailProps {
  verificationUrl: string
}

export default function VerificationEmail({ verificationUrl }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email</Heading>
          <Text style={text}>
            Click the button below to verify your email address. This link expires in 15 minutes.
          </Text>
          <Link href={verificationUrl} style={button}>
            Verify Email
          </Link>
          <Text style={text}>
            If the button does not work, copy and paste this URL into your browser:
          </Text>
          <Text style={linkText}>{verificationUrl}</Text>
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

const linkText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  wordBreak: 'break-all' as const,
}
