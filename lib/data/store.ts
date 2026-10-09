'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  Project,
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

  createCompany: (name: string) => Company
  createJob: (input: CreateJobInput) => JobApplication
  updateJob: (id: string, patch: Partial<JobApplication>) => void
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
          jobUrl: input.jobUrl,
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
              ? { ...job, ...patch, updatedAt: new Date().toISOString() }
              : job,
          ),
        })),

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
        })),

      changeStatus: (id, status, note) => {
        const timestamp = new Date().toISOString()
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  status,
                  statusChangedAt: timestamp,
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
    },
  ),
)
