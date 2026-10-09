# seewe — UI Specification (MVP)

Companion to `PLAN.md` and `DATABASE.md`. This document defines the interface: design tokens, route map, screen-by-screen specs, component inventory, and a ready-to-paste prompt for a mockup tool such as v0.

Scope of the mockup: the core five flows. Everything else is specced here but not required from the generator.

---

## 1. Design thesis

seewe exists because a machine reads your resume before a person does. The interface should feel like the tool a careful editor would use: dense, precise, high-contrast, and quiet. Nothing decorative competes with the work.

The signature element is the **ATS parse panel**. Next to the visual resume is a monospace view of the exact plain text the parser will read. It appears on the landing page as the product demo and again inside the tailoring editor. It is the one memorable thing in the product and it doubles as proof that the output is ATS-safe.

Everything else follows one rule: spend boldness in one place. Hairline borders, tight type, no gradients except where they carry meaning, no shadows except on floating surfaces.

---

## 2. Audience and surface

Audience: job seekers applying to many roles, mostly knowledge and tech workers, often applying in bursts and worried about being filtered out. They want speed and control, not a design tool.

Primary surface: desktop web app. Mobile is supported for review and status updates, not for heavy editing.

---

## 3. Design tokens

### 3.1 Color (light, primary)

| Token        | Hex       | Use                                    |
| ------------ | --------- | -------------------------------------- |
| `canvas`     | `#FAFAFA` | App background                         |
| `surface`    | `#FFFFFF` | Cards, panels, inputs                  |
| `ink`        | `#0A0A0A` | Primary text, primary buttons          |
| `muted`      | `#666666` | Secondary text, labels                 |
| `hairline`   | `#EAEAEA` | 1px borders, dividers                  |
| `focus`      | `#0070F3` | Focus ring, links                      |
| `correction` | `#E5484D` | Skill gaps, removed items, destructive |

Status colors (used as pills and timeline nodes):

| Status         | Hex       |
| -------------- | --------- |
| `saved`        | `#8F8F8F` |
| `applied`      | `#30A46C` |
| `heard_back`   | `#F5A623` |
| `interviewing` | `#0070F3` |
| `rejected`     | `#E5484D` |
| `offer`        | `#0A0A0A` |

Primary actions use ink on light (a black button, white label). Blue is reserved for focus and links so accent stays meaningful.

### 3.2 Color (dark, supported)

| Token      | Hex       |
| ---------- | --------- |
| `canvas`   | `#0A0A0A` |
| `surface`  | `#111111` |
| `ink`      | `#FAFAFA` |
| `muted`    | `#888888` |
| `hairline` | `#1F1F1F` |
| `focus`    | `#3B82F6` |

Status colors keep their hue and shift lightness for contrast on dark.

### 3.3 Type

- Display and UI: **Geist Sans**.
- Data and parse output: **Geist Mono**, used for the ATS panel, skill tags, dates, and version numbers.

Scale:

| Role      | Size / line-height | Weight | Tracking |
| --------- | ------------------ | ------ | -------- |
| Display   | 32 / 40            | 600    | -0.02em  |
| Heading 1 | 24 / 32            | 600    | -0.02em  |
| Heading 2 | 18 / 26            | 600    | -0.01em  |
| Body      | 14 / 22            | 400    | 0        |
| Small     | 13 / 20            | 400    | 0        |
| Caption   | 12 / 16            | 500    | 0        |

Headings are tight. Labels are small and muted. Data is monospace.

### 3.4 Shape, spacing, motion

- Radius: `6px` for surfaces and controls, full pill for status and skill tags.
- Borders: 1px hairline only. No thick borders.
- Shadows: only on dialogs, dropdowns, popovers, and toasts.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Motion: 120 to 160ms ease-out for hover and open states. Page transitions are instant. Respect `prefers-reduced-motion`.

---

## 4. Information architecture

