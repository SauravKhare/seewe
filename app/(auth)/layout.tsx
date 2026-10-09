import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-20">
      <Link href="/" className="text-lg font-bold tracking-[-0.06em]">
        seewe<span className="text-focus">.</span>
      </Link>
      <div className="mt-8 w-full max-w-sm">{children}</div>
    </div>
  )
}
