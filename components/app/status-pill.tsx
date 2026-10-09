import { STATUS_DOT_CLASS, STATUS_LABELS } from '@/lib/constants'
import type { ApplicationStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

export function StatusPill({
  status,
  className,
}: {
  status: ApplicationStatus
  className?: string
}) {
  return (
    <span
      data-slot="status-pill"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('size-1.5 rounded-full', STATUS_DOT_CLASS[status])}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}
