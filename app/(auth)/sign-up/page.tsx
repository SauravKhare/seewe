import { Suspense } from 'react'
import type { Metadata } from 'next'

import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Create account — seewe',
  description: 'Create your seewe account and build your master resume.',
}

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  )
}
