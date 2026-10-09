import { Sidebar } from '@/components/app/sidebar'
import { Topbar } from '@/components/app/topbar'
import { cn } from '@/lib/utils'

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="bg-background hidden w-60 shrink-0 border-r lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className={cn('mx-auto w-full max-w-6xl flex-1 p-4 lg:p-8', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
