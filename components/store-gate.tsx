'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/data/store'

/**
 * Blocks store-backed screens until the persisted store has rehydrated, so
 * component initializers never read the seed instead of the user's data.
 */
export function StoreGate({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const hydrated = useAppStore((state) => state.hydrated)

  if (!hydrated) return <>{fallback ?? <StoreSkeleton />}</>
  return <>{children}</>
}

function StoreSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your data…</span>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-md" />
    </div>
  )
}
