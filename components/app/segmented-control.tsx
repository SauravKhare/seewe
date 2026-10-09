'use client'

import { cn } from '@/lib/utils'

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: readonly { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center rounded-md border p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'focus-visible:ring-ring flex-1 rounded-[4px] px-2.5 py-1 text-center text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
