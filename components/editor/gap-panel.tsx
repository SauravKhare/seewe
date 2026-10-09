'use client'

import { Plus } from 'lucide-react'

import { SectionLabel } from '@/components/app/section-label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function GapRow({
  name,
  label,
  required,
  onInsert,
}: {
  name: string
  label: string
  required: boolean
  onInsert: (name: string) => void
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-md border px-2 py-1.5',
        required
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-border bg-muted/30',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          required ? 'bg-destructive' : 'bg-muted-foreground',
        )}
      />
      <span className="flex-1 font-mono text-xs">{name}</span>
      <span
        className={cn(
          'text-[10px] font-medium tracking-wide uppercase',
          required ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => onInsert(name)}
      >
        <Plus className="size-3" /> Insert
      </Button>
    </li>
  )
}

export function GapPanel({
  missingRequired,
  missingOptional,
  notInJob,
  onInsert,
  className,
}: {
  missingRequired: string[]
  missingOptional: string[]
  notInJob: string[]
  onInsert: (name: string) => void
  className?: string
}) {
  const missing = missingRequired.length + missingOptional.length

  return (
    <div className={cn('space-y-5', className)}>
      <div>
        <SectionLabel>Missing from your resume</SectionLabel>
        {missing === 0 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Every job skill is covered.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {missingRequired.map((name) => (
              <GapRow
                key={name}
                name={name}
                label="Required"
                required
                onInsert={onInsert}
              />
            ))}
            {missingOptional.map((name) => (
              <GapRow
                key={name}
                name={name}
                label="Optional"
                required={false}
                onInsert={onInsert}
              />
            ))}
          </ul>
        )}
      </div>

      <div>
        <SectionLabel>Not in this job</SectionLabel>
        {notInJob.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-xs">No extra skills.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {notInJob.map((name) => (
              <li
                key={name}
                className="text-muted-foreground rounded-full border px-2 py-0.5 font-mono text-[11px]"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
