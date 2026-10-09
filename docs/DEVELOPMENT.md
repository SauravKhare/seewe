# seewe — Development Plan

Companion to `PLAN.md`, `DATABASE.md`, and `UI.md`.

## How to use this document

The work is split into numbered phases. Each phase is self-contained and can be
resumed on its own. To continue work, tell the agent which phase to start, for
example "start Phase 1.5" or "resume Phase 1.5, step 4".

Status markers: `[x]` done, `[ ]` not started, `[~]` in progress.

Phases:

- **Phase 0 — Foundation** (done)
- **Phase 1 — Static UI with demo data** (done)
- **Phase 1.5 — Polish and stabilize** (next)
- **Phase 2 — Backend: data, auth, storage, PDF**
- **Phase 3 — Hardening and deploy**

## Locked decisions

- Single Next.js app at the repo root. Docs live in `docs/`.
- Tailwind utilities with shadcn/ui primitives, themed through CSS variables
  (light and dark). Tokens come from `UI.md`.
- Static phase: Zustand store persisted to localStorage, seeded from fixtures,
  accessed through `lib/data/repository.ts`. Phase 2 swaps the repository
  implementation without touching component code.
- All routes are clickable in Phase 1 and Phase 1.5.
- Auth: email + password only in Phase 2. Social providers are deferred until
  after the first deploy. No email verification or password reset until a mail
  provider is added.
- No LLM anywhere in the MVP. Job skills are entered manually.
- Database: **Postgres on Neon** in production; an external locally hosted
  Postgres (`ceewe`, user `saurav`) for development. **No Docker/Compose/MinIO
  files in the repo** — the local database is user-managed.
- File storage: **documents** (resume PDFs, attachments) go to **Cloudflare R2**
  in production and to the **local filesystem** in development. **Images and
  video** (marketing assets and user media) go to **Cloudinary**.
- Isolation: Postgres **RLS** per user, keyed to a transaction-scoped GUC
  (`app.current_user_id`). Scoped app role without `BYPASSRLS`.
- PDF: **`@react-pdf/renderer`**, server-side in Phase 2 (client-side preview
  already works in Phase 1.5).
- ESLint and Prettier from Phase 0. Vitest arrives in Phase 2.
- Security is built in as features land, not bolted on: validation at every
  boundary, security headers, generic auth errors, upload checks.

## Target structure

```
seewe/
  docs/            PLAN.md, DATABASE.md, UI.md, DEVELOPMENT.md
  app/
    layout.tsx  globals.css
    (marketing)/                # nav, footer, landing page
    (auth)/                     # sign-in, sign-up
    onboarding/page.tsx         # master resume builder + gate
    (app)/
      layout.tsx                # shell
      dashboard/page.tsx
      jobs/page.tsx  jobs/new/page.tsx  jobs/[id]/page.tsx
      editor/[id]/page.tsx  editor/new/page.tsx
      resume/page.tsx  companies/page.tsx  settings/page.tsx
    api/                        # Phase 2: auth, files
  components/
    ui/            # shadcn primitives
    app/ auth/ marketing/ dashboard/ jobs/ editor/ onboarding/ resume/
    settings/ companies/
    store-hydration.tsx  theme-provider.tsx
  lib/
    types.ts       # domain types mirroring DATABASE.md
    constants.ts   # labels and ordering maps
    format.ts  id.ts  resume.ts  tailoring.ts  utils.ts
    auth/          # fake-auth (Phase 1) → better-auth (Phase 2)
    data/          # repository.ts (the seam), store.ts, fixtures.ts
    db/            # Phase 2: Drizzle schema + client
    storage/       # Phase 2: StoragePort + fs/r2 drivers
    media/         # Phase 2: Cloudinary helpers
    pdf/           # Phase 2: @react-pdf/renderer ATS document
    validation/    # Phase 2: zod schemas
  drizzle/         # Phase 2: generated migrations
  scripts/seed.ts  # Phase 2: dev seed from fixtures
  proxy.ts         # Next 16 request interception (formerly middleware)
```

