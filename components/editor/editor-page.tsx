'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { SegmentedControl } from '@/components/app/segmented-control'
import { EmptyState } from '@/components/app/empty-state'
import { TailoringEditor } from '@/components/editor/tailoring-editor'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field } from '@/components/app/field'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/data/store'
import { tailoredFromMaster } from '@/lib/tailoring'
import type { TailoredResumeData } from '@/lib/types'
import { cn } from '@/lib/utils'

export function EditorPage({
  jobId,
  standalone,
}: {
  jobId: string
  standalone?: boolean
}) {
  const job = useAppStore((state) =>
    state.jobs.find((row) => row.id === jobId),
  )
  const company = useAppStore((state) => state.companies.find((row) => row.id === job?.companyId))
  const tailored = useAppStore((state) => state.tailored)
  const master = useAppStore((state) => state.master)
  const catalog = useAppStore((state) => state.skills)
  const jobSkills = useAppStore((state) => state.jobSkills)

  const versions = tailored
    .filter((row) => row.jobApplicationId === jobId)
    .sort((a, b) => b.version - a.version)
  const latest = versions[0]

  const [data, setData] = useState<TailoredResumeData>(() =>
    latest
      ? structuredClone(latest.data)
      : tailoredFromMaster(master, catalog),
  )
  const [version, setVersion] = useState(latest?.version ?? 0)
  const [dirty, setDirty] = useState(false)
  const [mode, setMode] = useState<'visual' | 'ats'>('visual')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fileName, setFileName] = useState(
    latest?.fileName ??
      `${(company?.name ?? 'resume').toLowerCase().replace(/\s+/g, '-')}-resume.pdf`,
  )

  if (!job) {
    return (
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
    )
  }

  const currentJob = job

  const editorSkills = jobSkills
    .filter((row) => row.jobApplicationId === currentJob.id)
    .map((row) => ({
      name:
        catalog.find((skill) => skill.id === row.skillId)?.name ?? 'Unknown',
      required: row.required,
    }))

  function update(next: TailoredResumeData) {
    setData(next)
    setDirty(true)
  }

  function loadVersion(id: string) {
    const target = versions.find((row) => row.id === id)
    if (!target) return
    setData(structuredClone(target.data))
    setVersion(target.version)
    setDirty(false)
    toast(`Loaded v${target.version}.`)
  }

  function save() {
    const saved = useAppStore.getState().saveTailored({
      jobApplicationId: currentJob.id,
      data,
      fileName,
    })
    setVersion(saved.version)
    setDirty(false)
    toast(`Saved as v${saved.version}.`)
  }

  function download() {
    useAppStore.getState().saveTailored({
      jobApplicationId: currentJob.id,
      data,
      fileName,
    })
    setDialogOpen(false)
    setDirty(false)
    toast('Download arrives in Phase 2.')
  }

  return (
    <div className="space-y-4">
      <div className="bg-background/80 sticky top-16 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b px-4 py-2.5 backdrop-blur lg:-mx-8 lg:px-8">
        {!standalone ? (
          <Link
            href={`/jobs/${job.id}`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Link>
        ) : null}
        <span className="min-w-0 text-sm font-medium">
          {company?.name ?? 'Application'}
          <span className="text-muted-foreground"> — {job.position}</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: 'outline', size: 'xs' }),
              'gap-1',
            )}
          >
            v{version || 1}
            <ChevronDown className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Versions</DropdownMenuLabel>
            {versions.length === 0 ? (
              <DropdownMenuItem disabled>No saved versions</DropdownMenuItem>
            ) : (
              versions.map((row) => (
                <DropdownMenuItem
                  key={row.id}
                  onClick={() => loadVersion(row.id)}
                >
                  v{row.version} · {row.fileName ?? 'resume.pdf'}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-muted-foreground hidden text-xs sm:inline">
          {dirty ? 'Unsaved changes' : `Saved v${version || 1}`}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <SegmentedControl
            options={[
              { label: 'Visual', value: 'visual' as const },
              { label: 'ATS text', value: 'ats' as const },
            ]}
            value={mode}
            onChange={setMode}
            ariaLabel="Editor pane mode"
          />
          <Button type="button" variant="outline" size="sm" onClick={save}>
            Save
          </Button>
          <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
            <Download className="size-3.5" /> Download
          </Button>
        </div>
      </div>

      <TailoringEditor
        data={data}
        onChange={update}
        jd={job.jobDescription}
        jobSkills={editorSkills}
        mode={mode}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download resume</DialogTitle>
            <DialogDescription>
              The PDF pipeline arrives in Phase 2. This saves the version.
            </DialogDescription>
          </DialogHeader>
          <Field label="File name">
            <Input
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={download}>
              <Download className="size-3.5" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
