import Link from 'next/link'
import styles from './layout.module.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>← Back to home</Link>
      {children}
    </div>
  )
}
