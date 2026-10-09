'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/app/empty-state'
import { PageHeading } from '@/components/app/page-heading'
import { Panel, PanelHeader } from '@/components/app/panel'
import { ResumePaper } from '@/components/app/resume-paper'
import { SectionLabel } from '@/components/app/section-label'
import { StatusPill } from '@/components/app/status-pill'
import { AttachmentsPanel } from '@/components/jobs/attachments-panel'
import { ContactsPanel } from '@/components/jobs/contacts-panel'
import { InterviewsPanel } from '@/components/jobs/interviews-panel'
import { StatusTimeline } from '@/components/jobs/status-timeline'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from '@/lib/constants'
import { useAppStore } from '@/lib/data/store'
import {
  effectiveAppliedDate,
  formatDate,
  formatSalary,
  normalizeJobUrl,
  safeJobHref,
} from '@/lib/format'
import { cn } from '@/lib/utils'

export function JobDetail({ jobId }: { jobId: string }) {
  const job = useAppStore((state) => state.jobs.find((row) => row.id === jobId))
  const companies = useAppStore((state) => state.companies)
  const tailored = useAppStore((state) => state.tailored)
  const [downloading, setDownloading] = useState(false)

  if (!job) {
    return (
      <Panel>
        <EmptyState
          icon={<FileText />}
          title="Application not found"
          description="It may have been deleted."
          action={
            <Link
              href="/jobs"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              Back to jobs
            </Link>
          }
        />
      </Panel>
    )
  }

  const company = companies.find((row) => row.id === job.companyId)
  const jobHref = safeJobHref(job.jobUrl)
  const jobUrlLabel = normalizeJobUrl(job.jobUrl)
  const appliedOn = effectiveAppliedDate(job)

  const versions = tailored
    .filter((row) => row.jobApplicationId === job.id)
    .sort((a, b) => b.version - a.version)
  const current = versions[0]

  async function downloadCurrent() {
    if (!current) return
    setDownloading(true)
    try {
      const { downloadResumePdf } = await import('@/lib/pdf/ats-document')
      await downloadResumePdf(
        current.data,
        current.fileName ?? `resume-v${current.version}.pdf`,
      )
      toast('PDF downloaded.')
    } catch {
      toast.error('Could not generate the PDF. Try again.')
    } finally {
      setDownloading(false)
    }
  }

  const salary = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryPeriod,
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="min-w-0 space-y-6">
        <div>
          <Link
            href="/jobs"
            className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="size-3.5" /> All jobs
          </Link>
          <PageHeading
            eyebrow={company?.name ?? 'Application'}
            title={job.position}
            actions={
              <Link
                href={`/editor/${job.id}`}
                className={cn(buttonVariants({ size: 'sm' }))}
              >
                <Sparkles className="size-3.5" /> Tailor a new version
              </Link>
            }
          />
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
            <StatusPill status={job.status} />
            {appliedOn ? (
              <span>Applied {formatDate(appliedOn)}</span>
            ) : (
              <span>Not applied yet</span>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="gap-4">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <Panel className="p-5">
                <SectionLabel>Role details</SectionLabel>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                  <DetailRow label="Location" value={job.location} />
                  <DetailRow
                    label="Work mode"
                    value={
                      job.workMode ? WORK_MODE_LABELS[job.workMode] : undefined
                    }
                  />
                  <DetailRow
                    label="Type"
                    value={
                      job.employmentType
                        ? EMPLOYMENT_TYPE_LABELS[job.employmentType]
                        : undefined
                    }
                  />
                  <DetailRow label="Salary" value={salary} />
                  <DetailRow label="Source" value={job.source} />
                  <DetailRow
                    label="Follow-up"
                    value={formatDate(job.nextFollowUpDate)}
                  />
                  <DetailRow
                    label="Expected"
                    value={formatSalary(job.expectedSalary)}
                  />
                  <DetailRow label="Equity" value={job.equity} />
                  <DetailRow label="Bonus" value={job.bonus} />
                </dl>
                {jobHref ? (
                  <a
                    href={jobHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-focus mt-4 inline-block text-xs hover:underline"
                  >
                    {jobUrlLabel}
                  </a>
                ) : null}
              </Panel>

              <Panel className="p-5">
                <PanelHeader title="Job description" />
                {job.jobDescription ? (
                  <div className="bg-muted/40 mt-3 max-h-80 overflow-y-auto rounded-md border p-4">
                    <pre className="font-sans text-sm whitespace-pre-wrap">
                      {job.jobDescription}
                    </pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-3 text-sm">
                    No job description saved.
                  </p>
                )}
              </Panel>

              {job.notes ? (
                <Panel className="p-5">
                  <PanelHeader title="Notes" />
                  <p className="text-muted-foreground mt-3 text-sm whitespace-pre-wrap">
                    {job.notes}
                  </p>
                </Panel>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="interviews">
            <Panel className="p-5">
              <InterviewsPanel jobId={job.id} />
            </Panel>
          </TabsContent>

          <TabsContent value="contacts">
            <Panel className="p-5">
              <ContactsPanel jobId={job.id} />
            </Panel>
          </TabsContent>

          <TabsContent value="attachments">
            <Panel className="p-5">
              <AttachmentsPanel jobId={job.id} />
            </Panel>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="min-w-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
        <Panel className="p-5">
          <PanelHeader
            title="Tailored resume"
            actions={
              current ? (
                <Badge variant="secondary">v{current.version}</Badge>
              ) : null
            }
          />
          {current ? (
            <div className="mt-3 space-y-3">
              <ResumePaper data={current.data} />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={downloading}
                  onClick={() => void downloadCurrent()}
                >
                  <Download className="size-3.5" />
                  {downloading ? 'Generating…' : 'Download'}
                </Button>
                <Link
                  href={`/editor/${job.id}`}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                  )}
                >
                  Open editor
                </Link>
              </div>
              <p className="text-muted-foreground text-xs">
                {versions.length > 1 ? `${versions.length} versions · ` : ''}
                Updated {formatDate(current.updatedAt)}
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-muted-foreground text-sm">
                No tailored resume yet.
              </p>
              <Link
                href={`/editor/${job.id}`}
                className={cn(buttonVariants({ size: 'sm' }))}
              >
                Tailor a resume
              </Link>
            </div>
          )}
        </Panel>

        <Panel className="p-5">
          <SectionLabel>Status timeline</SectionLabel>
          <div className="mt-3">
            <StatusTimeline jobId={job.id} />
          </div>
        </Panel>
      </aside>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{value || '—'}</dd>
    </div>
  )
}
