import styles from './FormError.module.css'

interface FormErrorProps {
  id: string
  message: string
}

export default function FormError({ id, message }: FormErrorProps) {
  return (
    <span id={id} className={styles.error} role="alert">
      {message}
    </span>
  )
}
