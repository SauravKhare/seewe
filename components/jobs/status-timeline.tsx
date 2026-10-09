'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Field } from '@/components/app/field'
import { SelectField } from '@/components/app/select-field'
import { StatusPill } from '@/components/app/status-pill'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_DOT_CLASS, STATUS_LABELS, STATUS_ORDER } from '@/lib/constants'
import { useAppStore } from '@/lib/data/store'
import { formatDateTime } from '@/lib/format'
import type { ApplicationStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = STATUS_ORDER.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}))

export function StatusTimeline({ jobId }: { jobId: string }) {
  const history = useAppStore((state) => state.statusHistory)
  const job = useAppStore((state) => state.jobs.find((row) => row.id === jobId))

  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<ApplicationStatus>('applied')
  const [note, setNote] = useState('')

  const entries = history
    .filter((entry) => entry.jobApplicationId === jobId)
    .sort((a, b) => a.changedAt.localeCompare(b.changedAt))

  function openDialog() {
    setStatus(job?.status ?? 'applied')
    setNote('')
    setOpen(true)
  }

  function submit() {
    if (!job || note.trim().length === 0) return
    useAppStore.getState().changeStatus(job.id, status, note.trim())
    toast('Status updated.')
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Status timeline</h2>
        <Button type="button" variant="outline" size="sm" onClick={openDialog}>
          <Plus className="size-3.5" /> Change status
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">No status history yet.</p>
      ) : (
        <ol className="relative space-y-4 border-l pl-5">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                aria-hidden
                className={cn(
                  'absolute top-1 -left-[1.4375rem] size-2.5 rounded-full ring-4 ring-background',
                  STATUS_DOT_CLASS[entry.status],
                )}
              />
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={entry.status} />
                <time className="text-muted-foreground text-xs">
                  {formatDateTime(entry.changedAt)}
                </time>
              </div>
              {entry.note ? (
                <p className="text-muted-foreground mt-1 text-sm">{entry.note}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change status</DialogTitle>
            <DialogDescription>
              Add a note so the timeline explains why it changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="New status">
              <SelectField
                value={status}
                onChange={(value) => setStatus(value as ApplicationStatus)}
                options={STATUS_OPTIONS}
              />
            </Field>
            <Field label="Note" hint="Required.">
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Recruiter scheduled a technical screen."
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={note.trim().length === 0}
              onClick={submit}
            >
              Save status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
