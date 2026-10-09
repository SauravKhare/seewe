import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-focus text-xs font-medium tracking-[0.08em] uppercase">
        404
      </p>
      <h1 className="text-xl font-semibold">This page doesn’t exist</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The link may be broken, or the page may have moved.
      </p>
      <Button size="sm" render={<Link href="/" />}>
        Back to home
      </Button>
    </main>
  )
}
