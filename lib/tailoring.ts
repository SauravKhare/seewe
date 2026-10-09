import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from '@/lib/constants'
import { normalizeName } from '@/lib/id'
import type {
  MasterResumeData,
  Skill,
  TailoredResumeData,
} from '@/lib/types'

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
  }
}

export interface SkillGap {
  missingFromResume: string[]
  notInJob: string[]
}

/** Compares tailored skills against a job's skills, in both directions. */
export function computeGaps(
  data: TailoredResumeData,
  jobSkills: { name: string; required?: boolean }[],
): SkillGap {
  const resumeNames = new Set(data.skills.map((s) => normalizeName(s.name)))
  const jobNames = new Set(jobSkills.map((s) => normalizeName(s.name)))

  const missingFromResume: string[] = []
  for (const skill of jobSkills) {
    if (!resumeNames.has(normalizeName(skill.name))) {
      missingFromResume.push(skill.name)
    }
  }

  const notInJob: string[] = []
  for (const skill of data.skills) {
    if (!jobNames.has(normalizeName(skill.name))) notInJob.push(skill.name)
  }

  const dedupe = (names: string[]) => [...new Set(names)]
  return {
    missingFromResume: dedupe(missingFromResume),
    notInJob: dedupe(notInJob),
  }
}
