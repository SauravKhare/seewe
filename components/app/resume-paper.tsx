import {
  buildResumeVisual,
  type VisualEntry,
  type VisualSection,
} from '@/lib/resume'
import type { TailoredResumeData } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * DOM replica of the EB Garamond two-column resume template. Used for every
 * on-screen preview so what the user sees matches the exported PDF.
 */

function Entry({ entry }: { entry: VisualEntry }) {
  const inlineHead = !entry.meta && entry.lines?.length
  const trailingLines =
    entry.head && entry.lines?.length
      ? entry.lines.slice(entry.meta ? 0 : 1)
      : []
  return (
    <div className="mb-[0.6em]">
      {entry.head ? (
        <p className="text-[1em] leading-snug font-bold">
          {entry.head}
          {inlineHead ? (
            <span className="font-normal">: {entry.lines?.[0]}</span>
          ) : null}
        </p>
      ) : null}
      {entry.meta ? (
        <p className="text-[0.85em] leading-snug text-[#4a4a4a]">
          {entry.meta}
        </p>
      ) : null}
      {trailingLines.map((line, index) => (
        <p key={index} className="text-[0.95em] leading-snug">
          {line}
        </p>
      ))}
      {!entry.head && entry.lines
        ? entry.lines.map((line, index) => (
            <p key={index} className="text-[0.95em] leading-snug">
              {line}
            </p>
          ))
        : null}
      {entry.body ? (
        <p className="mt-[0.1em] text-[0.95em] leading-snug">{entry.body}</p>
      ) : null}
      {entry.bullets?.length ? (
        <ul className="mt-[0.15em] space-y-[0.15em]">
          {entry.bullets.map((bullet, index) => (
            <li
              key={index}
              className="flex gap-[0.5em] text-[0.95em] leading-snug"
            >
              <span aria-hidden className="w-[0.6em] shrink-0">
                •
              </span>
              <span className="flex-1">{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Section({ section }: { section: VisualSection }) {
  return (
    <section className="mb-[1.2em]">
      <h5 className="mb-[0.35em] border-b border-[#2b2b2b] pb-[0.2em] text-[0.95em] font-bold tracking-[0.12em] uppercase">
        {section.heading}
      </h5>
      {section.entries.map((entry, index) => (
        <Entry key={index} entry={entry} />
      ))}
    </section>
  )
}

export function ResumePaper({
  data,
  className,
  compact = false,
}: {
  data: TailoredResumeData
  className?: string
  compact?: boolean
}) {
  const doc = buildResumeVisual(data, { compact })

  return (
    <article
      data-slot="resume-paper"
      style={{ containerType: 'inline-size' }}
      className={cn(
        'overflow-hidden bg-white font-serif text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-black/10',
        className,
      )}
    >
      <div
        className="aspect-[210/297] w-full p-[8%]"
        style={{ fontSize: 'clamp(5.5px, 1.75cqw, 13px)' }}
      >
        <header className="mb-[1.2em]">
          <p className="text-[1.75em] leading-none font-bold tracking-[0.01em]">
            {doc.name}
            {doc.headline ? (
              <span className="ml-[0.6em] text-[0.62em] font-normal text-[#4a4a4a]">
                {doc.headline}
              </span>
            ) : null}
          </p>
          {doc.contact ? (
            <p className="mt-[0.4em] text-[0.85em] text-[#4a4a4a]">
              {doc.contact}
            </p>
          ) : null}
        </header>

        <div className="flex gap-[6%]">
          <div className="flex-[1.15]">
            {doc.left.map((section) => (
              <Section key={section.key} section={section} />
            ))}
          </div>
          <div className="flex-1">
            {doc.right.map((section) => (
              <Section key={section.key} section={section} />
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