Tech baseline: Next.js 16.4, React 19.3, Tailwind 4.3, shadcn 4 (base-ui),
TypeScript 5.7, pnpm 11, Zustand 5. Phase 2 adds Drizzle, `postgres.js`,
better-auth, `@aws-sdk/client-s3`, `@react-pdf/renderer`, `zod`, and Vitest.

---

## Phase 0 — Foundation

**Status: done.**

- [x] 0.1 Init git at the repo root and add `.gitignore`.
- [x] 0.2 Create `docs/` and move `PLAN.md`, `DATABASE.md`, `UI.md` into it.
- [x] 0.3 Promote the v0 scaffold to the repo root. The generated demo is
      archived as `seewe-ui-specification.zip` and is not tracked in git.
- [x] 0.4 `pnpm install`, add zustand, next-themes, geist, eslint, prettier.
- [x] 0.5 Map UI.md tokens to Tailwind and shadcn CSS variables, add Geist Sans
      and Geist Mono, wire dark mode with next-themes.
- [x] 0.6 ESLint, Prettier, strict typecheck, and scripts: `dev`, `build`,
      `start`, `lint`, `format`, `format:check`, `typecheck`. Removed
      `ignoreBuildErrors`.
- [x] 0.7 Add shadcn primitives.
- [x] 0.8 Domain types and enums in `lib/types.ts`, including `TailoredResumeData`.
- [x] 0.9 Repository interface, fixtures (Jane Doe seed), and the Zustand store.
- [x] 0.10 Verify `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.

Done when the app builds, lints, and typechecks, and the seed data and repository
are importable.

---

## Phase 1 — Static UI with demo data

**Status: done.** Every route is clickable and interactive against the local
store. No backend. Commits `b8f892c` … `ab7e64e`.

- [x] 1.1 Shared components: StatusPill, StatCard, Panel, SectionLabel,
      EmptyState, Skeleton, toast helpers, ATS parse panel, ResumePaper,
      SortableList, BulletListEditor, SkillsEditor, Combobox, SelectField,
      SegmentedControl, Field.
- [x] 1.2 Layouts: marketing nav + footer, auth layout, `(app)` shell (Sidebar +
      Topbar) with the fake-auth gate, plus `proxy.ts` (Next 16 renamed the
      `middleware` convention to `proxy`).
- [x] 1.3 Landing page with the `AtsParsePanel` (Visual / ATS toggle).
- [x] 1.4 Auth: sign-in and sign-up with fake-auth cookie and demo credentials.
- [x] 1.5 Onboarding: master resume builder with add/edit/remove/reorder for
      items and bullets, plus the tailoring gate.
- [x] 1.6 Dashboard: status cards, follow-ups due, recent applications.
- [x] 1.7 Jobs list: table, search, filters, sort, row actions, empty state.
- [x] 1.8 Job detail: header, status timeline, status-change dialog, tabs for
      overview/interviews/contacts/attachments.
- [x] 1.9 New-job wizard: four-step flow ending in download and marked applied.
- [x] 1.10 Tailoring editor: three panes, master visibility and reorder,
      editable copy, JD box, gap panel, ATS toggle, versions, download stub.
- [x] 1.11 Master resume view, Companies, Settings.
- [x] 1.12 Responsive (to 360px), accessibility, and copy pass.
- [x] 1.13 Confirm the seed dataset fills every screen; add an empty-state toggle.
- [x] 1.14 Archive the generated demo, final lint, typecheck, build.

Done when a user can go landing to sign-in to onboarding to dashboard, add a
job, tailor a resume, and download, all against local data.

**Known rough edges carried into Phase 1.5** (found in review): store hydration
races stale component state, downloads still toast instead of producing a file,
standalone tailoring is unreachable, save and download both create versions, the
desktop table rows are not keyboard accessible, the ATS panel shows a fabricated
"98% readable" score, and several onboarding completeness checks pass on empty
items. These are enumerated below.

---

## Phase 1.5 — Polish and stabilize

Goal: the same product, but flawless against local data — no broken routes, no
lying controls, a real PDF download, and a consistent, readable UI. No backend.

### 1.5.1 Correctness and data integrity

- [x] `useHydrated()` hook and a `StoreGate` that renders skeletons until the
      persisted store has rehydrated. Fix the stale `useState` initializers in
      `EditorPage` and `NewJobWizard` that read the seed before hydration.
- [x] Real download: a shared `AtsDocument` built with `@react-pdf/renderer`,
      rendered in the browser with `pdf().toBlob()`. Replace the toast stubs in
      the editor, job detail, attachments panel, and wizard.
- [x] Standalone tailoring: a `/editor/new` route and a job-less `EditorPage`.
      Point the dashboard's "Tailor a resume without a job" at it.
- [x] Decouple save from download in the wizard: "Save as draft" creates/updates
      a `saved` job; only the download step marks it `applied`. Stop repeated
      Save clicks from creating duplicate versions.
- [x] `deleteJob` also removes the job's `tailored` rows.
- [x] Normalize `jobUrl`: prefix `https://` only when no scheme is present, and
      allow http/https only.
