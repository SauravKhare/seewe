'use client'

import { useState } from 'react'
import { Mail, Plus, Trash2 } from 'lucide-react'

import { Field } from '@/components/app/field'
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
import { useAppStore } from '@/lib/data/store'
import { createId } from '@/lib/id'
import type { ContactPerson } from '@/lib/types'

export function ContactsPanel({ jobId }: { jobId: string }) {
  const contacts = useAppStore((state) => state.contacts)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<ContactPerson>(() => emptyContact(jobId))

  const rows = contacts.filter((row) => row.jobApplicationId === jobId)

  function openDialog() {
    setDraft(emptyContact(jobId))
    setOpen(true)
  }

  function save() {
    if (draft.name.trim().length === 0) return
    useAppStore.getState().upsertContact({ ...draft, name: draft.name.trim() })
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Contacts</h2>
        <Button type="button" variant="outline" size="sm" onClick={openDialog}>
          <Plus className="size-3.5" /> Add contact
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No contacts yet.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {rows.map((row) => (
            <li key={row.id} className="flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{row.name}</p>
                {row.role ? (
                  <p className="text-muted-foreground text-xs">{row.role}</p>
                ) : null}
                {row.email ? (
                  <a
                    href={`mailto:${row.email}`}
                    className="text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-1 text-xs"
                  >
                    <Mail className="size-3" /> {row.email}
                  </a>
                ) : null}
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
                aria-label={`Remove ${row.name}`}
                onClick={() => useAppStore.getState().removeContact(row.id)}
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
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>
              Keep the people you talk to on this application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Name">
              <Input
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </Field>
            <Field label="Role">
              <Input
                value={draft.role ?? ''}
                placeholder="Technical Recruiter"
                onChange={(event) =>
                  setDraft({ ...draft, role: event.target.value })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <Input
                  type="email"
                  value={draft.email ?? ''}
                  onChange={(event) =>
                    setDraft({ ...draft, email: event.target.value })
                  }
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={draft.phone ?? ''}
                  onChange={(event) =>
                    setDraft({ ...draft, phone: event.target.value })
                  }
                />
              </Field>
            </div>
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
            <Button
              type="button"
              size="sm"
              disabled={draft.name.trim().length === 0}
              onClick={save}
            >
              Add contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function emptyContact(jobId: string): ContactPerson {
  return {
    id: createId('contact'),
    jobApplicationId: jobId,
    name: '',
    role: '',
    email: '',
    phone: '',
    notes: '',
  }
}
