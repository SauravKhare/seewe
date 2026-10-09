import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>
          seewe<span className="text-focus">.</span> — tailor your resume before
          the machine reads it.
        </span>
        <span className="flex gap-5">
          <Link href="/sign-in" className="hover:text-foreground">
            Sign in
          </Link>
          <Link href="/sign-up" className="hover:text-foreground">
            Start free
          </Link>
        </span>
      </div>
    </footer>
  )
}
