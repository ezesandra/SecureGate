interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
}

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-white/30 border-t-white ${sizes[size]}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </span>
  )
}
