import { formatDateRange } from '@/lib/format'
import type { ResumeSectionKey, TailoredResumeData } from '@/lib/types'

function contactText(data: TailoredResumeData): string | null {
  const c = data.contact
  const parts = [c.email, c.phone, c.location, c.linkedin, c.github, c.website]
    .filter(Boolean)
    .join(' | ')
  const lines: string[] = []
  if (c.fullName) lines.push(c.fullName.toUpperCase())
  if (parts) lines.push(parts)
  return lines.length ? lines.join('\n') : null
}

function sectionText(
  key: ResumeSectionKey,
  data: TailoredResumeData,
): string | null {
  switch (key) {
    case 'summary':
      return data.summary ? `SUMMARY\n${data.summary}` : null

    case 'experience': {
      if (!data.experience.length) return null
      const entries = data.experience.map((item) => {
        const head = [item.title, item.company].filter(Boolean).join(' | ')
        const range = formatDateRange(item.startDate, item.endDate, item.current)
        const lines = [head]
        if (range) lines.push(range)
        if (item.location) lines.push(item.location)
        lines.push(...item.bullets.map((bullet) => `- ${bullet}`))
        return lines.join('\n')
      })
      return `EXPERIENCE\n${entries.join('\n\n')}`
    }

    case 'education': {
      if (!data.education.length) return null
      const entries = data.education.map((item) => {
        const head = [item.degree, item.school].filter(Boolean).join(' — ')
        const range = formatDateRange(item.startDate, item.endDate)
        const lines = [head]
        if (range) lines.push(range)
        if (item.gpa) lines.push(`GPA ${item.gpa}`)
        return lines.join('\n')
      })
      return `EDUCATION\n${entries.join('\n\n')}`
    }

    case 'skills': {
      if (!data.skills.length) return null
      const groups = new Map<string, string[]>()
      for (const skill of data.skills) {
        const group = skill.category ?? 'Core'
        groups.set(group, [...(groups.get(group) ?? []), skill.name])
      }
      const lines = [...groups.entries()].map(
        ([group, names]) => `${group}: ${names.join(', ')}`,
      )
      return `SKILLS\n${lines.join('\n')}`
    }

    case 'projects': {
      if (!data.projects.length) return null
      const entries = data.projects.map((item) => {
        const lines = [item.name]
        if (item.description) lines.push(item.description)
        if (item.techStack.length) lines.push(item.techStack.join(', '))
        if (item.link) lines.push(item.link)
        return lines.join('\n')
      })
      return `PROJECTS\n${entries.join('\n\n')}`
    }

    case 'certifications': {
      if (!data.certifications.length) return null
      const entries = data.certifications.map((item) =>
        [item.name, item.issuer].filter(Boolean).join(' — '),
      )
      return `CERTIFICATIONS\n${entries.join('\n')}`
    }

    case 'languages': {
      if (!data.languages.length) return null
      const entries = data.languages.map((item) =>
        item.proficiency ? `${item.name} (${item.proficiency})` : item.name,
      )
      return `LANGUAGES\n${entries.join(', ')}`
    }

    default:
      return null
  }
}

/** Renders a tailored snapshot as the exact plain text an ATS parser reads. */
export function renderAtsText(data: TailoredResumeData): string {
  const parts: string[] = []

  if (data.sectionVisibility.contact !== false) {
    const contact = contactText(data)
    if (contact) parts.push(contact)
  }

  for (const key of data.sectionOrder) {
    if (key === 'contact' || data.sectionVisibility[key] === false) continue
    const text = sectionText(key, data)
    if (text) parts.push(text)
  }

  return parts.join('\n\n')
}
