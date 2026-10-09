import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MarketingNav() {
  return (
    <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-[-0.07em]">
          seewe<span className="text-focus">.</span>
        </Link>
        <div className="text-muted-foreground flex items-center gap-6 text-sm">
          <a
            href="#product"
            className="hover:text-foreground hidden transition-colors md:inline"
          >
            Product
          </a>
          <a
            href="#how"
            className="hover:text-foreground hidden transition-colors md:inline"
          >
            How it works
          </a>
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  )
}
