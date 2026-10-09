'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowDownUp,
  BriefcaseBusiness,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import { EmptyState } from '@/components/app/empty-state'
import { PageHeading } from '@/components/app/page-heading'
import { Panel } from '@/components/app/panel'
import { SelectField } from '@/components/app/select-field'
import { StatusPill } from '@/components/app/status-pill'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  STATUS_LABELS,
  STATUS_ORDER,
  WORK_MODE_LABELS,
} from '@/lib/constants'
import { useAppStore } from '@/lib/data/store'
import { formatDate } from '@/lib/format'
import type {
  ApplicationStatus,
  JobApplication,
  WorkMode,
} from '@/lib/types'
import { cn } from '@/lib/utils'

type SortKey = 'updated' | 'applied' | 'company' | 'followup'

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Recently updated',
  applied: 'Applied (newest)',
  company: 'Company (A–Z)',
  followup: 'Follow-up (soonest)',
}

const WORK_MODE_OPTIONS = [
  { value: 'all', label: 'All work modes' },
  ...(Object.keys(WORK_MODE_LABELS) as WorkMode[]).map((mode) => ({
    value: mode,
    label: WORK_MODE_LABELS[mode],
  })),
]

const PAGE_SIZE = 10

export function JobsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobs = useAppStore((state) => state.jobs)
  const companies = useAppStore((state) => state.companies)

  const [query, setQuery] = useState('')
  const [statuses, setStatuses] = useState<Set<ApplicationStatus>>(
    () => new Set(searchParams.getAll('status') as ApplicationStatus[]),
  )
  const [workMode, setWorkMode] = useState('all')
  const [sort, setSort] = useState<SortKey>('updated')
  const [page, setPage] = useState(0)
  const [pendingDelete, setPendingDelete] = useState<JobApplication | null>(null)

  const companyName = (id: string) =>
    companies.find((company) => company.id === id)?.name ?? 'Unknown'

  function toggleStatus(status: ApplicationStatus) {
    setPage(0)
    setStatuses((current) => {
      const next = new Set(current)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = jobs.filter((job) => {
      if (statuses.size > 0 && !statuses.has(job.status)) return false
      if (workMode !== 'all' && job.workMode !== workMode) return false
      if (q) {
        const haystack = `${companyName(job.companyId)} ${job.position}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case 'applied':
          return (b.appliedDate ?? '').localeCompare(a.appliedDate ?? '')
        case 'company':
          return companyName(a.companyId).localeCompare(companyName(b.companyId))
        case 'followup':
          return (a.nextFollowUpDate ?? '9999').localeCompare(
            b.nextFollowUpDate ?? '9999',
          )
        default:
          return b.updatedAt.localeCompare(a.updatedAt)
      }
    })
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, companies, query, statuses, workMode, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  )

  const filtersActive =
    query.trim().length > 0 || statuses.size > 0 || workMode !== 'all'

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeading
          eyebrow="Workspace"
          title="Jobs"
          description="Every application, in one place."
        />
        <Panel>
          <EmptyState
            icon={<BriefcaseBusiness />}
            title="No applications yet"
            description="Add a job to track its status, tailor a resume, and stay on top of follow-ups."
            action={
              <Link
                href="/jobs/new"
                className={cn(buttonVariants({ size: 'sm' }))}
              >
                <Plus className="size-3.5" /> Add your first job
              </Link>
            }
          />
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Workspace"
        title="Jobs"
        description={`${jobs.length} application${jobs.length === 1 ? '' : 's'} tracked.`}
        actions={
          <Link href="/jobs/new" className={cn(buttonVariants({ size: 'sm' }))}>
            <Plus className="size-3.5" /> New job
          </Link>
        }
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(0)
              }}
              placeholder="Search company or position..."
              className="pl-8"
            />
          </div>
          <SelectField
            aria-label="Filter by work mode"
            className="w-44"
            value={workMode}
            onChange={(value) => {
              setWorkMode(value)
              setPage(0)
            }}
            options={WORK_MODE_OPTIONS}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'outline', size: 'default' }),
              )}
            >
              <ArrowDownUp className="size-3.5" />
              {SORT_LABELS[sort]}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <DropdownMenuItem key={key} onClick={() => setSort(key)}>
                  {SORT_LABELS[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_ORDER.map((status) => {
            const active = statuses.has(status)
            return (
              <button
                key={status}
                type="button"
                aria-pressed={active}
                onClick={() => toggleStatus(status)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs transition-colors',
                  active
                    ? 'border-foreground/20 bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted/60',
                )}
              >
                {STATUS_LABELS[status]}
              </button>
            )
          })}
          {filtersActive ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('')
                setStatuses(new Set())
                setWorkMode('all')
                setPage(0)
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      <Panel className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No jobs match your filters"
            description="Try a different search or clear the filters."
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery('')
                  setStatuses(new Set())
                  setWorkMode('all')
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">Work mode</TableHead>
                  <TableHead className="hidden sm:table-cell">Applied</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Follow-up
                  </TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <TableCell className="pl-5 font-medium">
                      {companyName(job.companyId)}
                    </TableCell>
                    <TableCell className="max-w-[16rem] truncate">
                      {job.position}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={job.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {job.location || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {job.workMode ? WORK_MODE_LABELS[job.workMode] : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {formatDate(job.appliedDate) || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell">
                      {formatDate(job.nextFollowUpDate) || '—'}
                    </TableCell>
                    <TableCell
                      className="pr-5 text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Actions for ${job.position}`}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                          )}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/jobs/${job.id}`)}
                          >
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/editor/${job.id}`)}
                          >
                            Tailor a new version
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/jobs/new?job=${job.id}`)
                            }
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setPendingDelete(job)}
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pageCount > 1 ? (
              <div className="flex items-center justify-between border-t px-5 py-3">
                <span className="text-muted-foreground text-xs">
                  Page {currentPage + 1} of {pageCount}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= pageCount - 1}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Panel>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.position}” and its history, interviews, and contacts will be removed.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) useAppStore.getState().deleteJob(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
