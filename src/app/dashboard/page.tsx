import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
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
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-blue-400 hover:underline">
              &larr; Back to home
            </Link>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <LogoutButton />
        </div>
        <div className="rounded-lg bg-surface-card p-8 shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Welcome back, {session.user.name || session.user.email}!
          </h2>
          <p className="text-gray-400">This is a protected page. Your session is active.</p>
        </div>
      </div>
    </div>
  )
}
