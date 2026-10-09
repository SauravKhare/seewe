'use client'

import { useEffect, useMemo, useState } from 'react'

import { ResumePaper } from '@/components/app/resume-paper'
import { SectionLabel } from '@/components/app/section-label'
import { SegmentedControl } from '@/components/app/segmented-control'
import { renderAtsText } from '@/lib/resume'
import type { TailoredResumeData } from '@/lib/types'
import { cn } from '@/lib/utils'

type Mode = 'visual' | 'ats'

const OPTIONS = [
  { label: 'Visual', value: 'visual' as const },
  { label: 'ATS text', value: 'ats' as const },
]

export function AtsParsePanel({
  data,
  label = 'Resume preview',
  autoReveal = false,
  className,
}: {
  data: TailoredResumeData
  label?: string
  autoReveal?: boolean
  className?: string
}) {
  const [mode, setMode] = useState<Mode>('visual')
  const atsText = useMemo(() => renderAtsText(data), [data])

  useEffect(() => {
    if (!autoReveal) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const toAts = setTimeout(() => setMode('ats'), 900)
    const toVisual = setTimeout(() => setMode('visual'), 2600)
    return () => {
      clearTimeout(toAts)
      clearTimeout(toVisual)
    }
  }, [autoReveal])

  return (
    <div
      data-slot="ats-parse-panel"
      className={cn(
        'bg-card rounded-md border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.03)]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>{label}</SectionLabel>
        <SegmentedControl
          options={OPTIONS}
          value={mode}
          onChange={setMode}
          ariaLabel="Resume preview mode"
        />
      </div>

      {mode === 'visual' ? (
        <ResumePaper data={data} className="mt-4 min-h-[330px]" />
      ) : (
        <pre className="mt-4 min-h-[330px] overflow-auto rounded-md bg-neutral-900 p-5 font-mono text-xs leading-relaxed text-lime-100">
          {atsText}
        </pre>
      )}

      <p className="text-muted-foreground flex items-center gap-1.5 pt-3 text-[11px]">
        <span aria-hidden className="bg-status-applied size-1.5 rounded-full" />
        Parsed as plain text
        <span className="font-mono">
          · {atsText.split(/\s+/).filter(Boolean).length} words
        </span>
      </p>
    </div>
  )
}
