import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>SecureGate</h1>
        <p className={styles.description}>
          A clean, minimal landing page for your secure authentication flow.
          Click Get Started to begin with signup and access control.
        </p>
        <div className={styles.cta}>
          <Link className={styles.primary} href="/signup">
            Get Started
          </Link>
          <Link className={styles.secondary} href="/login">
            Log in
          </Link>
        </div>
      </main>
    </div>
  );
}
