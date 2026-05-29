import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <main className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">SecureGate</h1>
        <p className="mb-8 text-gray-400">
          A production-ready authentication system. Click Get Started to create your account.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white text-center transition-colors hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 text-center transition-colors hover:bg-gray-800"
          >
            Log in
          </Link>
        </div>
      </main>
    </div>
  )
}
