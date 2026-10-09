'use client'

import { Plus } from 'lucide-react'

import { SectionLabel } from '@/components/app/section-label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function GapPanel({
  missingFromResume,
  notInJob,
  onInsert,
  className,
}: {
  missingFromResume: string[]
  notInJob: string[]
  onInsert: (name: string) => void
  className?: string
}) {
  return (
    <div className={cn('space-y-5', className)}>
      <div>
        <SectionLabel>Missing from your resume</SectionLabel>
        {missingFromResume.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Every job skill is covered.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {missingFromResume.map((name) => (
              <li
                key={name}
                className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5"
              >
                <span
                  aria-hidden
                  className="bg-destructive size-1.5 rounded-full"
                />
                <span className="flex-1 font-mono text-xs">{name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onInsert(name)}
                >
                  <Plus className="size-3" /> Insert
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <SectionLabel>Not in this job</SectionLabel>
        {notInJob.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            No extra skills.
          </p>
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