```
/                     Landing
/sign-in  /sign-up    Auth (email + password)
/onboarding           Master resume builder (required before tailoring)
/dashboard            Overview: status counts, follow-ups, recent applications
/jobs                 Applications list (dense table)
/jobs/new             New-job wizard (details -> JD -> tailor -> download -> applied)
/jobs/[id]            Job detail (timeline, interviews, contacts, attachments, notes)
/editor/[id]          Tailoring editor for a job (visual + ATS parse)
/editor/new           Standalone tailoring (no job required)
/resume               Master resume view and edit
/companies            Saved companies
/settings             Profile, template, appearance, privacy and data
```

App shell: fixed left sidebar (nav: Dashboard, Jobs, Master resume, Companies, Settings), top bar (search, "New job / resume" primary button, account menu). Sidebar collapses to icons, then to a sheet on mobile.

---

## 5. Screen specs

Each spec lists layout, components, and the states the mockup should show.

### 5.1 Landing

Job: explain the problem in one breath and prove it with the parse panel.

```
┌───────────────────────────────────────────────────────────┐
│ seewe            Product  How it works            Sign in │
│                                                            │
│  Tailor your resume          ┌───────────────────────────┐ │
│  before the machine           │  VISUAL        ATS TEXT  │ │
│  reads it.                    │  ┌─────────────────────┐ │ │
│                               │  │ Jane Doe            │ │ │
│  Paste a job description,      │  │ jane@example.com    │ │ │
│  edit a copy of your master    │  │ EXPERIENCE          │ │ │
│  resume to match it, and       │  │ Backend Engineer    │ │ │
│  download a PDF any ATS        │  │ - Built ...         │ │ │
│  can read. Your master         │  └─────────────────────┘ │ │
│  never changes.                │  parsed as plain text    │ │
│                               └───────────────────────────┘ │
│  [ Start free ]  [ See a demo ]                            │
│                                                            │
│  ── How it works ───────────────────────────────────────── │
│  1 Build your master        2 Tailor per job   3 Track     │
└───────────────────────────────────────────────────────────┘
```

- Hero headline: "Tailor your resume before the machine reads it."
- Subhead: one or two sentences.
- Primary CTA: "Start free". Secondary: "See a demo".
- Hero visual: the ATS parse panel with a VISUAL / ATS TEXT toggle, animating the toggle once on load.
- How it works: three numbered steps. The numbers are real sequence, so they stay.
- Supporting band: privacy note (RLS isolation, private storage, signed URLs).
- Footer: minimal.

States: static marketing page, no data states.

### 5.2 Auth (`/sign-in`, `/sign-up`)

- Centered single-column card, max width ~360px, on canvas.
- Fields: email, password. Sign-up adds confirm password. Password show/hide toggle.
- Inline validation on blur. Error text in correction red under the field.
- Link between sign-in and sign-up.
- Loading state: button shows a spinner and disables.
- Error state: a hairline alert above the form field group, not a toast. Auth errors are generic ("Invalid email or password") and never reveal whether an account exists.
- No social buttons and no demo-credentials banner in the MVP. Social providers return in Phase 3.4.

### 5.3 Onboarding, master resume (`/onboarding`)

Job: build the one master resume. Mandatory before tailoring.

Layout: two columns. Left rail lists sections with a completion check. Right column is the active section form. Footer bar holds "Save and continue".

```
┌───────────────┬───────────────────────────────────────────┐
│ Sections      │  Experience                                │
│ ● Headline    │  ┌───────────────────────────────────────┐ │
│ ● Summary     │  │ Title        Company                  │ │
│ ● Contact     │  │ [__________] [__________________]     │ │
│ ● Experience  │  │ Start        End        Current        │ │
│ ○ Education   │  │ [______]     [______]   [x]            │ │
│ ○ Skills      │  │ Bullets                               │ │
│ ○ Projects    │  │ - [________________________________]   │ │
│ ○ Certs       │  │ - [________________________________]   │ │
│ ○ Languages   │  │ [+ Add bullet]                         │ │
│               │  └───────────────────────────────────────┘ │
│ progress 40%  │  [+ Add experience]                        │
│               │                    [ Save and continue ]    │
└───────────────┴───────────────────────────────────────────┘
```

