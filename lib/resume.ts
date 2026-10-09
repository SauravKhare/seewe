import { formatDateRange } from '@/lib/format'
import type { ResumeSectionKey, TailoredResumeData } from '@/lib/types'

export interface ResumeEntry {
  lines: string[]
  bullets: string[]
}

export interface ResumeSection {
  heading: string
  entries: ResumeEntry[]
  /** How entries are joined in plain-text (ATS) output. */
  separator: string
}

export interface ResumeContact {
  fullName?: string
  line?: string
}

/**
 * Structured representation of a tailored snapshot. Both the ATS plain-text
 * renderer and the PDF renderer consume this, so the two can never drift.
 */
export interface ResumeDocument {
  contact: ResumeContact | null
  sections: ResumeSection[]
}

function buildContact(data: TailoredResumeData): ResumeContact | null {
  const c = data.contact
  const line = [c.email, c.phone, c.location, c.linkedin, c.github, c.website]
    .filter(Boolean)
    .join(' | ')
  if (!c.fullName && !line) return null
  return { fullName: c.fullName, line: line || undefined }
}

function buildSection(
  key: ResumeSectionKey,
  data: TailoredResumeData,
): ResumeSection | null {
  switch (key) {
    case 'summary':
      return data.summary
        ? { heading: 'SUMMARY', separator: '\n\n', entries: [{ lines: [data.summary], bullets: [] }] }
        : null

    case 'experience': {
      if (!data.experience.length) return null
      return {
        heading: 'EXPERIENCE',
        separator: '\n\n',
        entries: data.experience.map((item) => {
          const lines: string[] = []
          const head = [item.title, item.company].filter(Boolean).join(' | ')
          if (head) lines.push(head)
          const range = formatDateRange(item.startDate, item.endDate, item.current)
          if (range) lines.push(range)
          if (item.location) lines.push(item.location)
          return { lines, bullets: item.bullets }
        }),
      }
    }

    case 'education': {
      if (!data.education.length) return null
      return {
        heading: 'EDUCATION',
        separator: '\n\n',
        entries: data.education.map((item) => {
          const lines: string[] = []
          const head = [item.degree, item.school].filter(Boolean).join(' — ')
          if (head) lines.push(head)
          const range = formatDateRange(item.startDate, item.endDate)
          if (range) lines.push(range)
          if (item.gpa) lines.push(`GPA ${item.gpa}`)
          return { lines, bullets: [] }
        }),
      }
    }

    case 'skills': {
      if (!data.skills.length) return null
      const groups = new Map<string, string[]>()
      for (const skill of data.skills) {
        const group = skill.category ?? 'Core'
        groups.set(group, [...(groups.get(group) ?? []), skill.name])
      }
      return {
        heading: 'SKILLS',
        separator: '\n',
        entries: [...groups.entries()].map(([group, names]) => ({
          lines: [`${group}: ${names.join(', ')}`],
          bullets: [],
        })),
      }
    }

    case 'projects': {
      if (!data.projects.length) return null
      return {
        heading: 'PROJECTS',
        separator: '\n\n',
        entries: data.projects.map((item) => {
          const lines = [item.name]
          if (item.description) lines.push(item.description)
          if (item.techStack.length) lines.push(item.techStack.join(', '))
          if (item.link) lines.push(item.link)
          return { lines, bullets: [] }
        }),
      }
    }

    case 'certifications': {
      if (!data.certifications.length) return null
      return {
        heading: 'CERTIFICATIONS',
        separator: '\n',
        entries: data.certifications.map((item) => ({
          lines: [[item.name, item.issuer].filter(Boolean).join(' — ')],
          bullets: [],
        })),
      }
    }

    case 'languages': {
      if (!data.languages.length) return null
      return {
        heading: 'LANGUAGES',
        separator: ', ',
        entries: data.languages.map((item) => ({
          lines: [item.proficiency ? `${item.name} (${item.proficiency})` : item.name],
          bullets: [],
        })),
      }
    }

    default:
      return null
  }
}

export function buildResumeDocument(data: TailoredResumeData): ResumeDocument {
  const contact =
    data.sectionVisibility.contact !== false ? buildContact(data) : null

  const sections: ResumeSection[] = []
  for (const key of data.sectionOrder) {
    if (key === 'contact' || data.sectionVisibility[key] === false) continue
    const section = buildSection(key, data)
    if (section && section.entries.length) sections.push(section)
  }

  return { contact, sections }
}

/** Renders a tailored snapshot as the exact plain text an ATS parser reads. */
export function renderAtsText(data: TailoredResumeData): string {
  const doc = buildResumeDocument(data)
  const parts: string[] = []

  if (doc.contact) {
    const lines = [
      doc.contact.fullName?.toUpperCase(),
      doc.contact.line,
    ].filter(Boolean) as string[]
    if (lines.length) parts.push(lines.join('\n'))
  }

  for (const section of doc.sections) {
    const body = section.entries
      .map((entry) =>
        [...entry.lines, ...entry.bullets.map((bullet) => `- ${bullet}`)].join(
          '\n',
        ),
      )
      .join(section.separator)
    parts.push(`${section.heading}\n${body}`)
  }

  return parts.join('\n\n')
}
