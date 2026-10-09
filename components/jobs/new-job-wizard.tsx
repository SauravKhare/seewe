'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Combobox } from '@/components/app/combobox'
import { EmptyState } from '@/components/app/empty-state'
import { Field } from '@/components/app/field'
import { ResumePreviewCard } from '@/components/app/resume-preview-card'
import { SectionLabel } from '@/components/app/section-label'
import { SelectField } from '@/components/app/select-field'
import { TailoringEditor } from '@/components/editor/tailoring-editor'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  EMPLOYMENT_TYPE_LABELS,
  SALARY_PERIOD_LABELS,
  WORK_MODE_LABELS,
} from '@/lib/constants'
import { useAppStore, type CreateJobInput } from '@/lib/data/store'
import { hasMaster, tailoredFromMaster } from '@/lib/tailoring'
import type {
  EmploymentType,
  SalaryPeriod,
  TailoredResumeData,
  WorkMode,
} from '@/lib/types'
import { cn } from '@/lib/utils'

const STEPS = ['Details', 'Job description', 'Tailor', 'Download'] as const

const WORK_MODE_OPTIONS = (Object.keys(WORK_MODE_LABELS) as WorkMode[]).map(
  (value) => ({ value, label: WORK_MODE_LABELS[value] }),
)
const EMPLOYMENT_OPTIONS = (
  Object.keys(EMPLOYMENT_TYPE_LABELS) as EmploymentType[]
).map((value) => ({ value, label: EMPLOYMENT_TYPE_LABELS[value] }))
const PERIOD_OPTIONS = (
  Object.keys(SALARY_PERIOD_LABELS) as SalaryPeriod[]
).map((value) => ({ value, label: SALARY_PERIOD_LABELS[value] }))

interface SkillRow {
  name: string
  required: boolean
}

