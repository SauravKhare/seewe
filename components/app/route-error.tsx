'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground text-sm">
        {error.message || 'An unexpected error interrupted this screen.'}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={reset}>
          <RotateCcw /> Try again
        </Button>
        <Button size="sm" variant="outline" render={<Link href="/dashboard" />}>
          Go to dashboard
        </Button>
      </div>
    </div>
  )
}
