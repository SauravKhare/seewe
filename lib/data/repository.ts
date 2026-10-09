import { useAppStore } from './store'
import type { CreateJobInput, SaveTailoredInput } from './store'
import type {
  ApplicationStatus,
  ApplicationStatusHistory,
  Company,
  ContactPerson,
  Interview,
  JobAttachment,
  JobApplication,
  JobSkill,
  MasterResumeData,
  MasterSection,
  Skill,
  TailoredResume,
} from '@/lib/types'

export interface JobSkillView extends JobSkill {
  name: string
  normalized: string
}

export interface JobDetail {
  job: JobApplication
  company?: Company
  history: ApplicationStatusHistory[]
  interviews: Interview[]
  contacts: ContactPerson[]
  attachments: JobAttachment[]
  skills: JobSkillView[]
  tailored: TailoredResume[]
}

/**
 * The single seam between the UI and its data. Phase 1 provides the local
 * (Zustand + localStorage) implementation. Phase 2 provides a server
 * implementation backed by Drizzle + Postgres behind this same interface.
 */
export interface Repository {
  getMasterResume(): Promise<MasterResumeData>
  getSkills(): Promise<Skill[]>
  reorderMasterSection(section: MasterSection, orderedIds: string[]): void
  listCompanies(): Promise<Company[]>
  listJobs(): Promise<JobApplication[]>
  getJob(id: string): Promise<JobApplication | undefined>
  getJobDetail(id: string): Promise<JobDetail | undefined>
  getCompany(id: string): Promise<Company | undefined>
  createJob(input: CreateJobInput): Promise<JobApplication>
  updateJob(id: string, patch: Partial<JobApplication>): Promise<void>
  deleteJob(id: string): Promise<void>
  changeStatus(
    id: string,
    status: ApplicationStatus,
    note?: string,
  ): Promise<void>
  saveTailored(input: SaveTailoredInput): Promise<TailoredResume>
  listTailoredForJob(jobApplicationId: string): Promise<TailoredResume[]>
  resetDemo(): Promise<void>
}

export function getJobDetail(id: string): JobDetail | undefined {
  const state = useAppStore.getState()
  const job = state.jobs.find((entry) => entry.id === id)
  if (!job) return undefined

  const skills: JobSkillView[] = state.jobSkills
    .filter((row) => row.jobApplicationId === id)
    .map((row) => {
      const skill = state.skills.find(
        (candidate) => candidate.id === row.skillId,
      )
      return {
        ...row,
        name: skill?.name ?? 'Unknown',
        normalized: skill?.normalized ?? 'unknown',
      }
    })

  return {
    job,
    company: state.companies.find((entry) => entry.id === job.companyId),
    history: state.statusHistory
      .filter((row) => row.jobApplicationId === id)
      .sort((a, b) => a.changedAt.localeCompare(b.changedAt)),
    interviews: state.interviews
      .filter((row) => row.jobApplicationId === id)
      .sort((a, b) => a.round - b.round),
    contacts: state.contacts.filter((row) => row.jobApplicationId === id),
    attachments: state.attachments.filter((row) => row.jobApplicationId === id),
    skills,
    tailored: state.tailored
      .filter((row) => row.jobApplicationId === id)
      .sort((a, b) => b.version - a.version),
  }
}

export const localRepository: Repository = {
  async getMasterResume() {
    return useAppStore.getState().master
  },
  async getSkills() {
    return useAppStore.getState().skills
  },
  reorderMasterSection(section, orderedIds) {
    useAppStore.getState().reorderMasterSection(section, orderedIds)
  },
  async listCompanies() {
    return useAppStore.getState().companies
  },
  async listJobs() {
    return useAppStore.getState().jobs
  },
  async getJob(id) {
    return useAppStore.getState().jobs.find((job) => job.id === id)
  },
  async getJobDetail(id) {
    return getJobDetail(id)
  },
  async getCompany(id) {
    return useAppStore.getState().companies.find((company) => company.id === id)
  },
  async createJob(input) {
    return useAppStore.getState().createJob(input)
  },
  async updateJob(id, patch) {
    useAppStore.getState().updateJob(id, patch)
  },
  async deleteJob(id) {
    useAppStore.getState().deleteJob(id)
  },
  async changeStatus(id, status, note) {
    useAppStore.getState().changeStatus(id, status, note)
  },
  async saveTailored(input) {
    return useAppStore.getState().saveTailored(input)
  },
  async listTailoredForJob(jobApplicationId) {
    return useAppStore
      .getState()
      .tailored.filter((row) => row.jobApplicationId === jobApplicationId)
      .sort((a, b) => b.version - a.version)
  },
  async resetDemo() {
    useAppStore.getState().resetDemo()
  },
}

export const repository: Repository = localRepository