- Sections: Headline, Summary, Contact, Experience, Education, Skills, Projects, Certifications, Languages.
- Repeated items (experience, education, projects, certs, languages) are cards with add, edit, remove, and drag to reorder.
- Bullets are an editable list, one line each, add and remove.
- Skills use a combobox with autocomplete against the skill catalog, plus a proficiency select (beginner, working, proficient, expert).
- Note near the top: "This is your master resume. Tailoring always edits a copy, never this."
- Completion gate: the app blocks tailoring until required sections are non-empty.

States: empty section (invitation to add the first item), loading skeleton, validation errors, save success (inline check, not a toast).

### 5.4 Dashboard (`/dashboard`)

Job: see the whole search at a glance.

- Row of status stat cards: Saved, Applied, Heard back, Interviewing, Offer. Each shows a count and its status color as a small dot. Clicking filters the jobs list.
- "Follow-ups due" list: applications with a `nextFollowUpDate` on or near today, each row with company, position, date, and a "Mark done" action.
- "Recent applications" table: last 5 to 8 rows, columns Company, Position, Status, Applied, Actions.
- Primary button top right: "New job / resume".
- Empty state (no applications): centered block explaining the combined flow with a "Add your first job" button, plus a secondary "Tailor a resume without a job".

States: empty, loading (skeleton rows), populated.

### 5.5 Jobs list (`/jobs`)

- Dense data table. Columns: Company, Position, Status (pill), Location, Work mode, Applied date, Next follow-up, Actions.
- Toolbar: search input, status filter (multi-select pills), work mode filter, and a sort menu.
- Row click opens `/jobs/[id]`.
- Row actions menu: Tailor a new version, Edit, Delete.
- Pagination or virtual scroll for long lists.
- Empty state mirrors the dashboard empty state.

### 5.6 New-job wizard (`/jobs/new`)

A stepper across four steps. The resume is tailored inside the flow, so the job ends as `applied` only after download.

```
Details  ──  Job description  ──  Tailor  ──  Download
```

1. **Details.** Company (combobox that suggests and reuses existing companies), position, location, work mode, employment type, source, applied date, salary fields (min, max, currency, period), expected salary, equity, bonus, benefits, next follow-up date, notes.
2. **Job description.** Large textarea to paste the JD. Below it, a skills editor: add required skills manually (combobox against the skill catalog), mark required optional. Note: "Skills are entered manually. No AI is used in this version."
3. **Tailor.** Embedded tailoring editor (see 5.8) scoped to this job, with the JD and gap panel on the right. A "Save as draft" action creates or updates the job as `saved`.
4. **Download.** Shows the generated resume preview with the VISUAL / ATS TEXT toggle, a filename field, and a "Download and mark applied" button. Saving a draft and downloading are separate actions: only downloading moves the job to `applied` and adds the first timeline entry.

States: per-step validation, disabled next until valid, generating spinner on the download step, success transition into the job detail.

### 5.7 Job detail (`/jobs/[id]`)

- Header: company and position, status pill, applied date, and a primary "Tailor a new version" button.
- Left column: description summary (location, work mode, employment type, salary, source), the pasted JD in a scroll box, notes.
- Right column: the current tailored resume card (version badge, filename, download), attachments (resume, cover letter, JD), contacts.
- Below header: the **status timeline**, oldest to newest, each node showing status, timestamp, and note. A control to change status opens a small dialog that requires a note and appends to history.
- Tabs or stacked sections: Overview, Interviews (round, type, scheduled time, outcome, notes), Contacts (name, role, email, phone, notes), Attachments.

