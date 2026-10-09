import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-focus text-xs font-medium tracking-[0.08em] uppercase">
        404
      </p>
      <h1 className="text-xl font-semibold">We couldn’t find that</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The job, company, or page you’re looking for isn’t here.
      </p>
      <Button size="sm" render={<Link href="/dashboard" />}>
        Back to dashboard
      </Button>
    </div>
  )
}
