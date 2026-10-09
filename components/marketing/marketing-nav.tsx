import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MarketingNav() {
  return (
    <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-[-0.06em]">
          seewe<span className="text-focus">.</span>
        </Link>
        <div className="text-muted-foreground hidden items-center gap-7 text-sm md:flex">
          <a
            href="#product"
            className="hover:text-foreground transition-colors"
          >
            Product
          </a>
          <a href="#how" className="hover:text-foreground transition-colors">
            How it works
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Sign in
          </Link>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }))}>
            Start free
          </Link>
        </div>
      </nav>
    </header>
  )
}