States: no tailored resume yet (shows a prompt to tailor), no interviews, no contacts, status change success.

### 5.8 Tailoring editor (`/editor/[id]`, `/editor/new`)

The core screen. Three panes and a top bar. `/editor/new` is the same editor with no job attached (standalone tailoring); the job-description and gap panes show an empty prompt and the version badge is hidden until the first save.

```
┌───────────────────────────────────────────────────────────────────────┐
│ ← Back   Acme — Backend Engineer   v2   [ Visual ][ ATS TEXT ]  [Download]│
├──────────────┬────────────────────────────────────┬───────────────────┤
│ Master       │  Tailored copy                     │  Job description  │
│ sections     │                                    │  ┌─────────────┐  │
│              │  Headline                          │  │ ...pasted    │  │
│ ☰ Experience │  [ Backend Engineer            ]   │  │ JD text...   │  │
│ ☰ Education  │                                    │  └─────────────┘  │
│ ☰ Skills     │  Experience                        │                   │
│ ☰ Projects   │  ┌──────────────────────────────┐  │  Skill gaps       │
│ ☰ Certs      │  │ Backend Engineer · Acme      │  │  Missing here     │
│ ☰ Languages  │  │ - Built a payments ... [x]   │  │  ● Kubernetes     │
│              │  │ - [ + add bullet ]           │  │  ● Terraform      │
│ Visibility   │  └──────────────────────────────┘  │  Missing from JD  │
│ ○ summary    │  [+ Add from master]               │  ● GraphQL        │
│ ○ contact    │                                    │  [Insert skills]  │
│              │  reorder · remove · restore        │                   │
└──────────────┴────────────────────────────────────┴───────────────────┘
```

- **Left pane: master sections.** Toggle visibility per section (summary, contact, each section, bullets). Drag to reorder sections. The source never changes; this only affects the copy.
- **Center pane: tailored copy.** Directly editable. Removed heading markers exist on every editable block: dropdown to restore or remove, and remove. Removed items show in correction red until committed.
- **Right pane: job description and gaps.** JD scroll box on top. Gap panel below: "Missing from your resume" (JD skills with no master match) and "Not in this job" (master skills absent from the JD). Each gap skill row has an insert action that adds it to the tailored copy.
- **Top bar.** Back link, job context, version badge (v1, v2, ...), the Visual / ATS TEXT segmented toggle, save status, and a Download button.
- **ATS TEXT mode.** Replaces the center pane with the monospace parse output, read-only, so the user can confirm the machine-readable result.
- Re-tailoring for the same job bumps the version and preserves prior PDFs.

States: unsaved changes indicator, saving, save success, generating PDF, generate error, no JD attached (right pane shows an empty prompt).

### 5.9 Master resume (`/resume`)

Read-first view of the master, sectioned like a document, with an "Edit" action that reopens the onboarding editor layout. A banner: "This is your master. Tailored resumes edit a copy."

### 5.10 Settings (`/settings`)

- Profile: name, email, avatar.
- Appearance: light / dark / system toggle.
- Resume template: the single ATS template for MVP, shown as a selected item with a disabled "more templates soon" note.
- Privacy and data: explanation of per-user isolation, private storage, signed links. Export data, delete account.
- Connected accounts (social sign-in) return in Phase 3.4; the section is hidden in the MVP.

### 5.11 Companies (`/companies`)

- Table: name, website, careers URL, industry, size, applications count.
- Create and edit dialog. Companies are reused when a new job is added.

---

## 6. Component inventory

Base: Button (primary, secondary, ghost, destructive), Input, Textarea, Label, Select, Combobox (async: skills, companies), Checkbox, Radio group, Switch, Dialog, Sheet, Dropdown menu, Tabs, Segmented control, Tooltip, Toast, Table, Pagination, Skeleton, Avatar, Badge.

