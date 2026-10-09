import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'

import { AtsParsePanel } from '@/components/app/ats-parse-panel'
import { SectionLabel } from '@/components/app/section-label'
import { buttonVariants } from '@/components/ui/button'
import { tailoredResumes } from '@/lib/data/fixtures'
import { cn } from '@/lib/utils'

const SAMPLE = tailoredResumes[1].data

const STEPS = [
  {
    title: 'Build your master',
    body: 'Keep one complete, accurate resume as your source of truth.',
  },
  {
    title: 'Tailor per job',
    body: 'Make a focused copy that speaks directly to each opportunity.',
  },
  {
    title: 'Track applications',
    body: 'Stay on top of follow-ups and see your search clearly.',
  },
]

export default function LandingPage() {
  return (
    <main>
      <section
        id="product"
        className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28"
      >
        <div className="space-y-6">
          <SectionLabel className="flex items-center gap-2">
            <span className="bg-focus h-px w-7" />
            Resume intelligence for your job search
          </SectionLabel>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl sm:leading-[1.05]">
            Tailor your resume{' '}
            <span className="text-focus">before</span> the machine reads it.
          </h1>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Paste a job description, edit a copy of your master resume to match
            it, and download a PDF any ATS can read. Your master never changes.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              Start free <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              See a demo <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-5 text-xs">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" /> Your data stays private
            </span>
          </div>
        </div>
        <div id="demo">
          <AtsParsePanel data={SAMPLE} autoReveal />
        </div>
      </section>

      <section id="how" className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionLabel>How it works</SectionLabel>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title}>
                <span className="text-focus font-mono text-xs">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl items-center gap-2 px-6 py-6 text-xs">
          <Sparkles className="size-4" />
          Per-user isolation, private file storage, signed download links.
        </div>
      </section>
    </main>
  )
}
