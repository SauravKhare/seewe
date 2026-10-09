import { ResumePaper } from '@/components/app/resume-paper'
import { SectionLabel } from '@/components/app/section-label'
import type { TailoredResumeData } from '@/lib/types'
import { cn } from '@/lib/utils'

/** A labelled card wrapping the resume preview (visual only). */
export function ResumePreviewCard({
  data,
  label = 'Resume preview',
  compact = false,
  className,
}: {
  data: TailoredResumeData
  label?: string
  compact?: boolean
  className?: string
}) {
  return (
    <div
      data-slot="resume-preview-card"
      className={cn(
        'bg-card rounded-md border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.03)]',
        className,
      )}
    >
      <SectionLabel>{label}</SectionLabel>
      <ResumePaper data={data} compact={compact} className="mt-4" />
    </div>
  )
}
