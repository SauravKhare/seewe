'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'

import { PageHeading } from '@/components/app/page-heading'
import { ResumePaper } from '@/components/app/resume-paper'
import { buttonVariants } from '@/components/ui/button'
import { useAppStore } from '@/lib/data/store'
import { tailoredFromMaster } from '@/lib/tailoring'
import { cn } from '@/lib/utils'

export function MasterResume() {
  const master = useAppStore((state) => state.master)
  const catalog = useAppStore((state) => state.skills)

  const data = tailoredFromMaster(master, catalog)

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Master resume"
        title="Your source document"
        description="This is your master. Tailored resumes edit a copy."
        actions={
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            <Pencil className="size-3.5" /> Edit
          </Link>
        }
      />

      <div className="border-focus/30 bg-focus/5 text-focus rounded-md border px-3.5 py-2.5 text-xs">
        This is your master. Tailored resumes edit a copy.
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <ResumePaper data={data} />

        <aside className="space-y-4">
          <section className="bg-card rounded-md border p-4">
            <h2 className="text-sm font-semibold">Sections</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {(
                [
                  ['Experience', master.experience.length],
                  ['Education', master.education.length],
                  ['Skills', master.skills.length],
                  ['Projects', master.projects.length],
                  ['Certifications', master.certifications.length],
                  ['Languages', master.languages.length],
                ] as const
              ).map(([label, count]) => (
                <li
                  key={label}
                  className="text-muted-foreground flex items-center justify-between"
                >
                  <span>{label}</span>
                  <span className="font-mono text-xs">{count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card rounded-md border p-4">
            <h2 className="text-sm font-semibold">Tailoring gate</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Tailoring stays available while Experience, Education, and Skills
              are non-empty.
            </p>
            <Link
              href="/jobs/new"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'mt-3 w-full',
              )}
            >
              Tailor for a job
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