App-specific: Status pill, Status timeline, Stat card, Gap panel (missing vs not-in-job), Skill tag with proficiency, Master section rail with visibility toggles, Bullet list editor, Version badge, ATS parse panel, Stepper, JD scroll box, Attachment row.

---

## 7. Responsive

- Sidebar: full labels on desktop, icon rail on tablet, sheet on mobile.
- Dashboard and jobs list: tables collapse into stacked cards under ~640px.
- Editor: single pane at a time on mobile with a top segmented control (Master / Tailored / JD). The top bar keeps the preview toggle and Download.
- Wizard: steps stack vertically; the stepper becomes a progress bar.
- Minimum supported width: 360px.

---

## 8. Accessibility

- Visible focus ring on every interactive element, using the focus token.
- Combobox and menus are fully keyboard operable with arrow keys, Enter, and Escape.
- Status is never conveyed by color alone: each pill carries its label, and timeline nodes carry text.
- Timeline is marked up as an ordered list. Status changes are announced through an `aria-live` region.
- Contrast meets WCAG AA in both themes.
- `prefers-reduced-motion` disables the hero toggle animation and any transitions.

---

## 9. Copy rules

Write from the user's side of the screen. Name actions by what they do: "Save and continue", "Download and mark applied". An action keeps its name through the flow, so the button that says "Download" produces a state that says "Downloaded".

Keep it plain and specific. Empty states invite action. Errors say what happened and how to fix it, without apologizing. Sentence case for headings and buttons. No exclamation marks.

---

## 10. Open decisions (from the readiness check)

These are not UI blockers, but they must be settled during M0.

1. RLS auth: `auth.uid()` must be provided as a custom SQL function backed by a per-request GUC (`app.current_user_id`) set inside a transaction, since Neon and Docker Postgres do not ship it.
2. Skill ownership: decide whether `skill` is a global read-only catalog or per-user rows. This changes RLS and the autocomplete data source.
3. PDF renderer: choose a text-based library (`pdf-lib`, `@react-pdf/renderer`, or a Puppeteer template). It shapes the ATS template and preview.
4. Tailored snapshot shape: define the `data` JSONB type, mirroring the master sections.
5. Route map is now defined above.

---

## 11. v0 prompt

Paste the block below into v0. It targets plain React with Tailwind, static mock data, and no backend.

