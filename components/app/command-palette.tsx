'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  ListChecks,
  Plus,
  Search,
  Settings,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useAppStore } from '@/lib/data/store'

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const jobs = useAppStore((state) => state.jobs)
  const companies = useAppStore((state) => state.companies)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const run = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  const companyName = (id: string) =>
    companies.find((company) => company.id === id)?.name ?? 'Unknown'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:bg-muted/60 focus-visible:ring-ring flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none md:w-64"
      >
        <Search className="size-3.5" />
        <span className="hidden md:inline">Search jobs, companies…</span>
        <kbd className="hidden rounded border px-1.5 font-mono text-[10px] md:ml-auto md:inline">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Jump to a job, company, or page."
      >
        <CommandInput placeholder="Search jobs, companies…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Jobs">
            {jobs.map((job) => (
              <CommandItem
                key={job.id}
                value={`${job.position} ${companyName(job.companyId)} ${job.id}`}
                onSelect={() => run(`/jobs/${job.id}`)}
              >
                <BriefcaseBusiness />
                <span className="truncate">{job.position}</span>
                <span className="text-muted-foreground ml-auto truncate text-xs">
                  {companyName(job.companyId)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Companies">
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                value={`${company.name} ${company.id}`}
                onSelect={() =>
                  run(`/jobs?q=${encodeURIComponent(company.name)}`)
                }
              >
                <Building2 />
                {company.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Go to">
            <CommandItem onSelect={() => run('/dashboard')}>
              <LayoutDashboard /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => run('/jobs')}>
              <BriefcaseBusiness /> Jobs
            </CommandItem>
            <CommandItem onSelect={() => run('/resume')}>
              <FileText /> Master resume
            </CommandItem>
            <CommandItem onSelect={() => run('/companies')}>
              <ListChecks /> Companies
            </CommandItem>
            <CommandItem onSelect={() => run('/settings')}>
              <Settings /> Settings
            </CommandItem>
            <CommandItem onSelect={() => run('/jobs/new')}>
              <Plus /> New job / resume
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
