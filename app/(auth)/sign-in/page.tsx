import { Suspense } from 'react'
import type { Metadata } from 'next'

import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Sign in — seewe',
  description: 'Sign in to tailor your resume before the machine reads it.',
}

export default function SignInPage() {
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  )
}
