import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Link href="/" className="absolute left-6 top-6 text-sm text-blue-400 hover:underline">
        &larr; Back to home
      </Link>
      {children}
    </div>
  )
}
