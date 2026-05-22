'use client'

import { signOut } from 'next-auth/react'
import Button from '@/components/ui/Button/Button'

export default function LogoutButton() {
  return (
    <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/login' })}>
      Log out
    </Button>
  )
}