- [x] Enforce the master-first gate at every Tailor entry point; redirect to
      `/onboarding` when the master is empty.

### 1.5.2 Onboarding

- [x] Completeness checks require real fields (e.g. title + company), not item
      count, so empty cards do not mark a section done.
- [x] Prune empty, untouched items when leaving a section.
- [x] Replace the fake "Saved just now" header with a real autosave indicator.
- [x] Add Back/Next navigation between sections; keep "Save and continue" within
      reach on long sections.

### 1.5.3 Tailoring editor fidelity (UI.md 5.8)

- [x] Per-item drag reorder inside each section; section-level order stays.
- [x] A "Removed" tray with restore markers for removed items.
- [x] The gap panel distinguishes required from optional job skills.

### 1.5.4 Auth UI

- [x] Email + password forms only. Remove the demo credentials banner, the
      Google/GitHub buttons, and the auth-layout "no data is saved" note.
- [x] Password show/hide, confirm-password match, generic auth errors.
- [x] Remove `DEMO_EMAIL`/`DEMO_PASSWORD` from `fake-auth.ts` and `fixtures.ts`.

### 1.5.5 UX, accessibility, readability

- [x] `loading.tsx`, `error.tsx`, `not-found.tsx`, and skeletons.
- [x] Keyboard-accessible table rows (replace `<tr onClick>` with links/buttons).
- [x] Focus rings on filter pills; raise body copy toward 14px.
- [x] Top-bar search becomes a `⌘K` command palette over jobs and companies.
- [x] Mobile single-pane editor (Master / Tailored / JD), sticky action bar, and
      an unsaved-changes guard.
- [x] Theme toggle in the user menu.
- [x] Marketing honesty: remove the fabricated "98% readable" score, the dead
      `#pricing` link, and the "No credit card required" claim. Fix anchors.
- [x] Hide the dev-only demo toggles in Settings behind an environment flag
      (`NEXT_PUBLIC_ENABLE_DEMO_TOOLS`).

Done when every route and control does what it says, the core loop produces a
real PDF, and the app passes lint, typecheck, and build with no known rough
edges.

---

## Phase 2 — Backend: data, auth, storage, PDF

Goal: replace the local store with Postgres behind the same repository
interface, add real authentication and file storage, and generate ATS PDFs
server-side.

### 2.1 Configuration and secrets

- [ ] `.env.example` with placeholders only; `.env.local` gitignored. No secrets
      in the repo or in docs.
- [ ] Runtime config module reading and validating environment variables (zod).
- [ ] Dev database: `postgresql://saurav:admin@localhost:5432/ceewe`
      (user-managed, not defined in this repo). Prod: Neon pooled connection.
- [ ] Gitignore `.data/` (local blob storage) and `seewe-ui-specification.zip`.

### 2.2 Database and RLS

- [ ] Drizzle schema in `lib/db/schema.ts` per `DATABASE.md`; migrations with
      `drizzle-kit generate`.
- [ ] `postgres.js` client over a pooled connection (`lib/db/client.ts`).
- [ ] `app_current_user_id()` reading the `app.current_user_id` GUC; `withUser`
      helper that runs each repository call in a transaction using
      `set_config('app.current_user_id', $1, true)`.
