import type {
  ApplicationStatus,
  AttachmentType,
  EmploymentType,
  InterviewType,
  ResumeSectionKey,
  SalaryPeriod,
  SkillLevel,
  WorkMode,
} from '@/lib/types'

export const STATUS_ORDER: ApplicationStatus[] = [
  'saved',
  'applied',
  'heard_back',
  'interviewing',
  'rejected',
  'offer',
]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  heard_back: 'Heard back',
  interviewing: 'Interviewing',
  rejected: 'Rejected',
  offer: 'Offer',
}

/** Literal Tailwind classes so the compiler can see them. */
export const STATUS_DOT_CLASS: Record<ApplicationStatus, string> = {
  saved: 'bg-status-saved',
  applied: 'bg-status-applied',
  heard_back: 'bg-status-heard-back',
  interviewing: 'bg-status-interviewing',
  rejected: 'bg-status-rejected',
  offer: 'bg-status-offer',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Onsite',
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  contract: 'Contract',
  internship: 'Internship',
}

export const SALARY_PERIOD_LABELS: Record<SalaryPeriod, string> = {
  hourly: 'per hour',
  monthly: 'per month',
  yearly: 'per year',
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  working: 'Working',
  proficient: 'Proficient',
  expert: 'Expert',
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  phone: 'Phone',
  technical: 'Technical',
  onsite: 'Onsite',
  virtual: 'Virtual',
}

export const ATTACHMENT_TYPE_LABELS: Record<AttachmentType, string> = {
  resume: 'Resume',
  cover_letter: 'Cover letter',
  jd: 'Job description',
}

export const SECTION_LABELS: Record<ResumeSectionKey, string> = {
  summary: 'Summary',
  contact: 'Contact',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
}

export const DEFAULT_SECTION_ORDER: ResumeSectionKey[] = [
  'summary',
  'contact',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

export const DEFAULT_SECTION_VISIBILITY: Record<ResumeSectionKey, boolean> = {
  summary: true,
  contact: true,
  experience: true,
  education: true,
  skills: true,
  projects: true,
  certifications: true,
  languages: true,
}
