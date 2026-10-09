import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
} from '@/lib/constants'
import { normalizeName } from '@/lib/id'
import type {
  ListKey,
  MasterResumeData,
  RemovedItems,
  Skill,
  TailoredResumeData,
} from '@/lib/types'

export function emptyRemoved(): RemovedItems {
  return {
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  }
}

/**
 * Moves one row out of a section into the removed tray. Returns the same
 * snapshot so callers can hand it straight to the editor.
 */
export function removeItem<K extends ListKey>(
  data: TailoredResumeData,
  section: K,
  item: RemovedItems[K][number],
): TailoredResumeData {
  const removed = { ...emptyRemoved(), ...data.removed }
  const source = data[section] as unknown as RemovedItems[K]

  return {
    ...data,
    [section]: source.filter((entry) => entry !== item),
    removed: {
      ...removed,
      [section]: [...removed[section], item],
    },
  }
}

/** Puts a row from the removed tray back into its section. */
export function restoreItem<K extends ListKey>(
  data: TailoredResumeData,
  section: K,
  item: RemovedItems[K][number],
): TailoredResumeData {
  const removed = { ...emptyRemoved(), ...data.removed }
  const source = data[section] as unknown as RemovedItems[K]

  return {
    ...data,
    [section]: [...source, item],
    removed: {
      ...removed,
      [section]: removed[section].filter((entry) => entry !== item),
    },
  }
}

/** Builds a fresh tailored snapshot from the current master resume. */
export function tailoredFromMaster(
  master: MasterResumeData,
  skills: Skill[],
): TailoredResumeData {
  const skillName = (id: string) =>
    skills.find((skill) => skill.id === id)?.name ?? 'Unknown'

  return {
    headline: master.resume.headline,
    summary: master.resume.summary,
    contact: { ...master.resume.contact },
    experience: master.experience.map((item) => ({
      company: item.company,
      title: item.title,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      bullets: [...item.bullets],
    })),
    education: master.education.map((item) => ({
      school: item.school,
      degree: item.degree,
      field: item.field,
      startDate: item.startDate,
      endDate: item.endDate,
      gpa: item.gpa,
    })),
    skills: master.skills.map((item) => ({
      name: skillName(item.skillId),
      category: item.category,
      level: item.level,
    })),
    projects: master.projects.map((item) => ({
      name: item.name,
      description: item.description,
      techStack: [...item.techStack],
      link: item.link,
    })),
    certifications: master.certifications.map((item) => ({
      name: item.name,
      issuer: item.issuer,
      issuedDate: item.issuedDate,
      link: item.link,
    })),
    languages: master.languages.map((item) => ({
      name: item.name,
      proficiency: item.proficiency,
    })),
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
    removed: emptyRemoved(),
  }
}

export interface SkillGap {
  /** Job skills marked required that the resume does not cover. */
  missingRequired: string[]
  /** Job skills marked optional that the resume does not cover. */
  missingOptional: string[]
  /** Resume skills the job description never mentions. */
  notInJob: string[]
}

/** True when the master resume has enough content to tailor from. */
export function hasMaster(master: MasterResumeData): boolean {
  const resume = master.resume
  return Boolean(
    resume.headline.trim() ||
    resume.summary.trim() ||
    master.experience.length ||
    master.education.length ||
    master.skills.length ||
    master.projects.length ||
    master.certifications.length ||
    master.languages.length,
  )
}

/** Compares tailored skills against a job's skills, in both directions. */
export function computeGaps(
  data: TailoredResumeData,
  jobSkills: { name: string; required?: boolean }[],
): SkillGap {
  const resumeNames = new Set(data.skills.map((s) => normalizeName(s.name)))
  const jobNames = new Set(jobSkills.map((s) => normalizeName(s.name)))

  const missingRequired: string[] = []
  const missingOptional: string[] = []
  for (const skill of jobSkills) {
    if (resumeNames.has(normalizeName(skill.name))) continue
    if (skill.required) missingRequired.push(skill.name)
    else missingOptional.push(skill.name)
  }

  const notInJob: string[] = []
  for (const skill of data.skills) {
    if (!jobNames.has(normalizeName(skill.name))) notInJob.push(skill.name)
  }

  const dedupe = (names: string[]) => [...new Set(names)]
  return {
    missingRequired: dedupe(missingRequired),
    missingOptional: dedupe(missingOptional),
    notInJob: dedupe(notInJob),
  }
}
