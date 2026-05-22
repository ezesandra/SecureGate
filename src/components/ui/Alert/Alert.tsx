import styles from './Alert.module.css'

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info'
  children: React.ReactNode
  onClose?: () => void
}

export default function Alert({ variant = 'error', children, onClose }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role="alert" aria-live="polite">
      <span className={styles.icon} aria-hidden="true" />
      <span>{children}</span>
      {onClose && (
        <button className={styles.close} onClick={onClose} aria-label="Dismiss">
          &times;
        </button>
      )}
    </div>
  )
}
