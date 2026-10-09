/**
 * Domain types for seewe.
 *
 * These mirror the Postgres schema in docs/DATABASE.md. They are used by the
 * static (Phase 1) local repository and will be shared with the Drizzle schema
 * and server repository in Phase 2.
 */

export type ID = string

export type ApplicationStatus =
  'saved' | 'applied' | 'heard_back' | 'interviewing' | 'rejected' | 'offer'

export type WorkMode = 'remote' | 'hybrid' | 'onsite'

export type EmploymentType =
  'full_time' | 'part_time' | 'contract' | 'internship'

export type SalaryPeriod = 'hourly' | 'monthly' | 'yearly'

export type SkillLevel = 'beginner' | 'working' | 'proficient' | 'expert'

export type JobSkillSource = 'manual'

export type InterviewType = 'phone' | 'technical' | 'onsite' | 'virtual'

export type AttachmentType = 'resume' | 'cover_letter' | 'jd'

export type ResumeSectionKey =
  | 'summary'
  | 'contact'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'

export interface ContactDetails {
  fullName?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  website?: string
  portfolio?: string
}

export interface Experience {
  id: ID
  resumeId: ID
  company: string
  title: string
  location?: string
  startDate?: string
  endDate?: string
  current: boolean
  bullets: string[]
  sortOrder: number
}

export interface Education {
  id: ID
  resumeId: ID
  school: string
  degree?: string
  field?: string
  startDate?: string
  endDate?: string
  gpa?: string
  sortOrder: number
}

export interface Project {
  id: ID
  resumeId: ID
  name: string
  description?: string
  techStack: string[]
  link?: string
  sortOrder: number
}

export interface Certification {
  id: ID
  resumeId: ID
  name: string
  issuer?: string
  issuedDate?: string
  link?: string
  sortOrder: number
}

export interface Language {
  id: ID
  resumeId: ID
  name: string
  proficiency?: string
  sortOrder: number
}

export interface Resume {
  id: ID
  userId: ID
  headline: string
  summary: string
  contact: ContactDetails
  templateId: string
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: ID
  name: string
  normalized: string
}

export interface ResumeSkill {
  id: ID
  resumeId: ID
  skillId: ID
  category?: string
  level?: SkillLevel
  sortOrder: number
}

export interface JobSkill {
  id: ID
  jobApplicationId: ID
  skillId: ID
  required: boolean
  source: JobSkillSource
}

export interface Company {
  id: ID
  userId: ID
  name: string
  normalizedName: string
  website?: string
  careersUrl?: string
  industry?: string
  size?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface JobApplication {
  id: ID
  userId: ID
  companyId: ID
  position: string
  jobUrl?: string
  jobDescription?: string
  location?: string
  workMode?: WorkMode
  employmentType?: EmploymentType
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryPeriod?: SalaryPeriod
  expectedSalary?: number
  equity?: string
  bonus?: string
  benefits?: string
  source?: string
  appliedDate?: string
  status: ApplicationStatus
  statusChangedAt?: string
  nextFollowUpDate?: string
  notes?: string
  tailoredResumeId?: ID
  createdAt: string
  updatedAt: string
}

export interface ApplicationStatusHistory {
  id: ID
  jobApplicationId: ID
  status: ApplicationStatus
  changedAt: string
  note?: string
}

export interface Interview {
  id: ID
  jobApplicationId: ID
  round: number
  type: InterviewType
  scheduledAt?: string
  outcome?: string
  notes?: string
}

export interface ContactPerson {
  id: ID
  jobApplicationId: ID
  name: string
  role?: string
  email?: string
  phone?: string
  notes?: string
}

export interface JobAttachment {
  id: ID
  jobApplicationId: ID
  type: AttachmentType
  pdfKey?: string
  fileName: string
}

/**
 * Full JSONB snapshot stored on a tailored resume version. Self-contained: no
 * foreign keys back to the master, so re-tailoring never touches master data.
 */
export interface TailoredResumeData {
  headline: string
  summary: string
  contact: ContactDetails
  experience: TailoredExperience[]
  education: TailoredEducation[]
  skills: TailoredSkill[]
  projects: TailoredProject[]
  certifications: TailoredCertification[]
  languages: TailoredLanguage[]
  sectionOrder: ResumeSectionKey[]
  sectionVisibility: Record<ResumeSectionKey, boolean>
}

export interface TailoredExperience {
  company: string
  title: string
  location?: string
  startDate?: string
  endDate?: string
  current: boolean
  bullets: string[]
}

export interface TailoredEducation {
  school: string
  degree?: string
  field?: string
  startDate?: string
  endDate?: string
  gpa?: string
}

export interface TailoredProject {
  name: string
  description?: string
  techStack: string[]
  link?: string
}

export interface TailoredCertification {
  name: string
  issuer?: string
  issuedDate?: string
  link?: string
}

export interface TailoredLanguage {
  name: string
  proficiency?: string
}

export interface TailoredSkill {
  name: string
  category?: string
  level?: SkillLevel
}

export interface TailoredResume {
  id: ID
  userId: ID
  resumeId: ID
  jobApplicationId?: ID
  version: number
  data: TailoredResumeData
  pdfKey?: string
  fileName?: string
  createdAt: string
  updatedAt: string
}

/** Master-resume collections that can be reordered by the builder. */
export type MasterSection =
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'

/** The master resume plus all its child rows, hydrated for the UI. */
export interface MasterResumeData {
  resume: Resume
  experience: Experience[]
  education: Education[]
  skills: ResumeSkill[]
  projects: Project[]
  certifications: Certification[]
  languages: Language[]
}
