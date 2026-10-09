import { cn } from '@/lib/utils'

export function SectionLabel({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="section-label"
      className={cn(
        'text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase',
        className,
      )}
      {...props}
    />
  )
}
