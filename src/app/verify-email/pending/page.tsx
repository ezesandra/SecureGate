import styles from './page.module.css'

export default function VerifyEmailPendingPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.text}>
          We've sent a verification link to your email address. Please click the link to activate your account.
        </p>
      </div>
    </main>
  )
}
