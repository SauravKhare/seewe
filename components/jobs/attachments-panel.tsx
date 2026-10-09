'use client'

import { useState } from 'react'
import { FileText, Plus, Trash2 } from 'lucide-react'

import { Field } from '@/components/app/field'
import { SelectField } from '@/components/app/select-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ATTACHMENT_TYPE_LABELS } from '@/lib/constants'
import { useAppStore } from '@/lib/data/store'
import { createId } from '@/lib/id'
import type { AttachmentType, JobAttachment } from '@/lib/types'

const TYPE_OPTIONS = (
  Object.keys(ATTACHMENT_TYPE_LABELS) as AttachmentType[]
).map((type) => ({ value: type, label: ATTACHMENT_TYPE_LABELS[type] }))

export function AttachmentsPanel({ jobId }: { jobId: string }) {
  const attachments = useAppStore((state) => state.attachments)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<JobAttachment>(() =>
    emptyAttachment(jobId),
  )

  const rows = attachments.filter((row) => row.jobApplicationId === jobId)

  function openDialog() {
    setDraft(emptyAttachment(jobId))
    setOpen(true)
  }

  function save() {
    if (draft.fileName.trim().length === 0) return
    useAppStore
      .getState()
      .addAttachment({ ...draft, fileName: draft.fileName.trim() })
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Attachments</h2>
        <Button type="button" variant="outline" size="sm" onClick={openDialog}>
          <Plus className="size-3.5" /> Add attachment
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No attachments yet.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3 p-3">
              <FileText className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{row.fileName}</p>
                <p className="text-muted-foreground text-xs">
                  {ATTACHMENT_TYPE_LABELS[row.type]}
                </p>
              </div>
              <span className="text-muted-foreground hidden text-xs sm:inline">
                No file yet
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${row.fileName}`}
                onClick={() => useAppStore.getState().removeAttachment(row.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add attachment</DialogTitle>
            <DialogDescription>
              Track documents by name. Real uploads arrive in Phase 2.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Type">
              <SelectField
                value={draft.type}
                onChange={(value) =>
                  setDraft({ ...draft, type: value as AttachmentType })
                }
                options={TYPE_OPTIONS}
              />
            </Field>
            <Field label="File name">
              <Input
                value={draft.fileName}
                placeholder="jane-doe-acme-resume-v1.pdf"
                onChange={(event) =>
                  setDraft({ ...draft, fileName: event.target.value })
                }
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
              disabled={draft.fileName.trim().length === 0}
              onClick={save}
            >
              Add attachment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function emptyAttachment(jobId: string): JobAttachment {
  return {
    id: createId('att'),
    jobApplicationId: jobId,
    type: 'resume',
    fileName: '',
  }
}