```text
Build a set of static UI screens for a web app called seewe, a resume tailor and job-application tracker. Use plain React function components with Tailwind classes. No Next.js, no routing libraries, no backend, no state management beyond local useState. Use inline mock data. Render each screen as a top-level component. Include a simple screen switcher so I can flip between them.

BRAND AND FEEL
Crisp, dense, and precise, in the spirit of Vercel. High contrast, hairline borders, tight typography, minimal shadows. Light theme is primary; also define dark theme tokens. No gradients except inside data visual cues. No decorative icons beyond simple line icons.

DESIGN TOKENS
Colors (light):
- canvas #FAFAFA
- surface #FFFFFF
- ink #0A0A0A
- muted #666666
- hairline #EAEAEA
- focus #0070F3
Status:
- saved #8F8F8F, applied #30A46C, heard_back #F5A623, interviewing #0070F3, rejected #E5484D, offer #0A0A0A
Correction/red for gaps and removals: #E5484D
Colors (dark): canvas #0A0A0A, surface #111111, ink #FAFAFA, muted #888888, hairline #1F1F1F, focus #3B82F6
Type: Geist Sans for UI and headings, Geist Mono for the ATS parse panel, skill tags, and dates. Headings tracking -0.02em. Body 14px/22px.
Shape: 6px radius for surfaces and controls; full pill for status and skill tags. 1px borders. Spacing on a 4/8/12/16/24/32/48/64 scale.
Motion: 120-160ms ease-out on hover and open states only.

SCREENS TO BUILD

1. Landing page
- Top nav: wordmark "seewe" on the left; Product, How it works, Sign in on the right.
- Hero headline: "Tailor your resume before the machine reads it."
- Subhead: "Paste a job description, edit a copy of your master resume to match it, and download a PDF any ATS can read. Your master never changes."
- Buttons: primary "Start free", secondary "See a demo".
- Hero visual: an "ATS parse panel" card with a segmented toggle "Visual / ATS text". In ATS text mode show a monospace block of a sample resume as plain text (name, contact, EXPERIENCE, bullet lines). This panel is the signature element.
- Section "How it works": three numbered steps. 1 Build your master. 2 Tailor per job. 3 Track applications.
- Small support band: "Per-user isolation, private file storage, signed download links."
- Minimal footer.

2. Sign in and Sign up
- Centered card, max width about 360px.
- Sign in: Email, Password, primary button "Sign in".
- Sign up: Email, Password, Confirm password, primary button "Create account".
- Inline field validation on blur, error text in #E5484D under the field.
- Link between the two screens.
- No social buttons and no demo credentials in the MVP.

3. Onboarding, master resume builder
- Two-column layout. Left rail lists sections with a check or dot per section and a progress percent: Headline, Summary, Contact, Experience, Education, Skills, Projects, Certifications, Languages.
- Right column shows the Experience section form: Title, Company, Start, End, a Current checkbox, and an editable bullet list with "+ Add bullet". Below, "+ Add experience".
- A top note: "This is your master resume. Tailoring always edits a copy, never this."
- Bottom "Save and continue" button.
- Show the left rail state with Experience active and earlier sections complete.

4. Dashboard and jobs list
- App shell: left sidebar (Dashboard, Jobs, Master resume, Companies, Settings), top bar with search, a primary "New job / resume" button, and an account avatar.
- Status stat cards row: Saved, Applied, Heard back, Interviewing, Offer, each with a count and a small colored dot.
- "Follow-ups due" list: three rows with company, position, date, and a "Mark done" link.
- "Recent applications" dense table: Company, Position, Status pill, Applied, Actions. Status pills use the status colors above and carry text labels.
- Empty state variant for the table: centered message and an "Add your first job" button.

5. Tailoring editor
- Three-pane layout under a top bar.
- Top bar: back link, context "Acme — Backend Engineer", a version badge "v2", a segmented control "Visual / ATS text", a save status "All changes saved", and a primary "Download" button.
- Left pane "Master sections": list Experience, Education, Skills, Projects, Certifications, Languages, each with a drag handle and a visibility toggle. A "Visibility" group with toggles for Summary and Contact.
- Center pane "Tailored copy": an editable document. Show a Headline field, then an Experience card with company, title, and editable bullet lines. Each editable block has a small menu to remove or restore. Make one removed item appear in #E5484D with a "Restore" action. "+ Add from master" at the bottom of the section.
- Right pane: a "Job description" scroll box with pasted text, and below it a "Skill gaps" panel with two groups: "Missing from your resume" (Kubernetes, Terraform) and "Not in this job" (GraphQL). Each gap row has a small "Add" action. Use #E5484D for the missing group.
- Also render an "ATS text" mode of the center pane as a read-only monospace block.

SUB-COMPONENTS
Build reusable: Button (primary, secondary, ghost), Input, Textarea, Combobox, Checkbox, Switch, Dialog, Dropdown menu, Tabs, Segmented control, Tooltip, Toast, Table, Badge, StatusPill, StatusTimeline, StatCard, SkillTag, BulletListEditor, AtsParsePanel, Stepper, VersionBadge.

RESPONSIVE
Sidebar collapses to icons under 1024px and to a sheet under 768px. Tables become stacked cards under 640px. The editor shows one pane at a time on mobile with a segmented control. Minimum width 360px.

ACCESSIBILITY
Visible focus rings using the focus color. Status never conveyed by color alone, always with a text label. Keyboard operable menus and comboboxes. Respect prefers-reduced-motion.

COPY
Use the exact strings given above. Sentence case for headings and buttons. Keep copy plain and specific.
```