- [ ] App role without `BYPASSRLS` and an owner role for migrations; idempotent
      RLS policy script. better-auth tables are accessed on a service
      connection since the session must resolve before a user id exists.

### 2.3 Authentication

- [ ] better-auth (email + password) with the Drizzle adapter at
      `/api/auth/[...all]`; remove fake auth and the demo cookie.
- [ ] Rate limiting, secure/httpOnly/sameSite cookies, session expiry, origin
      checks, and generic error messages.
- [ ] Server-side session helper; `proxy.ts` remains a UX redirect only, never
      the authorization boundary.
- [ ] `zod` validation at every server boundary.

### 2.4 Repository and screens

- [ ] Server implementation of `Repository`; move screens off `useAppStore`.
- [ ] `scripts/seed.ts` seeds the dev database from the current fixtures,
      including one dev-only demo account from `SEED_DEMO_EMAIL` /
      `SEED_DEMO_PASSWORD` (never rendered; never created in production).

### 2.5 Storage, media, and PDF

- [ ] `lib/storage`: `StoragePort { put, get, delete, signedUrl }` with an `fs`
      driver (`fs`, `.data/objects/<key>`) and an `r2` driver (S3 SDK +
      presigner), selected by environment.
- [ ] `app/api/files/[...key]/route.ts`: authenticated, enforces
      `users/<userId>/…` ownership, streams in dev or redirects to a signed R2
      URL in prod; sets `Content-Disposition: attachment` and
      `X-Content-Type-Options: nosniff`.
- [ ] `lib/media`: Cloudinary for app assets and user images/video; user avatars
      go to local storage in dev.
- [ ] `lib/pdf/ats-document.tsx`: shared `@react-pdf/renderer` document;
      server-side `renderToBuffer`, stored via the storage port and linked to
      `tailored_resume.pdfKey`. Client-side preview reuses the same component.
- [ ] Attachment and avatar uploads with MIME allowlist and size limits.

### 2.6 Security hardening (built in, not deferred)

- [ ] Security headers (CSP report-only first, then enforced), HSTS,
      `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- [ ] `Cache-Control: no-store` on private pages and API responses.
- [ ] No PII, job descriptions, or session tokens in logs. No stack traces to
      the client in production.

### 2.7 Tests

- [ ] Vitest: gap logic, ATS text and PDF renderers, and repository integration
      against the dev database. Closes open decisions 1–3.

---

## Phase 3 — Hardening and deploy

- [ ] 3.1 RLS verification tests (user B cannot read user A rows) and a secret
      scan in CI.
- [ ] 3.2 Performance and accessibility audit; enforce the CSP.
- [ ] 3.3 Deploy to Vercel + Neon + R2 + Cloudinary.
- [ ] 3.4 Reintroduce social auth and add email verification/reset once a mail
      provider is chosen.

---

## Risks

- Tailwind 4 and shadcn 4 use a newer theme variable scheme; confirmed working in
  Phase 0, revisit if components misbehave.
- Next 16 and React 19.3 are bleeding edge. zustand, next-themes, and geist are
  compatible; re-check any new dependency.
- `@react-pdf/renderer` server rendering on Vercel needs a Node runtime; verify
  bundle size and cold starts in Phase 2.
- RLS with a transaction-scoped GUC depends on `postgres.js` transactions
  surviving Neon pooling; `set_config(..., true)` is local to the transaction and
  is the design that makes this safe.
- Hydration mismatches from a persisted store are a recurring trap; the Phase 1.5
  `StoreGate` must remain the single entry point for store-backed screens.

## Open decisions

1. RLS `auth.uid()` mechanism — **resolved**: `app_current_user_id()` plus the
   `app.current_user_id` GUC set per transaction. Implement in Phase 2.2.
2. Skill catalog ownership — global read-only catalog, seeded, readable by
   authenticated users. Confirm during Phase 2.2.
3. PDF renderer — **resolved**: `@react-pdf/renderer`. Implement in Phase 2.5.
4. Standalone tailoring — **kept**; `tailored_resume.jobApplicationId` stays
   nullable and a `/editor/new` route is added in Phase 1.5.
5. Mail provider for verification/reset — deferred to Phase 3.4.
