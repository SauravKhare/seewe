# seewe — Application Plan

**seewe** is a **resume tailor + job-application tracker** — not another generic resume builder.

## Problem → what it solves

Companies run resumes through ATS filtering and keyword-matching tools. Two things kill your chances:

1. **Untailored resume** — if your resume isn't tailored to the job description you're applying for, the filter drops you before a human ever reads it. Tailoring it per job by hand is tedious and easy to skip.
2. **"Image-in-PDF" resumes** — most online generators render a flat image inside a PDF that ATS parsers can't read as text. Your perfectly designed resume is invisible to the machine.

The core product is a **complete job tracker** where every tailored resume is ATS-parseable, tied to a tracked application, and built on a stable master resume.

## Core loop

> User arrives → selects **New job / new resume** → UI appears → paste the job description, then edit a copy of the master resume to fit the JD → master data is **never** mutated → download the ATS resume → the job is added as **applied** and the status timeline begins.

## Goals & non-goals (MVP)

### Must have (MVP)

1. **Auth** — email + password, secured with better-auth. Social providers (Google + GitHub) and email verification / password reset come after the first deploy.
2. **Completely secure & private** — per-user Postgres RLS isolation; documents in private object storage with signed URLs, media in Cloudinary.
3. **Job tracking** — jobs are added **manually by the user** (we can't track external applications). Fields: position, company, dates, skills, the resume version applied with, status actions.
4. **Tailoring editor** — while adding (or about-to-apply) a job, modify a **copy** of the master resume against the pasted job description. Master resume unchanged.
5. **ATS-safe output** — a single simple, machine-readable text-based resume format at MVP (templates/customization later).
6. **Download → marked applied** — downloading the tailored resume completes the "new job" flow and moves the job to `applied`.

### Explicitly out of scope for MVP (locked decisions)

- **No LLM / AI anywhere** in the MVP. No JD skill auto-extraction — job skills are entered manually. No AI cover-letter generation.
- **No auto-fetching of job descriptions from URLs** — JD is pasted text only. (No SSRF surface.)
- **Cover letters** — manual: stored as uploaded attachments and re-attached per job. Not generated.
- **No image-in-PDF resumes.** Text-first ATS output only.
- No resume scoring/ATS "score", no benchmarks against real ATS vendors.
- No multi-master "professional profiles" — **one master resume per user**, enforced by a required **master-first onboarding** step.

## User flows

### Onboarding (master-first, mandatory)

User signs up → prompted to build their **master resume** (headline, summary, contact, experience, education, skills, projects, certifications, languages). Master must exist and be non-empty before any tailoring. This is the canonical source of truth that tailoring never mutates.

### New job + tailored resume (combined flow)

1. Select **New job / resume**.
2. Add job application: company (normalized from existing companies where possible), position, pasted JD, dates, salary, work mode, employment type, required skills, expected salary, source, notes.
3. Editor loads the master resume → user tailors a copy (edit/remove/reorder sections, skills, bullets) to match the JD. **Skill gap highlighting**: master skills missing from the JD and JD skills missing from master are surfaced.
4. **Generate & download** the ATS resume → uploaded to a tailored version + rendered PDF in object storage. Master stays intact.
5. Job is marked `applied`. Tracking begins.

### Standalone tailoring (optional)

A tailored resume can be made **without** a job attached (pure resume editing) — `jobApplicationId` nullable. Same editor, no tracker rows needed.

### Re-tailoring & versioning

Resume can be re-tailored for the same job later → bumps the tailored version (v1 → v2 …). Old PDFs are preserved; the master is still never modified even when re-tailoring. The current version is what the job application points at.

### Job status tracking

Status enum (`saved/applied/heard_back/interviewing/rejected/offer`) with an **ordered status timeline** — every change appends to history with a note and timestamp. Track interviews, recruiter contacts (per application), follow-up dates, and attachments (resume / cover letter / JD file).

## Tech stack

| Area             | Choice                                                                        | Why                                                                  |
| ---------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Framework        | **Next.js** (App Router) + **Shadcn/ui** + **Tailwind**                       | Single deployable app                                                |
| ORM / migrations | **Drizzle** + `drizzle-kit generate`                                          | Type-first, Postgres enums/jsonb, typed RLS-friendly                 |
| Database         | **Postgres** (Neon prod; external local Postgres dev, no Compose)             | RLS per user, jsonb snapshots, enums                                 |
| Auth             | **better-auth** (email+password now; Google/GitHub post-deploy)               | Postgres adapter, session cookie                                     |
| Document storage | **Cloudflare R2** prod / **local filesystem** dev, signed URLs                | Private ATS PDFs + attachments never publicly served                 |
| Media            | **Cloudinary** (images + video; app assets + user media)                      | Optimized transforms, no binary in git or DB                         |
| Resume rendering | **`@react-pdf/renderer`** (client preview + server render)                    | True vector PDF; one document shared by preview and server            |
| Deployment       | Vercel + Neon Postgres + R2 + Cloudinary                                      | Managed, cheap; local DB and FS storage for dev                      |

### Security model (privacy core)

- **RLS** on every owned table, keyed to a **transaction-scoped `app.current_user_id` GUC** exposed through `app_current_user_id()`. Neon and plain Postgres do not ship Supabase's `auth.uid()`.
- Scoped **app role** (no `BYPASSRLS`) for runtime queries; separate **owner role** with `BYPASSRLS` used only for migrations/seeds.
- Documents in R2 are served only via **signed URLs** through an ownership-checked route; images/video live in Cloudinary; JD text lives in RLS-protected columns.
- better-auth session tables are read on a **service connection** (a session must resolve before a user id exists); all user-owned data goes through the RLS-scoped app connection.

## Architecture outline

```
Next.js app (better-auth, App Router, Shadcn, Tailwind, Drizzle)
  ├─ App Router routes (auth, dashboard, editor, job tracker, settings)
  ├─ Tailored-resume module (@react-pdf/renderer, text-first ATS output)
  ├─ better-auth (email+password, Postgres adapter)
  ├─ ORM: Drizzle → Postgres (RLS enabled, per-request GUC)
  ├─ Document storage (R2 prod / local FS dev) via signed URLs
  └─ Media (Cloudinary) for images and video
```

## Build phases

Detailed, resumable checklists live in **`DEVELOPMENT.md`**. Summary:

- **Phase 0 — Foundation** _(done)_: scaffold, tooling, design tokens, domain types, repository seam.
- **Phase 1 — Static UI** _(done)_: every route and flow works against the local store with seed data.
- **Phase 1.5 — Polish and stabilize** _(next)_: safe hydration, real client-side PDF download, standalone tailoring, save-as-draft, editor fidelity, auth UI with no demo/social, accessibility and copy.
- **Phase 2 — Backend:** Drizzle + Postgres with RLS, better-auth (email/password), repository swap, R2/local-FS documents, Cloudinary media, server-side ATS PDF, Vitest.
- **Phase 3 — Hardening and deploy:** RLS verification, secret scan, perf/a11y audit, deploy to Vercel + Neon + R2 + Cloudinary; then social auth and email flows.

## Data plan & DB schema

Full data model, ERD, and Postgres schema live in **`DATABASE.md`** (companion doc).

## Open / future (post-MVP)

- Social sign-in (Google, GitHub) and email verification / password reset — Phase 3.4.
- LLM-powered JD skill extraction & gap suggestions.
- Cover-letter generation.
- Resume templates + customization options.
- ATS score/benchmarking.
- Multiple "professional profiles" (masters) per user.
- Auto-fetch of JD from URL.
