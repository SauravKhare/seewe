import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export function StatCard({
  label,
  count,
  dotClass,
  onClick,
  className,
}: {
  label: string
  count: number | string
  dotClass: string
  onClick?: () => void
  className?: string
}) {
  const display =
    typeof count === 'number' ? String(count).padStart(2, '0') : count

  const content = (
    <>
      <span aria-hidden className={cn('size-2 rounded-full', dotClass)} />
      <span className="text-muted-foreground text-xs">{label}</span>
      <strong className="text-lg font-semibold tabular-nums">{display}</strong>
      {onClick ? (
        <ArrowRight className="text-muted-foreground ml-auto size-3.5" />
      ) : null}
    </>
  )

  const shared = cn(
    'bg-card flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left',
    className,
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          shared,
          'hover:bg-muted/50 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        {content}
      </button>
    )
  }

  return <div className={shared}>{content}</div>
}
