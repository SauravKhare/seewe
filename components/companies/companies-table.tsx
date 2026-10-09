'use client'

import { useState } from 'react'
import { Building2, Pencil, Plus } from 'lucide-react'

import { EmptyState } from '@/components/app/empty-state'
import { Field } from '@/components/app/field'
import { PageHeading } from '@/components/app/page-heading'
import { Panel } from '@/components/app/panel'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/lib/data/store'
import type { Company } from '@/lib/types'

interface Draft {
  id?: string
  name: string
  website: string
  careersUrl: string
  industry: string
  size: string
  notes: string
}

const EMPTY: Draft = {
  name: '',
  website: '',
  careersUrl: '',
  industry: '',
  size: '',
  notes: '',
}

export function CompaniesTable() {
  const companies = useAppStore((state) => state.companies)
  const jobs = useAppStore((state) => state.jobs)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)

  const sorted = [...companies].sort((a, b) => a.name.localeCompare(b.name))

  function openNew() {
    setDraft(EMPTY)
    setOpen(true)
  }

  function openEdit(company: Company) {
    setDraft({
      id: company.id,
      name: company.name,
      website: company.website ?? '',
      careersUrl: company.careersUrl ?? '',
      industry: company.industry ?? '',
      size: company.size ?? '',
      notes: company.notes ?? '',
    })
    setOpen(true)
  }

  function save() {
    if (!draft.name.trim()) return
    const store = useAppStore.getState()
    const patch = {
      name: draft.name.trim(),
      website: draft.website || undefined,
      careersUrl: draft.careersUrl || undefined,
      industry: draft.industry || undefined,
      size: draft.size || undefined,
      notes: draft.notes || undefined,
    }
    if (draft.id) {
      store.updateCompany(draft.id, patch)
    } else {
      const created = store.createCompany(draft.name.trim())
      store.updateCompany(created.id, patch)
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Workspace"
        title="Companies"
        description="Reused automatically when you add a job."
        actions={
          <Button type="button" size="sm" onClick={openNew}>
            <Plus className="size-3.5" /> New company
          </Button>
        }
      />

      <Panel className="overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Building2 />}
            title="No companies yet"
            description="Add a company to reuse it across applications."
            action={
              <Button type="button" size="sm" onClick={openNew}>
                <Plus className="size-3.5" /> New company
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Name</TableHead>
                <TableHead className="hidden md:table-cell">Website</TableHead>
                <TableHead className="hidden lg:table-cell">Careers</TableHead>
                <TableHead className="hidden lg:table-cell">Industry</TableHead>
                <TableHead className="hidden xl:table-cell">Size</TableHead>
                <TableHead className="text-right">Applications</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((company) => {
                const count = jobs.filter(
                  (job) => job.companyId === company.id,
                ).length
                return (
                  <TableRow key={company.id}>
                    <TableCell className="pl-5 font-medium">
                      {company.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {company.website || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {company.careersUrl || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {company.industry || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell">
                      {company.size || '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {count}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${company.name}`}
                        onClick={() => openEdit(company)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {draft.id ? 'Edit company' : 'New company'}
            </DialogTitle>
            <DialogDescription>
              Companies are reused when you add a job.
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Website">
                <Input
                  value={draft.website}
                  onChange={(event) =>
                    setDraft({ ...draft, website: event.target.value })
                  }
                />
              </Field>
              <Field label="Careers URL">
                <Input
                  value={draft.careersUrl}
                  onChange={(event) =>
                    setDraft({ ...draft, careersUrl: event.target.value })
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Industry">
                <Input
                  value={draft.industry}
                  onChange={(event) =>
                    setDraft({ ...draft, industry: event.target.value })
                  }
                />
              </Field>
              <Field label="Size">
                <Input
                  value={draft.size}
                  placeholder="50-200"
                  onChange={(event) =>
                    setDraft({ ...draft, size: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea
                rows={2}
                value={draft.notes}
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
              disabled={!draft.name.trim()}
              onClick={save}
            >
              {draft.id ? 'Save company' : 'Add company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
