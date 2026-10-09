'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

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
import { hasMaster, tailoredFromMaster } from '@/lib/tailoring'
import type { TailoredResumeData } from '@/lib/types'
import { cn } from '@/lib/utils'

export function EditorPage({ jobId }: { jobId?: string }) {
  const router = useRouter()
  const standalone = jobId === undefined
  const job = useAppStore((state) =>
    jobId ? state.jobs.find((row) => row.id === jobId) : undefined,
  )
  const company = useAppStore((state) =>
    job ? state.companies.find((row) => row.id === job.companyId) : undefined,
  )
  const tailored = useAppStore((state) => state.tailored)
  const master = useAppStore((state) => state.master)
  const catalog = useAppStore((state) => state.skills)
  const jobSkills = useAppStore((state) => state.jobSkills)

  const versions = tailored
    .filter((row) => row.jobApplicationId === jobId)
    .sort((a, b) => b.version - a.version)
  const latest = versions[0]

  const [data, setData] = useState<TailoredResumeData>(() =>
    latest ? structuredClone(latest.data) : tailoredFromMaster(master, catalog),
  )
  const [version, setVersion] = useState(latest?.version ?? 0)
  const [dirty, setDirty] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [fileName, setFileName] = useState(() => {
    if (latest?.fileName) return latest.fileName
    if (standalone) return 'resume.pdf'
    const base = company?.name ?? job?.position ?? 'resume'
    return `${base.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`
  })

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => {
    if (!dirty) return
    function onClick(event: MouseEvent) {
      if (!event.cancelable || event.defaultPrevented || event.button !== 0)
        return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      const anchor = (event.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const target = new URL(anchor.href, window.location.href)
      if (target.origin !== window.location.origin) return
      if (
        target.pathname === window.location.pathname &&
        target.search === window.location.search
      )
        return
      event.preventDefault()
      setPendingHref(`${target.pathname}${target.search}${target.hash}`)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [dirty])

  if (!hasMaster(master)) {
    return (
      <EmptyState
        icon={<FileText />}
        title="Build your master resume first"
        description="Tailoring copies your master, so it needs to exist before you can tailor a resume."
        action={
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Build your master
          </Link>
        }
      />
    )
  }

  if (jobId && !job) {
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

  const editorSkills = jobId
    ? jobSkills
        .filter((row) => row.jobApplicationId === jobId)
        .map((row) => ({
          name:
            catalog.find((skill) => skill.id === row.skillId)?.name ??
            'Unknown',
          required: row.required,
        }))
    : []

  function update(next: TailoredResumeData) {
    setData(next)
    setDirty(true)
  }

  function loadVersion(id: string) {
    const target = versions.find((row) => row.id === id)
    if (!target) return
    setData(structuredClone(target.data))
    setVersion(target.version)
    setFileName(target.fileName ?? fileName)
    setDirty(false)
    toast(`Loaded v${target.version}.`)
  }

  function save() {
    if (!dirty && version > 0) return
    const saved = useAppStore.getState().saveTailored({
      jobApplicationId: jobId,
      data,
      fileName,
    })
    setVersion(saved.version)
    setDirty(false)
    toast(`Saved as v${saved.version}.`)
  }

  async function download() {
    if (dirty) save()
    setDialogOpen(false)
    setGenerating(true)
    try {
      const { downloadResumePdf } = await import('@/lib/pdf/ats-document')
      await downloadResumePdf(data, fileName)
      toast('PDF downloaded.')
    } catch {
      toast.error('Could not generate the PDF. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  const contextLabel = standalone
    ? 'New resume'
    : `${company?.name ?? 'Application'} — ${job?.position ?? ''}`

  return (
    <div className="space-y-4">
      <div className="bg-background/80 sticky top-16 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b px-4 py-2.5 backdrop-blur lg:-mx-8 lg:px-8">
        <Link
          href={standalone ? '/dashboard' : `/jobs/${jobId}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
        <span className="min-w-0 truncate text-sm font-medium">
          {contextLabel}
        </span>

        {version > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'outline', size: 'xs' }),
                'gap-1',
              )}
            >
              v{version}
              <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Versions</DropdownMenuLabel>
              {versions.map((row) => (
                <DropdownMenuItem
                  key={row.id}
                  onClick={() => loadVersion(row.id)}
                >
                  v{row.version} · {row.fileName ?? 'resume.pdf'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="text-muted-foreground border-border rounded-full border px-2 py-0.5 text-xs">
            Draft
          </span>
        )}

        <span className="text-muted-foreground hidden text-xs sm:inline">
          {dirty
            ? 'Unsaved changes'
            : version > 0
              ? `Saved v${version}`
              : 'Not saved yet'}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden lg:inline-flex"
            onClick={save}
          >
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            className="hidden lg:inline-flex"
            onClick={() => setDialogOpen(true)}
            disabled={generating}
          >
            <Download className="size-3.5" /> Download
          </Button>
        </div>
      </div>

      <TailoringEditor
        data={data}
        onChange={update}
        jd={job?.jobDescription}
        jobSkills={editorSkills}
      />

      <div className="bg-background/95 sticky bottom-0 z-20 -mx-4 flex items-center gap-2 border-t px-4 py-2.5 backdrop-blur lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={save}
        >
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1"
          onClick={() => setDialogOpen(true)}
          disabled={generating}
        >
          <Download className="size-3.5" /> Download
        </Button>
      </div>

      <Dialog
        open={Boolean(pendingHref)}
        onOpenChange={(open) => {
          if (!open) setPendingHref(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              This resume has changes that aren&apos;t saved as a version yet.
              Leaving now discards them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPendingHref(null)}
            >
              Stay here
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                const href = pendingHref
                setPendingHref(null)
                if (href) router.push(href)
              }}
            >
              Discard and leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download resume</DialogTitle>
            <DialogDescription>
              Saves your changes as a version, then downloads the PDF.
              {standalone
                ? ' This resume is not attached to an application.'
                : ''}
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
