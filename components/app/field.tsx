import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label?: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="text-xs">
          {label}
        </Label>
      ) : null}
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}
