'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800/50',
    secondary:
      'border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50',
    ghost:
      'text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
