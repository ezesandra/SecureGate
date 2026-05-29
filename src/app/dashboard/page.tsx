import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
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

  const initials = (session.user.name || session.user.email || 'U')
    .split(' ')
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = new Date(session.user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Profile card */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-surface-card to-surface">
        <div className="h-20 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent" />
        <div className="relative -mt-10 flex flex-col items-start gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/25">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              {session.user.name || 'User'}
            </h2>
            <p className="text-sm text-gray-400">{session.user.email}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Member since {memberSince}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-medium text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/5 bg-surface-card p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">Email verified</p>
          <p className="mt-0.5 text-xs text-gray-500">Your email is confirmed</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-surface-card p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7a9 9 0 11-14.728 0A9 9 0 0121 5.364" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">Two-factor auth</p>
          <p className="mt-0.5 text-xs text-amber-400/80">Not enabled</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-surface-card p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">Password</p>
          <p className="mt-0.5 text-xs text-gray-500">Last changed recently</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-white/5 bg-surface-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Quick actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/forgot-password"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-white/20 hover:bg-white/5"
          >
            Change password
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-white/20 hover:bg-white/5"
          >
            Account settings
          </Link>
        </div>
      </div>

      {/* Session info */}
      <details className="group rounded-xl border border-white/5 bg-surface-card">
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-gray-400 transition-colors hover:text-white">
          Session details
          <svg
            className="h-4 w-4 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-white/5 px-6 py-4">
          <pre className="overflow-x-auto text-xs text-gray-500">
            {JSON.stringify(session.user, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  )
}
