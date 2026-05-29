import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export default async function proxy(req: NextRequest) {
  const token = await getToken({ req })

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (!token.emailVerified) {
    const url = new URL('/verify-email/pending', req.url)
    url.searchParams.set('email', token.email as string)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
