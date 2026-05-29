interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info'
  children: React.ReactNode
  onClose?: () => void
}

const variants = {
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
}

export default function Alert({ variant = 'error', children, onClose }: AlertProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${variants[variant]}`}
      role="alert"
      aria-live="polite"
    >
      <span className="flex-1">{children}</span>
      {onClose && (
        <button
          className="text-current opacity-70 hover:opacity-100"
          onClick={onClose}
          aria-label="Dismiss"
        >
          &times;
        </button>
      )}
    </div>
  )
}
