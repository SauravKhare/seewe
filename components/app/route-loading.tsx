import { Skeleton } from '@/components/ui/skeleton'

export function RouteLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
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
