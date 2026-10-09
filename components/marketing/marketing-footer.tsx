import Link from 'next/link'

import { ThemeSwitch } from '@/components/marketing/theme-switch'

export function MarketingFooter() {
  return (
    <footer className="bg-muted border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="text-xl font-bold tracking-[-0.07em]">
            seewe<span className="text-focus">.</span>
          </span>
          <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
            Tailor your resume before the machine reads it. Built for the
            careful job search.
          </p>
        </div>
        <nav className="text-muted-foreground flex items-center gap-5 text-xs">
          <Link href="/sign-in" className="hover:text-foreground">
            Sign in
          </Link>
          <Link href="/sign-up" className="hover:text-foreground">
            Start free
          </Link>
          <ThemeSwitch />
        </nav>
      </div>
    </footer>
  )
}
