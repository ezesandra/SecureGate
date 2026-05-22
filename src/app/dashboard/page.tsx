import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import styles from './page.module.css'
import LogoutButton from './LogoutButton'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard — SecureGate',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.emailVerified) {
    redirect('/verify-email/pending')
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backLink}>← Back to home</Link>
          <h1 className={styles.title}>Dashboard</h1>
        </div>
        <LogoutButton />
      </div>
      <div className={styles.card}>
        <h2 className={styles.subtitle}>Welcome back, {session.user.name || session.user.email}!</h2>
        <p className={styles.text}>This is a protected page. Your session is active.</p>
      </div>
    </main>
  )
}
