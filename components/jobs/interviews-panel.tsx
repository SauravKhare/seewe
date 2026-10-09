'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

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
import { Textarea } from '@/components/ui/textarea'
import { INTERVIEW_TYPE_LABELS } from '@/lib/constants'
import { useAppStore } from '@/lib/data/store'
import { formatDateTime } from '@/lib/format'
import { createId } from '@/lib/id'
import type { Interview, InterviewType } from '@/lib/types'

const TYPE_OPTIONS = (
  Object.keys(INTERVIEW_TYPE_LABELS) as InterviewType[]
).map((type) => ({ value: type, label: INTERVIEW_TYPE_LABELS[type] }))

export function InterviewsPanel({ jobId }: { jobId: string }) {
  const interviews = useAppStore((state) => state.interviews)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Interview>(() => emptyInterview(jobId))

  const rows = interviews.filter((row) => row.jobApplicationId === jobId)

  function openDialog() {
    setDraft(emptyInterview(jobId))
    setOpen(true)
  }

  function save() {
    if (!draft.type) return
    useAppStore.getState().upsertInterview(draft)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Interviews</h2>
        <Button type="button" variant="outline" size="sm" onClick={openDialog}>
          <Plus className="size-3.5" /> Add interview
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No interviews scheduled yet.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {rows
            .slice()
            .sort((a, b) => a.round - b.round)
            .map((row) => (
              <li key={row.id} className="flex items-start gap-3 p-3">
                <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  R{row.round}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {INTERVIEW_TYPE_LABELS[row.type]}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDateTime(row.scheduledAt) || 'Not scheduled'}
                    {row.outcome ? ` · ${row.outcome}` : ''}
                  </p>
                  {row.notes ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {row.notes}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove interview"
                  onClick={() =>
                    useAppStore.getState().removeInterview(row.id)
                  }
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
            <DialogTitle>Add interview</DialogTitle>
            <DialogDescription>
              Track each round and its outcome.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Round">
                <Input
                  type="number"
                  min={1}
                  value={draft.round}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      round: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                />
              </Field>
              <Field label="Type">
                <SelectField
                  value={draft.type}
                  onChange={(value) =>
                    setDraft({ ...draft, type: value as InterviewType })
                  }
                  options={TYPE_OPTIONS}
                />
              </Field>
            </div>
            <Field label="Scheduled">
              <Input
                type="datetime-local"
                value={draft.scheduledAt ?? ''}
                onChange={(event) =>
                  setDraft({ ...draft, scheduledAt: event.target.value })
                }
              />
            </Field>
            <Field label="Outcome">
              <Input
                value={draft.outcome ?? ''}
                placeholder="Scheduled, Passed, Failed"
                onChange={(event) =>
                  setDraft({ ...draft, outcome: event.target.value })
                }
              />
            </Field>
            <Field label="Notes">
              <Textarea
                rows={2}
                value={draft.notes ?? ''}
                onChange={(event) =>
                  setDraft({ ...draft, notes: event.target.value })
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
            <Button type="button" size="sm" onClick={save}>
              Add interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function emptyInterview(jobId: string): Interview {
  return {
    id: createId('int'),
    jobApplicationId: jobId,
    round: 1,
    type: 'phone',
    scheduledAt: '',
    outcome: '',
    notes: '',
  }
}
