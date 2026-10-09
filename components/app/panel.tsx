import { cn } from '@/lib/utils'

export function Panel({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      data-slot="panel"
      className={cn('bg-card text-card-foreground rounded-md border', className)}
      {...props}
    />
  )
}

export function PanelHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="panel-header"
      className={cn('flex items-start justify-between gap-4', className)}
    >
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  )
}
