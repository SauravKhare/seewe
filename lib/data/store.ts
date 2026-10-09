'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { normalizeJobUrl } from '@/lib/format'
import { createId, normalizeName } from '@/lib/id'
import type {
  ApplicationStatus,
  ApplicationStatusHistory,
  Certification,
  Company,
  ContactPerson,
  Education,
  EmploymentType,
  Experience,
  Interview,
  JobAttachment,
  JobApplication,
  JobSkill,
  Language,
  MasterResumeData,
  MasterSection,
  Project,
  PrunableMasterSection,
  ResumeSkill,
  SalaryPeriod,
  Skill,
  TailoredResume,
  TailoredResumeData,
  WorkMode,
} from '@/lib/types'
import {
  MASTER_RESUME_ID,
  USER_ID,
  certifications as seedCertifications,
  companies as seedCompanies,
  contacts as seedContacts,
  education as seedEducation,
  experience as seedExperience,
  interviews as seedInterviews,
  jobApplications as seedJobs,
  jobAttachments as seedAttachments,
  jobSkills as seedJobSkills,
  languages as seedLanguages,
  projects as seedProjects,
  resume as seedResume,
  resumeSkills as seedResumeSkills,
  skills as seedSkills,
  statusHistory as seedStatusHistory,
  tailoredResumes as seedTailored,
} from './fixtures'

export interface CreateJobInput {
  companyName: string
  position: string
  jobDescription?: string
  jobUrl?: string
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
  nextFollowUpDate?: string
  notes?: string
  status?: ApplicationStatus
  skills?: { name: string; required: boolean }[]
}

export interface SaveTailoredInput {
  jobApplicationId?: string
  data: TailoredResumeData
  fileName?: string
  markApplied?: boolean
}

interface AppState {
  hydrated: boolean
  userId: string
  master: MasterResumeData
  skills: Skill[]
  companies: Company[]
  jobs: JobApplication[]
  statusHistory: ApplicationStatusHistory[]
  interviews: Interview[]
  contacts: ContactPerson[]
  attachments: JobAttachment[]
  jobSkills: JobSkill[]
  tailored: TailoredResume[]

  setHydrated: (value: boolean) => void
  resetDemo: () => void
  clearDemo: () => void

  updateMaster: (patch: Partial<MasterResumeData['resume']>) => void

  upsertExperience: (item: Experience) => void
  removeExperience: (id: string) => void
  upsertEducation: (item: Education) => void
  removeEducation: (id: string) => void
  upsertProject: (item: Project) => void
  removeProject: (id: string) => void
  upsertCertification: (item: Certification) => void
  removeCertification: (id: string) => void
  upsertLanguage: (item: Language) => void
  removeLanguage: (id: string) => void
  upsertResumeSkill: (item: ResumeSkill) => void
  removeResumeSkill: (id: string) => void
  ensureSkill: (name: string) => Skill
  reorderMasterSection: (section: MasterSection, orderedIds: string[]) => void
  /** Drops untouched, blank rows from a half-finished master section. */
  pruneMasterSection: (section: PrunableMasterSection) => void

  createCompany: (name: string) => Company
  updateCompany: (id: string, patch: Partial<Company>) => void
  createJob: (input: CreateJobInput) => JobApplication
  updateJob: (id: string, patch: Partial<JobApplication>) => void
  setJobSkills: (
    jobApplicationId: string,
    skills: { name: string; required: boolean }[],
  ) => void
  deleteJob: (id: string) => void
  changeStatus: (id: string, status: ApplicationStatus, note?: string) => void

  upsertInterview: (item: Interview) => void
  removeInterview: (id: string) => void
  upsertContact: (item: ContactPerson) => void
  removeContact: (id: string) => void
  addAttachment: (item: JobAttachment) => void
  removeAttachment: (id: string) => void

  saveTailored: (input: SaveTailoredInput) => TailoredResume
}

const patched = <T extends { id: string }>(list: T[], item: T): T[] => {
  const exists = list.some((entry) => entry.id === item.id)
  return exists
    ? list.map((entry) => (entry.id === item.id ? item : entry))
    : [...list, item]
}

const hasText = (...values: (string | undefined | null)[]): boolean =>
  values.some((value) => (value ?? '').trim().length > 0)

/** A row is "untouched" when nothing in it has been filled in yet. */
const experienceIsEmpty = (item: Experience): boolean =>
  !hasText(
    item.title,
    item.company,
    item.location,
    item.startDate,
    item.endDate,
  ) &&
  !item.current &&
  !item.bullets.some((bullet) => bullet.trim().length > 0)

