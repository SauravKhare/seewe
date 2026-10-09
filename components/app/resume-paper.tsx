import { formatDateRange } from '@/lib/format'
import type { ResumeSectionKey, TailoredResumeData } from '@/lib/types'
import { cn } from '@/lib/utils'

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="mt-5 mb-2 text-[10px] font-semibold tracking-[0.1em] uppercase">
      {children}
    </h5>
  )
}

function Section({
  sectionKey,
  data,
}: {
  sectionKey: ResumeSectionKey
  data: TailoredResumeData
}) {
  switch (sectionKey) {
    case 'summary':
      return data.summary ? (
        <>
          <Heading>Summary</Heading>
          <p className="text-muted-foreground text-xs">{data.summary}</p>
        </>
      ) : null

    case 'experience':
      if (!data.experience.length) return null
      return (
        <>
          <Heading>Experience</Heading>
          <div className="space-y-3">
            {data.experience.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-baseline justify-between gap-4 text-xs">
                  <strong>{item.title}</strong>
                  <span className="text-muted-foreground shrink-0">
                    {formatDateRange(item.startDate, item.endDate, item.current)}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {[item.company, item.location].filter(Boolean).join(' · ')}
                </p>
                <ul className="text-muted-foreground space-y-0.5 text-xs">
                  {item.bullets.map((bullet, i) => (
                    <li key={i}>- {bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )

    case 'education':
      if (!data.education.length) return null
      return (
        <>
          <Heading>Education</Heading>
          <div className="space-y-2">
            {data.education.map((item, index) => (
              <div key={index} className="text-xs">
                <strong>
                  {[item.degree, item.school].filter(Boolean).join(' — ')}
                </strong>
                <span className="text-muted-foreground block">
                  {formatDateRange(item.startDate, item.endDate)}
                </span>
              </div>
            ))}
          </div>
        </>
      )

    case 'skills':
      if (!data.skills.length) return null
      return (
        <>
          <Heading>Skills</Heading>
          <p className="text-muted-foreground text-xs">
            {data.skills.map((skill) => skill.name).join(' · ')}
          </p>
        </>
      )

    case 'projects':
      if (!data.projects.length) return null
      return (
        <>
          <Heading>Projects</Heading>
          <div className="space-y-2">
            {data.projects.map((item, index) => (
              <div key={index} className="text-xs">
                <strong>{item.name}</strong>
                {item.description ? (
                  <span className="text-muted-foreground block">
                    {item.description}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )

    case 'certifications':
      if (!data.certifications.length) return null
      return (
        <>
          <Heading>Certifications</Heading>
          <p className="text-muted-foreground text-xs">
            {data.certifications
              .map((item) => [item.name, item.issuer].filter(Boolean).join(' — '))
              .join(' · ')}
          </p>
        </>
      )

    case 'languages':
      if (!data.languages.length) return null
      return (
        <>
          <Heading>Languages</Heading>
          <p className="text-muted-foreground text-xs">
            {data.languages
              .map((item) =>
                item.proficiency ? `${item.name} (${item.proficiency})` : item.name,
              )
              .join(' · ')}
          </p>
        </>
      )

    default:
      return null
  }
}

export function ResumePaper({
  data,
  className,
}: {
  data: TailoredResumeData
  className?: string
}) {
  return (
    <article
      data-slot="resume-paper"
      className={cn('rounded-md border px-7 py-6', className)}
    >
      {data.sectionVisibility.contact !== false ? (
        <header className="space-y-1 pb-4">
          <h4 className="text-lg font-bold tracking-[-0.02em]">
            {data.contact.fullName}
          </h4>
          <p className="text-muted-foreground text-[11px]">
            {[
              data.contact.email,
              data.contact.phone,
              data.contact.location,
              data.contact.linkedin,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="border-t pt-0" />
        </header>
      ) : null}

      {data.sectionOrder.map((key) =>
        key === 'contact' || data.sectionVisibility[key] === false ? null : (
          <Section key={key} sectionKey={key} data={data} />
        ),
      )}
    </article>
  )
}
