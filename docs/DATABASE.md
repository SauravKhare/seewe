# seewe — Data Model & Database Schema (MVP)

Companion doc to `PLAN.md`. This is the Postgres schema for a resume **tailoring + job-application tracker**:

- Master resume data is the source of truth and **never mutates** when tailoring.
- Each tailored resume is a **full JSONB snapshot** (version → PDF → object storage).
- Jobs are tracked end-to-end: salary, skills, status timeline, interviews, contacts, attachments.

## Locked design decisions

| Area             | Decision                                                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth             | [better-auth](https://better-auth.com); **email/password only** for MVP (social providers and email verification/reset deferred to Phase 3.4). Postgres adapter.                                                                       |
| Isolation        | Postgres **RLS** per user. Scoped app role (no `BYPASSRLS`) with policies keyed on a per-transaction GUC (`app.current_user_id` via `app_current_user_id()`). Owner role keeps `BYPASSRLS` for migrations/seeds only.                    |
| File storage     | **Documents** (resume PDFs, attachments) in S3-compatible object storage — **Cloudflare R2** prod, **local filesystem** dev. Signed URLs on download. **Images/video** in **Cloudinary**.                                                 |
| LLM              | **Zero LLM in MVP.** JD skills entered manually; JD pasted as text. Cover-letter PDFs stored (manual, not generated).                                                                                                                  |
| Tailoring        | Mandatory **master-first onboarding** (master must exist before tailoring). Editor loads master sections; edits bake into a full JSONB snapshot per version. Master untouched. Multiple tailored versions per job; old PDFs preserved. |
| Resume creation  | Standalone resume-making allowed (job optional) — `tailored_resume.jobApplicationId` nullable.                                                                                                                                         |
| Skills           | Canonical `skill` table. **Manual** JD skill entry (`job_skill.source='manual'`). Proficiency captured on both master and job skills. Editor highlights gaps (master skill absent from JD, JD skill absent from master).               |
| Status           | Fixed enum + ordered timeline. `saved, applied, heard_back, interviewing, rejected, offer`. Each change appends to `application_status_history`.                                                                                       |
| Salary           | Range (min/max) + currency + period, plus expected, equity, bonus, benefits.                                                                                                                                                           |
| Job description  | Pasted text only (no URL fetch, no LLM parsing).                                                                                                                                                                                       |
| Companies        | Normalized `company` entity (canonical for professions where user applies to multiple roles at one company). Suggest + reuse existing company on new-role creation.                                                                    |
| ORM / migrations | **Drizzle** + `drizzle-kit generate`. Postgres. Manual RLS policy script.                                                                                                                                                              |

## Entity relationship diagram

```
                        ┌───────────────────────────────┐
                        │            resume (master)    │
                        │  userId (unique), headline,    │────N─ resume_skill N─1 skill
                        │  summary, contact jsonb,       │
                        │  templateId                    │
                        └──────┬───────┬───────┬─────────┘
                      N──experience N──education N──project
                      N──certification N──language
                        │
              1 (job optional)
                        ▼
┌──────────────────────tailored_resume───────────────────┐
│ userId, resumeId (master), jobApplicationId (nullable),│
│ version, data jsonb (full snapshot), pdfKey, fileName  │
└──────────────────────┬──────────────────────────────────┘
                      N
                        │
                        ▼ (optional)
┌──────────────────────job_application─────────────────────────────────────┐
│ userId, companyId→company, position, jobUrl, jobDescription text,         │
│ location, workMode enum, employmentType, salary (min/max/currency/period,│
│ expectedSalary, equity, bonus, benefits), source, appliedDate,           │
│ status enum, statusChangedAt, nextFollowUpDate, notes,                   │
│ tailoredResumeId (current), createdAt, updatedAt                         │
└───┬───────────────┬──────────────┬───────────────┬──────────┬───────────┘
    N               N              N               N          N
application_  interview       contact         job_attachment   job_skill N─1 skill
status_history (per-app)      (per-app)       (resume|cover_    (source=manual)
                                           letter|jd pdfKey R2)
```

## Tables

### Auth (better-auth)

`user`, `session`, `account`, `verification` — as generated by better-auth (Postgres adapter). Not listed in detail here. These tables are read on a **service connection** because a session must resolve before a user id exists; they are not RLS-scoped. All user-owned tables below are scoped by the `app.current_user_id` GUC.

### Master resume (source of truth — one per user, never mutated by tailoring)

**`resume`**

| column                    | type         | notes                                                        |
| ------------------------- | ------------ | ------------------------------------------------------------ |
| `id`                      | uuid PK      |                                                              |
| `userId`                  | uuid FK→user | UNIQUE (one master per user)                                 |
| `headline`                | text         | role title/summary line                                      |
| `summary`                 | text         | professional summary                                         |
| `contact`                 | jsonb        | email, phone, location, linkedin, github, website, portfolio |
| `templateId`              | text         | selected template (MVP uses single ATS template)             |
| `createdAt` / `updatedAt` | timestamptz  |                                                              |

**`experience`** (id PK, resumeId FK, company, title, location, startDate, endDate, current bool, bullets jsonb, sortOrder)
**`education`** (id PK, resumeId FK, school, degree, field, startDate, endDate, gpa, sortOrder)
**`project`** (id PK, resumeId FK, name, description, techStack jsonb, link, sortOrder)
**`certification`** (id PK, resumeId FK, name, issuer, issuedDate, link, sortOrder)
**`language`** (id PK, resumeId FK, name, proficiency, sortOrder)

### Skills (canonical + linking)

**`skill`**

| column       | type                 | notes                                              |
| ------------ | -------------------- | -------------------------------------------------- |
| `id`         | uuid PK              |                                                    |
| `name`       | text NOT NULL        |                                                    |
| `normalized` | text NOT NULL UNIQUE | lowercased/trimmed → clean matching & gap analysis |

**`resume_skill`** (master's skills) — id PK, resumeId FK, skillId FK, category, level (enum e.g. `beginner/working/proficient/expert`), sortOrder. UNIQUE (resumeId, skillId).
**`job_skill`** (job's required skills, manual at MVP) — id PK, jobApplicationId FK, skillId FK, required bool, source enum (`manual`). UNIQUE (jobApplicationId, skillId).

> Gap analysis = `job_skill` skills not present in `resume_skill` (or vice-versa) → editor highlights.

### Tailored resume (a versioned per-job resume)

**`tailored_resume`**

| column                    | type                         | notes                                        |
| ------------------------- | ---------------------------- | -------------------------------------------- |
| `id`                      | uuid PK                      |                                              |
| `userId`                  | uuid FK→user                 |                                              |
| `resumeId`                | uuid FK→resume NOT NULL      | the master it was derived from               |
| `jobApplicationId`        | uuid FK→job_application NULL | standalone resume allowed                    |
| `version`                 | int                          | 1, 2, … per job                              |
| `data`                    | jsonb                        | **full snapshot** of final tailored sections |
| `pdfKey`                  | text                         | R2/S3 object key of rendered ATS PDF         |
| `fileName`                | text                         | download name                                |
| `createdAt` / `updatedAt` | timestamptz                  |                                              |

### Job application (the tracked entity)

**`job_application`**

| column                    | type                                                        | notes                                   |
| ------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| `id`                      | uuid PK                                                     |                                         |
| `userId`                  | uuid FK→user                                                |                                         |
| `companyId`               | uuid FK→company                                             | normalized company                      |
| `position`                | text NOT NULL                                               |                                         |
| `jobUrl`                  | text                                                        |                                         |
| `jobDescription`          | text                                                        | pasted JD text                          |
| `location`                | text                                                        |                                         |
| `workMode`                | enum `remote/hybrid/onsite`                                 |                                         |
| `employmentType`          | enum `full_time/part_time/contract/internship`              |                                         |
| `salaryMin` / `salaryMax` | numeric                                                     |                                         |
| `salaryCurrency`          | char(3)                                                     | ISO 4217                                |
| `salaryPeriod`            | enum `hourly/monthly/yearly`                                |                                         |
| `expectedSalary`          | numeric                                                     |                                         |
| `equity`                  | text                                                        |                                         |
| `bonus`                   | text                                                        |                                         |
| `benefits`                | text                                                        |                                         |
| `source`                  | text                                                        | where found (LinkedIn, referrals, etc.) |
| `appliedDate`             | date                                                        |                                         |
| `status`                  | enum `saved/applied/heard_back/interviewing/rejected/offer` |                                         |
| `statusChangedAt`         | timestamptz                                                 |                                         |
| `nextFollowUpDate`        | date                                                        |                                         |
| `notes`                   | text                                                        |                                         |
| `tailoredResumeId`        | uuid FK→tailored_resume NULL                                | current active tailored version         |
| `createdAt` / `updatedAt` | timestamptz                                                 |                                         |

**`application_status_history`** — id PK, jobApplicationId FK, status enum, changedAt timestamptz, note text → ordered timeline.
**`interview`** — id PK, jobApplicationId FK, round int, type enum (`phone/technical/onsite/virtual`), scheduledAt, outcome, notes.
**`contact`** — id PK, jobApplicationId FK (per-application), name, role, email, phone, notes.
**`job_attachment`** — id PK, jobApplicationId FK, type enum (`resume/cover_letter/jd`), pdfKey R2, fileName.

### Company (normalized)

**`company`**

| column                    | type          | notes               |
| ------------------------- | ------------- | ------------------- |
| `id`                      | uuid PK       |                     |
| `userId`                  | uuid FK→user  | ownership for RLS   |
| `name`                    | text NOT NULL |                     |
| `normalizedName`          | text NOT NULL | for dedupe/matching |
| `website`                 | text          |                     |
| `careersUrl`              | text          |                     |
| `industry`                | text          |                     |
| `size`                    | text          |                     |
| `notes`                   | text          |                     |
| `createdAt` / `updatedAt` | timestamptz   |                     |

> UNIQUE (userId, normalizedName). On creating a new role the UI suggests + reuses an existing company match.

## RLS strategy

- **App role:** scoped non-superuser role (e.g. `seewe_app`) — **no** `BYPASSRLS`. Runtime queries use `postgres.js`; every repository call runs in a transaction that sets the GUC first:
  ```sql
  -- helper, created with the policies
  CREATE FUNCTION app_current_user_id() RETURNS uuid
    LANGUAGE sql STABLE AS $$ SELECT current_setting('app.current_user_id', true)::uuid $$;

  -- per request (postgres.js): set_config(..., true) is transaction-local,
  -- which is what makes this safe under Neon connection pooling
  SELECT set_config('app.current_user_id', $1, true);
  ```
- **Owner role:** (e.g. `seewe_owner`) keeps `BYPASSRLS`, used only for migrations/seeds.
- **Policies** on every owned table keyed to the GUC helper:
  ```sql
  CREATE POLICY "user owns company" ON company
    FOR ALL USING (user_id = app_current_user_id()) WITH CHECK (user_id = app_current_user_id());
  ```
  Applied to `resume`, `experience`, `education`, `project`, `certification`, `language`, `skill` (shared/read), `resume_skill`, `job_skill`, `tailored_resume`, `job_application`, `application_status_history`, `interview`, `contact`, `job_attachment`, `company`.
- **Auth tables** (`user`, `session`, `account`, `verification`) are read on the service connection and are **not** RLS-scoped.
- **Documents:** signed URLs only; R2/FS objects are referenced by key and never served over a public endpoint. JD pasted text is an RLS-protected column. Images/video are hosted on Cloudinary.

## Flow → schema mapping

1. Onboarding: user fills **master** (`resume` + experience/education/skills…) → guaranteed non-empty before tailoring.
2. New job: create `job_application` + `job_skill` (manual, from pasted JD) + optional `company` reuse/link.
3. Tailor: editor loads master, user edits per JD → save `tailored_resume` JSONB snapshot (v1) + R2 PDF → attach to job (`job_attachment`) → status → `applied`.
4. Track: status changes append to `application_status_history`; interviews, contacts, follow-ups recorded; re-tailoring increments `version` and preserves prior PDFs.

## Conventions / open for implementation

- Types used: uuid, text, jsonb, timestamptz, numeric, enums via Postgres `CREATE TYPE` (Drizzle `pgEnum`).
- Gaps analysis is a presentation concern derived from `resume_skill` vs `job_skill` (no persisted snapshot at MVP).
- Migration workflow: **Drizzle + drizzle-kit generate only** (no push); RLS policies shipped as a separate idempotent SQL script.