const educationIsEmpty = (item: Education): boolean =>
  !hasText(
    item.school,
    item.degree,
    item.field,
    item.gpa,
    item.startDate,
    item.endDate,
  )

const projectIsEmpty = (item: Project): boolean =>
  !hasText(item.name, item.description, item.link) &&
  item.techStack.length === 0

const certificationIsEmpty = (item: Certification): boolean =>
  !hasText(item.name, item.issuer, item.issuedDate, item.link)

const languageIsEmpty = (item: Language): boolean =>
  !hasText(item.name, item.proficiency)

function initialState() {
  return {
    hydrated: false,
    userId: USER_ID,
    master: {
      resume: structuredClone(seedResume),
      experience: structuredClone(seedExperience),
      education: structuredClone(seedEducation),
      skills: structuredClone(seedResumeSkills),
      projects: structuredClone(seedProjects),
      certifications: structuredClone(seedCertifications),
      languages: structuredClone(seedLanguages),
    },
    skills: structuredClone(seedSkills),
    companies: structuredClone(seedCompanies),
    jobs: structuredClone(seedJobs),
    statusHistory: structuredClone(seedStatusHistory),
    interviews: structuredClone(seedInterviews),
    contacts: structuredClone(seedContacts),
    attachments: structuredClone(seedAttachments),
    jobSkills: structuredClone(seedJobSkills),
    tailored: structuredClone(seedTailored),
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      setHydrated: (value) => set({ hydrated: value }),

      resetDemo: () => set({ ...initialState(), hydrated: true }),

      clearDemo: () => {
        const timestamp = new Date().toISOString()
        set({
          master: {
            resume: {
              ...structuredClone(seedResume),
              id: createId('resume'),
              headline: '',
              summary: '',
              contact: {},
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
          },
          companies: [],
          jobs: [],
          statusHistory: [],
          interviews: [],
          contacts: [],
          attachments: [],
          jobSkills: [],
          tailored: [],
        })
      },

      updateMaster: (patch) =>
        set((state) => ({
          master: {
            ...state.master,
            resume: {
              ...state.master.resume,
              ...patch,
              updatedAt: new Date().toISOString(),
            },
          },
        })),

      upsertExperience: (item) =>
        set((state) => ({
          master: {
            ...state.master,
            experience: patched(state.master.experience, item),
          },
        })),
      removeExperience: (id) =>
        set((state) => ({
          master: {
            ...state.master,
            experience: state.master.experience.filter(
              (item) => item.id !== id,
            ),
          },
        })),
      upsertEducation: (item) =>
        set((state) => ({
          master: {
            ...state.master,
            education: patched(state.master.education, item),
          },
        })),
      removeEducation: (id) =>
        set((state) => ({
          master: {
            ...state.master,
            education: state.master.education.filter((item) => item.id !== id),
          },
        })),
      upsertProject: (item) =>
        set((state) => ({
          master: {
            ...state.master,
            projects: patched(state.master.projects, item),
          },
        })),
      removeProject: (id) =>
        set((state) => ({
          master: {
            ...state.master,
            projects: state.master.projects.filter((item) => item.id !== id),
          },
        })),
      upsertCertification: (item) =>
        set((state) => ({
          master: {
            ...state.master,
            certifications: patched(state.master.certifications, item),
          },
        })),
      removeCertification: (id) =>
        set((state) => ({
          master: {
            ...state.master,
            certifications: state.master.certifications.filter(
              (item) => item.id !== id,
            ),
          },
        })),
      upsertLanguage: (item) =>
        set((state) => ({
          master: {
            ...state.master,
            languages: patched(state.master.languages, item),
          },
        })),
      removeLanguage: (id) =>
        set((state) => ({
          master: {
            ...state.master,
            languages: state.master.languages.filter((item) => item.id !== id),
          },
        })),
      upsertResumeSkill: (item) =>
        set((state) => ({
          master: {
            ...state.master,
            skills: patched(state.master.skills, item),
          },
        })),
      removeResumeSkill: (id) =>
        set((state) => ({
          master: {
            ...state.master,
            skills: state.master.skills.filter((item) => item.id !== id),
          },
        })),

      reorderMasterSection: (section, orderedIds) =>
        set((state) => {
          const list = state.master[section] as unknown as {
            id: string
            sortOrder: number
          }[]
          const byId = new Map(list.map((item) => [item.id, item]))
          const next = orderedIds
            .map((id, index) => {
              const item = byId.get(id)
              return item ? { ...item, sortOrder: index } : null
            })
            .filter((item): item is { id: string; sortOrder: number } =>
              Boolean(item),
            )
          return {
            master: {
              ...state.master,
              [section]: next as unknown as MasterResumeData[typeof section],
            },
          }
        }),

      pruneMasterSection: (section) =>
        set((state) => {
          const master = state.master
          switch (section) {
            case 'experience':
              return {
                master: {
                  ...master,
                  experience: master.experience.filter(
                    (item) => !experienceIsEmpty(item),
                  ),
                },
              }
            case 'education':
              return {
                master: {
                  ...master,
                  education: master.education.filter(
                    (item) => !educationIsEmpty(item),
                  ),
                },
              }
            case 'projects':
              return {
                master: {
                  ...master,
                  projects: master.projects.filter(
                    (item) => !projectIsEmpty(item),
                  ),
                },
              }
            case 'certifications':
              return {
                master: {
                  ...master,
                  certifications: master.certifications.filter(
                    (item) => !certificationIsEmpty(item),
                  ),
                },
              }
            case 'languages':
              return {
                master: {
                  ...master,
                  languages: master.languages.filter(
                    (item) => !languageIsEmpty(item),
                  ),
                },
              }
          }
        }),

      ensureSkill: (name) => {
        const normalized = normalizeName(name)
        const existing = get().skills.find(
          (skill) => skill.normalized === normalized,
        )
        if (existing) return existing
        const skill: Skill = {
          id: createId('skill'),
          name: name.trim(),
          normalized,
        }
        set((state) => ({ skills: [...state.skills, skill] }))
        return skill
      },

      createCompany: (name) => {
        const normalized = normalizeName(name)
        const existing = get().companies.find(
          (company) => company.normalizedName === normalized,
        )
        if (existing) return existing
        const timestamp = new Date().toISOString()
        const company: Company = {
          id: createId('company'),
          userId: get().userId,
          name: name.trim(),
          normalizedName: normalized,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        set((state) => ({ companies: [...state.companies, company] }))
        return company
      },

      updateCompany: (id, patch) =>
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === id
              ? {
                  ...company,
                  ...patch,
                  normalizedName: patch.name
                    ? normalizeName(patch.name)
                    : company.normalizedName,
                  updatedAt: new Date().toISOString(),
                }
              : company,
          ),
        })),

      createJob: (input) => {
        const company = get().createCompany(input.companyName)
        const timestamp = new Date().toISOString()
        const status = input.status ?? 'saved'
        const job: JobApplication = {
          id: createId('job'),
          userId: get().userId,
          companyId: company.id,
          position: input.position,
          jobDescription: input.jobDescription,
          jobUrl: normalizeJobUrl(input.jobUrl),
          location: input.location,
          workMode: input.workMode,
          employmentType: input.employmentType,
          salaryMin: input.salaryMin,
          salaryMax: input.salaryMax,
          salaryCurrency: input.salaryCurrency,
          salaryPeriod: input.salaryPeriod,
          expectedSalary: input.expectedSalary,
          equity: input.equity,
          bonus: input.bonus,
          benefits: input.benefits,
          source: input.source,
          appliedDate: input.appliedDate,
          status,
          statusChangedAt: timestamp,
          nextFollowUpDate: input.nextFollowUpDate,
          notes: input.notes,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        const history: ApplicationStatusHistory = {
          id: createId('hist'),
          jobApplicationId: job.id,
          status,
          changedAt: timestamp,
          note: status === 'applied' ? 'Applied.' : undefined,
        }
        const jobSkillRows: JobSkill[] = (input.skills ?? []).map((entry) => {
          const skill = get().ensureSkill(entry.name)
          return {
            id: createId('js'),
            jobApplicationId: job.id,
            skillId: skill.id,
            required: entry.required,
            source: 'manual',
          }
        })
        set((state) => ({
          jobs: [...state.jobs, job],
          statusHistory: [...state.statusHistory, history],
          jobSkills: [...state.jobSkills, ...jobSkillRows],
        }))
        return job
      },

      updateJob: (id, patch) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  ...patch,
                  jobUrl:
                    patch.jobUrl === undefined
                      ? job.jobUrl
                      : normalizeJobUrl(patch.jobUrl),
                  updatedAt: new Date().toISOString(),
                }
              : job,
          ),
        })),

      setJobSkills: (jobApplicationId, skills) => {
        const rows: JobSkill[] = skills.map((entry) => ({
          id: createId('js'),
          jobApplicationId,
          skillId: get().ensureSkill(entry.name).id,
          required: entry.required,
          source: 'manual',
        }))
        set((state) => ({
          jobSkills: [
            ...state.jobSkills.filter(
              (row) => row.jobApplicationId !== jobApplicationId,
            ),
            ...rows,
          ],
        }))
      },

      deleteJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
          statusHistory: state.statusHistory.filter(
            (row) => row.jobApplicationId !== id,
          ),
          interviews: state.interviews.filter(
            (row) => row.jobApplicationId !== id,
          ),
          contacts: state.contacts.filter((row) => row.jobApplicationId !== id),
          attachments: state.attachments.filter(
            (row) => row.jobApplicationId !== id,
          ),
          jobSkills: state.jobSkills.filter(
            (row) => row.jobApplicationId !== id,
          ),
          tailored: state.tailored.filter((row) => row.jobApplicationId !== id),
        })),

      changeStatus: (id, status, note) => {
        const timestamp = new Date().toISOString()
        const today = timestamp.slice(0, 10)
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  status,
                  statusChangedAt: timestamp,
                  appliedDate:
                    job.appliedDate ?? (status === 'saved' ? undefined : today),
                  updatedAt: timestamp,
                }
              : job,
          ),
          statusHistory: [
            ...state.statusHistory,
            {
              id: createId('hist'),
              jobApplicationId: id,
              status,
              changedAt: timestamp,
              note,
            },
          ],
        }))
      },

      upsertInterview: (item) =>
        set((state) => ({ interviews: patched(state.interviews, item) })),
      removeInterview: (id) =>
        set((state) => ({
          interviews: state.interviews.filter((row) => row.id !== id),
        })),
      upsertContact: (item) =>
        set((state) => ({ contacts: patched(state.contacts, item) })),
      removeContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((row) => row.id !== id),
        })),
      addAttachment: (item) =>
        set((state) => ({ attachments: patched(state.attachments, item) })),
      removeAttachment: (id) =>
        set((state) => ({
          attachments: state.attachments.filter((row) => row.id !== id),
        })),

      saveTailored: (input) => {
        const timestamp = new Date().toISOString()
        const existingVersions = input.jobApplicationId
          ? get().tailored.filter(
              (row) => row.jobApplicationId === input.jobApplicationId,
            )
          : []
        const version =
          existingVersions.reduce((max, row) => Math.max(max, row.version), 0) +
          1
        const tailored: TailoredResume = {
          id: createId('tr'),
          userId: get().userId,
          resumeId: MASTER_RESUME_ID,
          jobApplicationId: input.jobApplicationId,
          version,
          data: structuredClone(input.data),
          pdfKey: `users/${get().userId}/tailored/${createId('pdf')}.pdf`,
          fileName: input.fileName,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        set((state) => ({
          tailored: [...state.tailored, tailored],
          jobs: input.jobApplicationId
            ? state.jobs.map((job) =>
                job.id === input.jobApplicationId
                  ? {
                      ...job,
                      tailoredResumeId: tailored.id,
                      status: input.markApplied ? 'applied' : job.status,
                      statusChangedAt: input.markApplied
                        ? timestamp
                        : job.statusChangedAt,
                      appliedDate: input.markApplied
                        ? (job.appliedDate ?? timestamp.slice(0, 10))
                        : job.appliedDate,
                      updatedAt: timestamp,
                    }
                  : job,
              )
            : state.jobs,
          statusHistory:
            input.markApplied && input.jobApplicationId
              ? [
                  ...state.statusHistory,
                  {
                    id: createId('hist'),
                    jobApplicationId: input.jobApplicationId,
                    status: 'applied',
                    changedAt: timestamp,
                    note: `Applied with tailored resume v${version}.`,
                  },
                ]
              : state.statusHistory,
        }))
        return tailored
      },
    }),
    {
      name: 'seewe-store',
      version: 1,
      skipHydration: true,
      // Only primitive/serialisable fields are written back; actions are
      // dropped by JSON.stringify on write and merged in from the initial
      // state on read.
      partialize: (state) => ({
        hydrated: false,
        userId: state.userId,
        master: state.master,
        skills: state.skills,
        companies: state.companies,
        jobs: state.jobs,
        statusHistory: state.statusHistory,
        interviews: state.interviews,
        contacts: state.contacts,
        attachments: state.attachments,
        jobSkills: state.jobSkills,
        tailored: state.tailored,
      }),
    },
  ),
)
