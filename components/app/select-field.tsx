import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
  placeholder?: string
  className?: string
  'aria-label'?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full appearance-none rounded-lg border bg-transparent px-2.5 pr-8 text-sm outline-none focus-visible:ring-3"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
    </div>
  )
}
