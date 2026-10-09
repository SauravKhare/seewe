import { formatDateRange } from '@/lib/format'
import type { ResumeSectionKey, TailoredResumeData } from '@/lib/types'

/**
 * Visual resume model shared by the DOM preview (`ResumePaper`) and the PDF
 * renderer (`AtsDocument`). Keeping one builder guarantees the on-screen
 * preview matches the exported document.
 */

export interface VisualEntry {
  /** Bold lead line, e.g. "Publicis Sapient, Senior Engineer". */
  head?: string
  /** Muted supporting line, e.g. "Aug 2024 – Present | Pune, India". */
  meta?: string
  /** Normal body copy. */
  body?: string
  /** Hanging-indent bullet points. */
  bullets?: string[]
  /** Additional normal lines. */
  lines?: string[]
}

export interface VisualSection {
  key: ResumeSectionKey
  heading: string
  entries: VisualEntry[]
}

export interface ResumeVisual {
  name: string
  headline: string
  contact: string
  left: VisualSection[]
  right: VisualSection[]
}

const HEADINGS: Record<ResumeSectionKey, string> = {
  summary: 'Profile',
  contact: 'Contact',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
}

/** Sections that belong on the left by default; the rest start on the right. */
const ANCHOR_LEFT: ResumeSectionKey[] = ['summary', 'experience']
/** Sections that may move between columns to balance the page. */
const MOVABLE: ResumeSectionKey[] = [
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

function buildExperience(data: TailoredResumeData): VisualEntry[] {
  return data.experience.map((item) => ({
    head: [item.company, item.title].filter(Boolean).join(', '),
    meta:
      [
        formatDateRange(item.startDate, item.endDate, item.current),
        item.location,
      ]
        .filter(Boolean)
        .join(' | ') || undefined,
    bullets: item.bullets.filter(Boolean),
  }))
}

function buildEducation(data: TailoredResumeData): VisualEntry[] {
  return data.education.map((item) => ({
    head: [item.degree, item.school].filter(Boolean).join(', '),
    meta: formatDateRange(item.startDate, item.endDate) || undefined,
    lines: item.gpa ? [`GPA ${item.gpa}`] : undefined,
  }))
}

function buildSkills(data: TailoredResumeData): VisualEntry[] {
  const groups = new Map<string, string[]>()
  for (const skill of data.skills) {
    const group = skill.category ?? 'Core'
    groups.set(group, [...(groups.get(group) ?? []), skill.name])
  }
  return [...groups.entries()].map(([group, names]) => ({
    head: group,
    lines: [names.join(', ')],
  }))
}

function buildProjects(data: TailoredResumeData): VisualEntry[] {
  return data.projects.map((item) => ({
    head: item.name,
    body: item.description || undefined,
    lines: [item.techStack.join(', '), item.link].filter(Boolean) as string[],
  }))
}

function buildCertifications(data: TailoredResumeData): VisualEntry[] {
  return data.certifications.map((item) => ({
    lines: [
      [item.name, item.issuer].filter(Boolean).join(' — '),
      item.issuedDate,
    ].filter(Boolean) as string[],
  }))
}

function buildLanguages(data: TailoredResumeData): VisualEntry[] {
  return data.languages.map((item) => ({
    lines: [
      item.proficiency ? `${item.name} (${item.proficiency})` : item.name,
    ],
  }))
}

function buildSection(
  key: ResumeSectionKey,
  data: TailoredResumeData,
): VisualSection | null {
  const heading = HEADINGS[key]
  switch (key) {
    case 'summary':
      return data.summary
        ? { key, heading, entries: [{ body: data.summary }] }
        : null
    case 'experience':
      return data.experience.length
        ? { key, heading, entries: buildExperience(data) }
        : null
    case 'education':
      return data.education.length
        ? { key, heading, entries: buildEducation(data) }
        : null
    case 'skills':
      return data.skills.length
        ? { key, heading, entries: buildSkills(data) }
        : null
    case 'projects':
      return data.projects.length
        ? { key, heading, entries: buildProjects(data) }
        : null
    case 'certifications':
      return data.certifications.length
        ? { key, heading, entries: buildCertifications(data) }
        : null
    case 'languages':
      return data.languages.length
        ? { key, heading, entries: buildLanguages(data) }
        : null
    default:
      return null
  }
}

/** Rough rendered-height score used only to balance the two columns. */
function sectionWeight(section: VisualSection): number {
  const body = section.entries.reduce((total, entry) => {
    const bodyLines = entry.body
      ? Math.min(6, Math.ceil(entry.body.length / 72))
      : 0
    return (
      total +
      1 +
      (entry.head ? 1 : 0) +
      (entry.meta ? 1 : 0) +
      bodyLines +
      (entry.bullets?.length ?? 0) * 1.1 +
      (entry.lines?.length ?? 0) * 0.9
    )
  }, 0)
  return body + 2
}

/**
 * Splits visible sections across two columns. Summary and Experience anchor
 * left; the remaining sections start on the right and the smallest movable
 * sections migrate to keep the two columns roughly even. Within each column
 * the user's `sectionOrder` is preserved.
 */
function balanceColumns(sections: VisualSection[]): {
  left: VisualSection[]
  right: VisualSection[]
} {
  const rank = new Map(sections.map((section, index) => [section.key, index]))

  const left = sections.filter((s) => ANCHOR_LEFT.includes(s.key))
  const right = sections.filter((s) => !ANCHOR_LEFT.includes(s.key))

  let leftWeight = left.reduce((sum, s) => sum + sectionWeight(s), 0)
  let rightWeight = right.reduce((sum, s) => sum + sectionWeight(s), 0)

  const threshold = 6
  let guard = sections.length + 2
  while (Math.abs(leftWeight - rightWeight) > threshold && guard-- > 0) {
    const heaviest = leftWeight > rightWeight ? left : right
    const lightest = leftWeight > rightWeight ? right : left
    const candidates = heaviest
      .filter((s) => MOVABLE.includes(s.key))
      .sort((a, b) => sectionWeight(a) - sectionWeight(b))
    if (!candidates.length) break
    const move = candidates[0]
    heaviest.splice(heaviest.indexOf(move), 1)
    lightest.push(move)
    leftWeight = left.reduce((sum, s) => sum + sectionWeight(s), 0)
    rightWeight = right.reduce((sum, s) => sum + sectionWeight(s), 0)
  }

  const byOrder = (a: VisualSection, b: VisualSection) =>
    (rank.get(a.key) ?? 0) - (rank.get(b.key) ?? 0)
  return { left: left.sort(byOrder), right: right.sort(byOrder) }
}

function compactSection(section: VisualSection): VisualSection {
  if (section.key === 'experience') {
    return {
      ...section,
      entries: section.entries.slice(0, 1).map((entry) => ({
        ...entry,
        bullets: entry.bullets?.slice(0, 2),
      })),
    }
  }
  return section
}

export interface BuildResumeOptions {
  /** Landing card: Experience + Skills only, first role, max two bullets. */
  compact?: boolean
}

export function buildResumeVisual(
  data: TailoredResumeData,
  { compact = false }: BuildResumeOptions = {},
): ResumeVisual {
  const c = data.contact
  const contact = [
    c.email,
    c.phone,
    c.location,
    c.linkedin,
    c.github,
    c.website,
  ]
    .filter(Boolean)
    .join('  ·  ')

  let sections: VisualSection[] = []
  for (const key of data.sectionOrder) {
    if (key === 'contact' || data.sectionVisibility[key] === false) continue
    const section = buildSection(key, data)
    if (section && section.entries.length) sections.push(section)
  }

  if (compact) {
    sections = sections
      .filter(
        (section) => section.key === 'experience' || section.key === 'skills',
      )
      .map(compactSection)
  }

  const { left, right } = balanceColumns(sections)

  return {
    name: c.fullName ?? '',
    headline: data.headline ?? '',
    contact,
    left,
    right,
  }
}
