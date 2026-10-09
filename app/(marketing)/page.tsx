import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Check,
  FileText,
  LayoutDashboard,
} from 'lucide-react'

import { ResumePaper } from '@/components/app/resume-paper'
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

const SEARCH_CARDS = [
  {
    icon: FileText,
    title: 'Tailor with intention',
    body: 'See the role beside your resume, then make a focused version that connects your experience to what matters most.',
  },
  {
    icon: Building2,
    title: 'Keep your source of truth',
    body: 'Your master resume stays intact. Every tailored version is a safe, editable copy you can revisit anytime.',
  },
  {
    icon: LayoutDashboard,
    title: 'Track the whole search',
    body: 'Save roles, record applications, and know exactly what needs your attention next.',
  },
]

const SAMPLE_ROWS = [
  {
    company: 'Stripe',
    role: 'Backend Engineer',
    status: 'Interviewing',
    tone: 'amber',
  },
  {
    company: 'Linear',
    role: 'Platform Engineer',
    status: 'Applied',
    tone: 'blue',
  },
  {
    company: 'Vercel',
    role: 'Software Engineer',
    status: 'Heard back',
    tone: 'green',
  },
] as const

const TONE_CLASS: Record<string, string> = {
  amber: 'bg-status-heard-back/15 text-status-heard-back',
  blue: 'bg-status-interviewing/15 text-status-interviewing',
  green: 'bg-status-applied/15 text-status-applied',
}

export default function LandingPage() {
  return (
    <main className="landing">
      <section
        id="product"
        className="mx-auto grid max-w-6xl items-start gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:py-24"
      >
        <div className="space-y-6">
          <SectionLabel className="flex items-center gap-2">
            <span className="bg-focus h-px w-7" />
            Resume intelligence for your job search
          </SectionLabel>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl sm:leading-[1.05]">
            Tailor your resume <span className="text-focus">before</span> the
            machine reads it.
          </h1>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Paste a job description, edit a copy of your master resume to match
            it, and download a tailored PDF. Your master never changes.
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
          <div className="space-y-3 pt-4">
            <SectionLabel>Built for thoughtful job seekers</SectionLabel>
            <div className="text-muted-foreground/50 flex flex-wrap items-center gap-6 text-sm font-semibold tracking-tight">
              <span>Acme</span>
              <span>Northwind</span>
              <span>Linear</span>
              <span>Globex</span>
              <span>Initech</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs">
            A clearer path from job post to interview
          </p>
          <div className="bg-card rounded-md border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <SectionLabel>Resume preview</SectionLabel>
            <ResumePaper data={SAMPLE} compact className="mt-4" />
            <p className="text-muted-foreground flex items-center gap-1.5 pt-3 text-[11px]">
              <span
                aria-hidden
                className="bg-status-applied size-1.5 rounded-full"
              />
              Live preview
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-lg border p-8">
            <SectionLabel className="text-focus">
              A calmer way to apply
            </SectionLabel>
            <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wide uppercase">
              How it works
            </p>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className={cn(
                    index > 0 && 'md:border-l md:pl-8',
                    index === 0 && 'md:pr-8',
                  )}
                >
                  <span className="text-focus font-mono text-xs">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionLabel>The problem</SectionLabel>
          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                Good experience gets lost in a generic resume.
              </h2>
              <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
                Most applications start with the same document, even when every
                role asks for something different. The result is a resume that
                is technically correct, but easy to overlook and hard for a
                hiring manager to remember.
              </p>
            </div>
            <div className="space-y-6">
              <div className="border-t pt-4">
                <span className="text-focus font-mono text-xs">01</span>
                <h3 className="mt-2 text-sm font-semibold">
                  One resume, every role
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Strong stories get buried under irrelevant detail.
                </p>
              </div>
              <div className="border-t pt-4">
                <span className="text-focus font-mono text-xs">02</span>
                <h3 className="mt-2 text-sm font-semibold">
                  Guesswork after you apply
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Follow-ups, statuses, and next steps live in too many places.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-solution border-t">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionLabel>A calmer way to search</SectionLabel>
          <div className="border-border bg-border mt-8 grid gap-px overflow-hidden rounded-lg border md:grid-cols-3">
            {SEARCH_CARDS.map((card) => (
              <div key={card.title} className="bg-card/80 p-6">
                <div
                  data-slot="resume-solution-icon"
                  className="flex h-8 w-8 items-center justify-center rounded-full border"
                >
                  <card.icon className="size-4" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{card.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <SectionLabel>Your search, in view</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              Turn applications into a system.
            </h2>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              Seewe gives every opportunity a place to live, from the first
              saved job to the final follow-up.
            </p>
          </div>
          <div className="bg-card rounded-md border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.03)]">
            <div className="divide-y">
              {SAMPLE_ROWS.map((row) => (
                <div
                  key={row.company}
                  className="grid grid-cols-[1fr_1.2fr_auto] items-center gap-4 py-4 text-xs"
                >
                  <span className="font-semibold">{row.company}</span>
                  <span className="text-muted-foreground">{row.role}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-medium',
                      TONE_CLASS[row.tone],
                    )}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