export function NewJobWizard({ jobId }: { jobId?: string }) {
  const router = useRouter()
  const master = useAppStore((state) => state.master)
  const catalog = useAppStore((state) => state.skills)
  const companies = useAppStore((state) => state.companies)
  const existingJob = useAppStore((state) =>
    jobId ? state.jobs.find((job) => job.id === jobId) : undefined,
  )
  const existingJobSkills = useAppStore((state) => state.jobSkills)
  const tailored = useAppStore((state) => state.tailored)

  const [step, setStep] = useState(0)
  const [companyName, setCompanyName] = useState(
    () =>
      companies.find((company) => company.id === existingJob?.companyId)
        ?.name ?? '',
  )
  const [position, setPosition] = useState(existingJob?.position ?? '')
  const [jobUrl, setJobUrl] = useState(existingJob?.jobUrl ?? '')
  const [location, setLocation] = useState(existingJob?.location ?? '')
  const [workMode, setWorkMode] = useState<WorkMode | ''>(
    existingJob?.workMode ?? '',
  )
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>(
    existingJob?.employmentType ?? '',
  )
  const [source, setSource] = useState(existingJob?.source ?? '')
  const [appliedDate, setAppliedDate] = useState(existingJob?.appliedDate ?? '')
  const [salaryMin, setSalaryMin] = useState(
    existingJob?.salaryMin ? String(existingJob.salaryMin) : '',
  )
  const [salaryMax, setSalaryMax] = useState(
    existingJob?.salaryMax ? String(existingJob.salaryMax) : '',
  )
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>(
    existingJob?.salaryPeriod ?? 'yearly',
  )
  const [expectedSalary, setExpectedSalary] = useState(
    existingJob?.expectedSalary ? String(existingJob.expectedSalary) : '',
  )
  const [equity, setEquity] = useState(existingJob?.equity ?? '')
  const [bonus, setBonus] = useState(existingJob?.bonus ?? '')
  const [benefits, setBenefits] = useState(existingJob?.benefits ?? '')
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    existingJob?.nextFollowUpDate ?? '',
  )
  const [notes, setNotes] = useState(existingJob?.notes ?? '')

  const [jobDescription, setJobDescription] = useState(
    existingJob?.jobDescription ?? '',
  )
  const [skills, setSkills] = useState<SkillRow[]>(() => {
    if (!existingJob) return []
    return existingJobSkills
      .filter((row) => row.jobApplicationId === existingJob.id)
      .map((row) => ({
        name:
          catalog.find((skill) => skill.id === row.skillId)?.name ?? 'Unknown',
        required: row.required,
      }))
  })

  const [data, setData] = useState<TailoredResumeData | null>(null)
  const [dirty, setDirty] = useState(false)

  const [fileName, setFileName] = useState(() => {
    const prior = existingJob
      ? tailored
          .filter((row) => row.jobApplicationId === existingJob.id)
          .sort((a, b) => b.version - a.version)[0]?.fileName
      : undefined
    if (prior) return prior
    const base = (companyName || position)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
    return base ? `${base}-resume.pdf` : 'resume.pdf'
  })
  const [generating, setGenerating] = useState(false)

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.name,
        label: company.name,
      })),
    [companies],
  )

  if (!hasMaster(master)) {
    return (
      <div className="space-y-6">
        <SectionLabel>New application</SectionLabel>
        <EmptyState
          icon={<FileText />}
          title="Build your master resume first"
          description="Tailoring copies your master, so it needs to exist before you can track a job and tailor a resume."
          action={
            <Link
              href="/onboarding"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              Build your master
            </Link>
          }
        />
      </div>
    )
  }

  function ensureTailored() {
    if (data) return
    const latest = existingJob
      ? tailored
          .filter((row) => row.jobApplicationId === existingJob.id)
          .sort((a, b) => b.version - a.version)[0]
      : undefined
    setData(
      latest
        ? structuredClone(latest.data)
        : tailoredFromMaster(master, catalog),
    )
  }

  function goNext() {
    const next = Math.min(step + 1, STEPS.length - 1)
    if (next >= 2) ensureTailored()
    setStep(next)
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  const detailsValid =
    companyName.trim().length > 0 && position.trim().length > 0

  function addSkill(name: string) {
    if (skills.some((row) => row.name.toLowerCase() === name.toLowerCase()))
      return
    setSkills((current) => [...current, { name, required: true }])
  }

  function handleDataChange(next: TailoredResumeData) {
    setData(next)
    setDirty(true)
  }

  function detailsPatch() {
    return {
      position: position.trim(),
      jobDescription: jobDescription || undefined,
      jobUrl: jobUrl || undefined,
      location: location || undefined,
      workMode: workMode || undefined,
      employmentType: employmentType || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryCurrency: 'USD',
      salaryPeriod,
      expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
      equity: equity || undefined,
      bonus: bonus || undefined,
      benefits: benefits || undefined,
      source: source || undefined,
      appliedDate: appliedDate || undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
      notes: notes || undefined,
    }
  }

  function upsertJob(): string | undefined {
    const store = useAppStore.getState()
    if (existingJob) {
      const company = companyName.trim()
        ? store.createCompany(companyName.trim())
        : undefined
      store.updateJob(existingJob.id, {
        ...detailsPatch(),
        ...(company ? { companyId: company.id } : {}),
      })
      store.setJobSkills(existingJob.id, skills)
      return existingJob.id
    }
    const input: CreateJobInput = {
      ...detailsPatch(),
      companyName: companyName.trim(),
      position: position.trim(),
      skills,
    }
    return store.createJob(input).id
  }

  async function downloadAndMarkApplied() {
    if (!data || !fileName.trim()) return
    setGenerating(true)
    try {
      const { downloadResumePdf } = await import('@/lib/pdf/ats-document')
      await downloadResumePdf(data, fileName.trim())
    } catch {
      toast.error('Could not generate the PDF. Try again.')
      setGenerating(false)
      return
    }

    const targetId = upsertJob()
    setGenerating(false)
    if (!targetId) return

    const store = useAppStore.getState()
    const job = store.jobs.find((row) => row.id === targetId)
    const willApply = job?.status !== 'applied'
    if (dirty) {
      store.saveTailored({
        jobApplicationId: targetId,
        data,
        fileName: fileName.trim(),
        markApplied: willApply,
      })
    } else if (willApply) {
      store.changeStatus(targetId, 'applied', 'Applied with tailored resume.')
    }
    setDirty(false)

    toast(
      willApply
        ? 'Resume downloaded. Application marked applied.'
        : 'Resume downloaded.',
    )
    router.push(`/jobs/${targetId}`)
  }

  function saveAsDraft() {
    const targetId = upsertJob()
    if (!targetId) return
    if (dirty && data) {
      useAppStore.getState().saveTailored({
        jobApplicationId: targetId,
        data,
        fileName: fileName.trim(),
      })
      setDirty(false)
    }
    toast('Draft saved. Not marked as applied.')
    router.push(`/jobs/${targetId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <SectionLabel>
            {existingJob ? 'Edit application' : 'New application'}
          </SectionLabel>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            {existingJob
              ? 'Update and tailor'
              : 'Track a job and tailor a resume'}
          </h1>
        </div>
        <Link
          href="/jobs"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="size-3.5" /> Cancel
        </Link>
      </div>

      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, index) => {
          const done = index < step
          const active = index === step
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border text-xs',
                  done &&
                    'bg-primary text-primary-foreground border-transparent',
                  active && 'border-focus text-focus',
                  !done && !active && 'text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3" /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm',
                  active ? 'font-medium' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {index < STEPS.length - 1 ? (
                <span className="bg-border mx-1 hidden h-px w-6 sm:block" />
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="bg-card rounded-md border p-5">
        {step === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company" hint="Suggestions reuse existing companies.">
              <Combobox
                options={companyOptions}
                value={companyName}
                onSelect={setCompanyName}
                onCreate={setCompanyName}
                placeholder="Select or add a company"
                searchPlaceholder="Search companies..."
                createLabel="Use"
              />
            </Field>
            <Field label="Position">
              <Input
                value={position}
                onChange={(event) => setPosition(event.target.value)}
              />
            </Field>
            <Field label="Location">
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </Field>
            <Field label="Work mode">
              <SelectField
                value={workMode}
                onChange={(value) => setWorkMode(value as WorkMode)}
                options={WORK_MODE_OPTIONS}
                placeholder="Select"
              />
            </Field>
            <Field label="Employment type">
              <SelectField
                value={employmentType}
                onChange={(value) => setEmploymentType(value as EmploymentType)}
                options={EMPLOYMENT_OPTIONS}
                placeholder="Select"
              />
            </Field>
            <Field label="Source">
              <Input
                value={source}
                placeholder="LinkedIn, referral, company site"
                onChange={(event) => setSource(event.target.value)}
              />
            </Field>
            <Field label="Job URL">
              <Input
                value={jobUrl}
                placeholder="company.com/jobs/role"
                onChange={(event) => setJobUrl(event.target.value)}
              />
            </Field>
            <Field
              label="Applied date"
              hint="Leave empty until you have applied."
            >
              <Input
                type="date"
                value={appliedDate}
                onChange={(event) => setAppliedDate(event.target.value)}
              />
            </Field>
            <Field label="Next follow-up">
              <Input
                type="date"
                value={nextFollowUpDate}
                onChange={(event) => setNextFollowUpDate(event.target.value)}
              />
            </Field>
            <Field label="Salary min">
              <Input
                type="number"
                value={salaryMin}
                onChange={(event) => setSalaryMin(event.target.value)}
              />
            </Field>
            <Field label="Salary max">
              <Input
                type="number"
                value={salaryMax}
                onChange={(event) => setSalaryMax(event.target.value)}
              />
            </Field>
            <Field label="Salary period">
              <SelectField
                value={salaryPeriod}
                onChange={(value) => setSalaryPeriod(value as SalaryPeriod)}
                options={PERIOD_OPTIONS}
              />
            </Field>
            <Field label="Expected salary">
              <Input
                type="number"
                value={expectedSalary}
                onChange={(event) => setExpectedSalary(event.target.value)}
              />
            </Field>
            <Field label="Equity">
              <Input
                value={equity}
                onChange={(event) => setEquity(event.target.value)}
              />
            </Field>
            <Field label="Bonus">
              <Input
                value={bonus}
                onChange={(event) => setBonus(event.target.value)}
              />
            </Field>
            <Field label="Benefits" className="sm:col-span-2">
              <Input
                value={benefits}
                onChange={(event) => setBenefits(event.target.value)}
              />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <Field
              label="Job description"
              hint="Paste the posting exactly as written."
            >
              <Textarea
                rows={12}
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the full job description here."
              />
            </Field>
            <div>
              <SectionLabel>Required skills</SectionLabel>
              <p className="text-muted-foreground mt-1 text-xs">
                Skills are entered manually. No AI is used in this version.
              </p>
              <ul className="mt-3 space-y-2">
                {skills.map((row, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="flex-1 font-mono text-xs">{row.name}</span>
                    <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={row.required}
                        onChange={(event) => {
                          const next = skills.slice()
                          next[index] = {
                            ...row,
                            required: event.target.checked,
                          }
                          setSkills(next)
                        }}
                      />
                      Required
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${row.name}`}
                      onClick={() =>
                        setSkills(skills.filter((_, i) => i !== index))
                      }
                    >
                      <X className="size-3" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 max-w-xs">
                <Combobox
                  options={catalog
                    .filter(
                      (skill) =>
                        !skills.some(
                          (row) =>
                            row.name.toLowerCase() === skill.name.toLowerCase(),
                        ),
                    )
                    .map((skill) => ({ value: skill.name, label: skill.name }))}
                  onSelect={addSkill}
                  onCreate={addSkill}
                  placeholder="Add a skill"
                  searchPlaceholder="Search skills..."
                  createLabel="Add"
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                Edit a copy of your master. Your master never changes.
              </p>
            </div>
            {data ? (
              <TailoringEditor
                data={data}
                onChange={handleDataChange}
                jd={jobDescription}
                jobSkills={skills}
              />
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Field label="File name" className="w-72">
                <Input
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                />
              </Field>
              <Button
                type="button"
                disabled={generating || !fileName.trim() || !data}
                onClick={downloadAndMarkApplied}
              >
                <Download className="size-4" />
                {generating ? 'Generating…' : 'Download and mark applied'}
              </Button>
            </div>
            {data ? (
              <ResumePreviewCard data={data} label="Resume preview" />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0}
        >
          <ArrowLeft className="size-3.5" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={saveAsDraft}
            disabled={!detailsValid}
          >
            Save as draft
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={step === 0 && !detailsValid}
            >
              Next <ArrowRight className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
