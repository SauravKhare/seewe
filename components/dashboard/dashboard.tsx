'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarClock,
  Check,
  Plus,
  BriefcaseBusiness,
} from 'lucide-react'

import { EmptyState } from '@/components/app/empty-state'
import { PageHeading } from '@/components/app/page-heading'
import { Panel, PanelHeader } from '@/components/app/panel'
import { SectionLabel } from '@/components/app/section-label'
import { StatCard } from '@/components/app/stat-card'
import { StatusPill } from '@/components/app/status-pill'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { STATUS_DOT_CLASS, STATUS_LABELS } from '@/lib/constants'
import { useAppStore } from '@/lib/data/store'
import { effectiveAppliedDate, formatDate } from '@/lib/format'
import { hasMaster } from '@/lib/tailoring'
import type { ApplicationStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STAT_STATUSES: ApplicationStatus[] = [
  'saved',
  'applied',
  'heard_back',
  'interviewing',
  'offer',
]

function startOfToday(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function followUpLabel(value: string): { text: string; overdue: boolean } {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return { text: value, overdue: false }
  const diffDays = Math.round(
    (date.getTime() - startOfToday()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays === 0) return { text: 'Due today', overdue: true }
  if (diffDays < 0)
    return {
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
      overdue: true,
    }
  return {
    text: `In ${diffDays} day${diffDays === 1 ? '' : 's'}`,
    overdue: false,
  }
}

export function Dashboard() {
  const router = useRouter()
  const jobs = useAppStore((state) => state.jobs)
  const companies = useAppStore((state) => state.companies)
  const master = useAppStore((state) => state.master)
  const canTailor = hasMaster(master)

  const companyName = (id: string) =>
    companies.find((company) => company.id === id)?.name ?? 'Unknown'

  const counts = STAT_STATUSES.reduce<Record<string, number>>(
    (accumulator, status) => {
      accumulator[status] = jobs.filter((job) => job.status === status).length
      return accumulator
    },
    {},
  )

  const followUps = jobs
    .filter((job) => job.nextFollowUpDate)
    .sort((a, b) =>
      (a.nextFollowUpDate ?? '').localeCompare(b.nextFollowUpDate ?? ''),
    )
    .slice(0, 5)

  const recent = [...jobs]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6)

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeading
          eyebrow="Overview"
          title="Dashboard"
          description="See your whole search at a glance."
        />
        <Panel>
          <EmptyState
            icon={<BriefcaseBusiness />}
            title="No applications yet"
            description="Track a job here to tailor a resume, send it, and follow up — all in one flow."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/jobs/new"
                  className={cn(buttonVariants({ size: 'sm' }))}
                >
                  <Plus className="size-3.5" /> Add your first job
                </Link>
                <Link
                  href={canTailor ? '/editor/new' : '/onboarding'}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                  )}
                >
                  Tailor a resume without a job
                </Link>
              </div>
            }
          />
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Overview"
        title="Dashboard"
        description="See your whole search at a glance."
        actions={
          <Link href="/jobs/new" className={cn(buttonVariants({ size: 'sm' }))}>
            <Plus className="size-3.5" /> New job / resume
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_STATUSES.map((status) => (
          <StatCard
            key={status}
            label={STATUS_LABELS[status]}
            count={counts[status] ?? 0}
            dotClass={STATUS_DOT_CLASS[status]}
            onClick={() => router.push(`/jobs?status=${status}`)}
          />
        ))}
      </div>

      <Panel className="p-5">
        <PanelHeader
          title="Follow-ups due"
          description="Applications with a next follow-up date."
          actions={
            <Link
              href="/jobs"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
            >
              All jobs <ArrowRight className="size-3" />
            </Link>
          }
        />
        {followUps.length === 0 ? (
          <p className="text-muted-foreground mt-4 text-sm">
            Nothing to follow up on right now.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {followUps.map((job) => {
              const due = followUpLabel(job.nextFollowUpDate ?? '')
              return (
                <li
                  key={job.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <CalendarClock
                    className={cn(
                      'size-4 shrink-0',
                      due.overdue
                        ? 'text-status-interviewing'
                        : 'text-muted-foreground',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="focus-visible:ring-ring min-w-0 flex-1 rounded-sm text-left focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="block truncate text-sm font-medium">
                      {companyName(job.companyId)}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {job.position}
                    </span>
                  </button>
                  <span
                    className={cn(
                      'hidden text-xs whitespace-nowrap sm:block',
                      due.overdue
                        ? 'text-status-interviewing'
                        : 'text-muted-foreground',
                    )}
                  >
                    {due.text}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      useAppStore.getState().updateJob(job.id, {
                        nextFollowUpDate: undefined,
                      })
                    }
                  >
                    <Check className="size-3.5" /> Mark done
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        <div className="p-5">
          <PanelHeader
            title="Recent applications"
            description="The last few jobs you touched."
            actions={
              <Link
                href="/jobs"
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            }
          />
        </div>
        <div className="divide-y border-t sm:hidden">
          {recent.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="focus-visible:ring-ring flex w-full items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {companyName(job.companyId)}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {job.position}
                </p>
              </div>
              <StatusPill status={job.status} />
            </button>
          ))}
        </div>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Applied</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((job) => (
                <TableRow key={job.id} className="relative">
                  <TableCell className="pl-5 font-medium">
                    <Link
                      href={`/jobs/${job.id}`}
                      aria-label={`Open ${job.position} at ${companyName(job.companyId)}`}
                      className="focus-visible:ring-ring absolute inset-0 rounded-sm focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
                    />
                    {companyName(job.companyId)}
                  </TableCell>
                  <TableCell className="max-w-[16rem] truncate">
                    {job.position}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={job.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {formatDate(effectiveAppliedDate(job)) || '—'}
                  </TableCell>
                  <TableCell className="relative z-10 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/jobs/${job.id}`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'xs' }),
                        )}
                      >
                        View
                      </Link>
                      <Link
                        href={`/editor/${job.id}`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'xs' }),
                        )}
                      >
                        Tailor
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <SectionLabel className="block">
        {jobs.length} application{jobs.length === 1 ? '' : 's'} tracked
      </SectionLabel>
    </div>
  )
}
