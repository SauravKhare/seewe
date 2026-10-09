'use client'

import { useMemo, useState } from 'react'
import { Plus, RotateCcw, Trash2, X } from 'lucide-react'

import { BulletListEditor } from '@/components/app/bullet-list-editor'
import { Combobox } from '@/components/app/combobox'
import { Field } from '@/components/app/field'
import { GapPanel } from '@/components/editor/gap-panel'
import { ResumePaper } from '@/components/app/resume-paper'
import { SectionLabel } from '@/components/app/section-label'
import { SegmentedControl } from '@/components/app/segmented-control'
import { SelectField } from '@/components/app/select-field'
import { SortableList } from '@/components/app/sortable-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SKILL_LEVEL_LABELS } from '@/lib/constants'
import { useAppStore } from '@/lib/data/store'
import { normalizeName } from '@/lib/id'
import {
  computeGaps,
  emptyRemoved,
  removeItem,
  restoreItem,
} from '@/lib/tailoring'
import type {
  RemovedItems,
  ResumeSectionKey,
  SkillLevel,
  TailoredCertification,
  TailoredEducation,
  TailoredExperience,
  TailoredLanguage,
  TailoredProject,
  TailoredResumeData,
  TailoredSkill,
} from '@/lib/types'
import { cn } from '@/lib/utils'

const SECTION_TITLES: Record<ResumeSectionKey, string> = {
  summary: 'Summary',
  contact: 'Contact',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
}

const LEVEL_OPTIONS = (Object.keys(SKILL_LEVEL_LABELS) as SkillLevel[]).map(
  (level) => ({ value: level, label: SKILL_LEVEL_LABELS[level] }),
)

type Pane = 'sections' | 'resume' | 'job'

const PANE_OPTIONS = [
  { label: 'Sections', value: 'sections' as const },
  { label: 'Resume', value: 'resume' as const },
  { label: 'Job', value: 'job' as const },
]

/** Content fingerprint used as a stable React key while dragging. */
function experienceKey(item: TailoredExperience): string {
  return [
    item.title,
    item.company,
    item.location,
    item.startDate,
    item.endDate,
    item.current ? 'current' : '',
    item.bullets.join('|'),
  ].join('#')
}

function educationKey(item: TailoredEducation): string {
  return [
    item.school,
    item.degree,
    item.field,
    item.startDate,
    item.endDate,
    item.gpa,
  ].join('#')
}

function skillKey(item: TailoredSkill): string {
  return item.name
}

function projectKey(item: TailoredProject): string {
  return [
    item.name,
    item.link,
    item.description,
    item.techStack.join('|'),
  ].join('#')
}

function certificationKey(item: TailoredCertification): string {
  return [item.name, item.issuer, item.issuedDate, item.link].join('#')
}

function languageKey(item: TailoredLanguage): string {
  return [item.name, item.proficiency].join('#')
}

/** Maps each row to an id that stays stable while its content is unchanged. */
function stableIds<T>(items: T[], keyOf: (item: T) => string): Map<T, string> {
  const seen = new Map<string, number>()
  const ids = new Map<T, string>()
  items.forEach((item) => {
    const base = keyOf(item) || 'item'
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    ids.set(item, count === 0 ? base : `${base}#${count}`)
  })
  return ids
}

function replaceIn<T>(list: T[], item: T, patch: Partial<T>): T[] {
  const index = list.indexOf(item)
  if (index < 0) return list
  const next = list.slice()
  next[index] = { ...item, ...patch }
  return next
}

type RemovedRow =
  | { section: 'experience'; item: TailoredExperience }
  | { section: 'education'; item: TailoredEducation }
  | { section: 'skills'; item: TailoredSkill }
  | { section: 'projects'; item: TailoredProject }
  | { section: 'certifications'; item: TailoredCertification }
  | { section: 'languages'; item: TailoredLanguage }

function collectRemoved(removed: RemovedItems): RemovedRow[] {
  return [
    ...removed.experience.map((item): RemovedRow => ({
      section: 'experience',
      item,
    })),
    ...removed.education.map((item): RemovedRow => ({
      section: 'education',
      item,
    })),
    ...removed.skills.map((item): RemovedRow => ({ section: 'skills', item })),
    ...removed.projects.map((item): RemovedRow => ({
      section: 'projects',
      item,
    })),
    ...removed.certifications.map((item): RemovedRow => ({
      section: 'certifications',
      item,
    })),
    ...removed.languages.map((item): RemovedRow => ({
      section: 'languages',
      item,
    })),
  ]
}

function rowLabel(row: RemovedRow): string {
  switch (row.section) {
    case 'experience':
      return (
        [row.item.title, row.item.company].filter(Boolean).join(' · ') ||
        'Untitled role'
      )
    case 'education':
      return (
        [row.item.school, row.item.degree].filter(Boolean).join(' · ') ||
        'Untitled education'
      )
    case 'skills':
      return row.item.name || 'Untitled skill'
    case 'projects':
      return row.item.name || 'Untitled project'
    case 'certifications':
      return row.item.name || 'Untitled certification'
    case 'languages':
      return (
        [row.item.name, row.item.proficiency].filter(Boolean).join(' · ') ||
        'Untitled language'
      )
  }
}

function restoreRow(
  data: TailoredResumeData,
  row: RemovedRow,
): TailoredResumeData {
  switch (row.section) {
    case 'experience':
      return restoreItem(data, 'experience', row.item)
    case 'education':
      return restoreItem(data, 'education', row.item)
    case 'skills':
      return restoreItem(data, 'skills', row.item)
    case 'projects':
      return restoreItem(data, 'projects', row.item)
    case 'certifications':
      return restoreItem(data, 'certifications', row.item)
    case 'languages':
      return restoreItem(data, 'languages', row.item)
  }
}

function CardHeader({
  handle,
  label,
  onRemove,
  removeLabel,
}: {
  handle: React.ReactNode
  label: string
  onRemove: () => void
  removeLabel: string
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 pt-1.5 text-xs font-medium">
        {handle}
        <span className="truncate">{label}</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onRemove}
        aria-label={removeLabel}
      >
        <Trash2 className="size-3" /> Remove
      </Button>
    </div>
  )
}

export interface EditorJobSkill {
  name: string
  required: boolean
}

export function TailoringEditor({
  data,
  onChange,
  jd,
  jobSkills,
  className,
}: {
  data: TailoredResumeData
  onChange: (data: TailoredResumeData) => void
  jd?: string
  jobSkills: EditorJobSkill[]
  className?: string
}) {
  const master = useAppStore((state) => state.master)
  const catalog = useAppStore((state) => state.skills)
  const [pane, setPane] = useState<Pane>('resume')

  const gaps = useMemo(() => computeGaps(data, jobSkills), [data, jobSkills])

  const setData = (patch: Partial<TailoredResumeData>) =>
    onChange({ ...data, ...patch })

  const experienceIds = stableIds(data.experience, experienceKey)
  const educationIds = stableIds(data.education, educationKey)
  const skillIds = stableIds(data.skills, skillKey)
  const projectIds = stableIds(data.projects, projectKey)
  const certificationIds = stableIds(data.certifications, certificationKey)
  const languageIds = stableIds(data.languages, languageKey)

  const removed = { ...emptyRemoved(), ...data.removed }
  const removedRows = collectRemoved(removed)

  const toggleVisibility = (key: ResumeSectionKey) =>
    setData({
      sectionVisibility: {
        ...data.sectionVisibility,
        [key]: data.sectionVisibility[key] === false,
      },
    })

  function addSkill(name: string) {
    if (data.skills.some((s) => normalizeName(s.name) === normalizeName(name)))
      return
    const fromMaster = master.skills.find((row) => {
      const catalogSkill = catalog.find((s) => s.id === row.skillId)
      return (
        catalogSkill && normalizeName(catalogSkill.name) === normalizeName(name)
      )
    })
    onChange({
      ...data,
      skills: [
        ...data.skills,
        {
          name,
          category: fromMaster?.category,
          level: fromMaster?.level,
        },
      ],
      removed: {
        ...removed,
        skills: removed.skills.filter(
          (skill) => normalizeName(skill.name) !== normalizeName(name),
        ),
      },
    })
  }

  function renderEditable(key: ResumeSectionKey) {
    switch (key) {
      case 'summary':
        return (
          <Textarea
            rows={4}
            value={data.summary}
            onChange={(event) => setData({ summary: event.target.value })}
          />
        )

      case 'contact': {
        const contact = data.contact
        const set = (patch: Partial<typeof contact>) =>
          setData({ contact: { ...contact, ...patch } })
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={contact.fullName ?? ''}
              placeholder="Full name"
              onChange={(event) => set({ fullName: event.target.value })}
            />
            <Input
              value={contact.email ?? ''}
              placeholder="Email"
              onChange={(event) => set({ email: event.target.value })}
            />
            <Input
              value={contact.phone ?? ''}
              placeholder="Phone"
              onChange={(event) => set({ phone: event.target.value })}
            />
            <Input
              value={contact.location ?? ''}
              placeholder="Location"
              onChange={(event) => set({ location: event.target.value })}
            />
            <Input
              value={contact.linkedin ?? ''}
              placeholder="LinkedIn"
              onChange={(event) => set({ linkedin: event.target.value })}
            />
            <Input
              value={contact.github ?? ''}
              placeholder="GitHub"
              onChange={(event) => set({ github: event.target.value })}
            />
          </div>
        )
      }

      case 'experience':
        return (
          <div className="space-y-3">
            <SortableList
              items={data.experience}
              getId={(item) => experienceIds.get(item) ?? experienceKey(item)}
              onReorder={(items) => setData({ experience: items })}
              handleLabel="Reorder experience entry"
              className="space-y-3"
              renderItem={(item, handle) => {
                const set = (patch: Partial<TailoredExperience>) =>
                  setData({
                    experience: replaceIn(data.experience, item, patch),
                  })
                return (
                  <div className="bg-card rounded-md border p-3">
                    <CardHeader
                      handle={handle}
                      label={[item.title || 'Untitled role', item.company]
                        .filter(Boolean)
                        .join(' · ')}
                      onRemove={() =>
                        onChange(removeItem(data, 'experience', item))
                      }
                      removeLabel={`Remove ${item.title || 'experience entry'}`}
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Input
                        value={item.title}
                        placeholder="Title"
                        onChange={(event) => set({ title: event.target.value })}
                      />
                      <Input
                        value={item.company}
                        placeholder="Company"
                        onChange={(event) =>
                          set({ company: event.target.value })
                        }
                      />
                      <Input
                        type="month"
                        value={item.startDate ?? ''}
                        onChange={(event) =>
                          set({ startDate: event.target.value })
                        }
                      />
                      <Input
                        type="month"
                        disabled={item.current}
                        value={item.endDate ?? ''}
                        onChange={(event) =>
                          set({ endDate: event.target.value })
                        }
                      />
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={item.current}
                        onChange={(event) =>
                          set({ current: event.target.checked })
                        }
                      />
                      Current role
                    </label>
                    <div className="mt-3">
                      <BulletListEditor
                        bullets={item.bullets}
                        onChange={(bullets) => set({ bullets })}
                      />
                    </div>
                  </div>
                )
              }}
            />
            {master.experience.some(
              (m) =>
                !data.experience.some(
                  (e) => e.company === m.company && e.title === m.title,
                ),
            ) ? (
              <AddFromMaster
                label="Add experience from master"
                onClick={() =>
                  setData({
                    experience: [
                      ...data.experience,
                      ...master.experience
                        .filter(
                          (m) =>
                            !data.experience.some(
                              (e) =>
                                e.company === m.company && e.title === m.title,
                            ),
                        )
                        .map((m) => ({
                          company: m.company,
                          title: m.title,
                          location: m.location,
                          startDate: m.startDate,
                          endDate: m.endDate,
                          current: m.current,
                          bullets: [...m.bullets],
                        })),
                    ],
                  })
                }
              />
            ) : null}
          </div>
        )

      case 'education':
        return (
          <div className="space-y-3">
            <SortableList
              items={data.education}
              getId={(item) => educationIds.get(item) ?? educationKey(item)}
              onReorder={(items) => setData({ education: items })}
              handleLabel="Reorder education entry"
              className="space-y-3"
              renderItem={(item, handle) => {
                const set = (patch: Partial<TailoredEducation>) =>
                  setData({
                    education: replaceIn(data.education, item, patch),
                  })
                return (
                  <div className="bg-card rounded-md border p-3">
                    <CardHeader
                      handle={handle}
                      label={item.school || 'Untitled education'}
                      onRemove={() =>
                        onChange(removeItem(data, 'education', item))
                      }
                      removeLabel={`Remove ${item.school || 'education entry'}`}
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Input
                        value={item.school}
                        placeholder="School"
                        onChange={(event) =>
                          set({ school: event.target.value })
                        }
                      />
                      <Input
                        value={item.degree ?? ''}
                        placeholder="Degree"
                        onChange={(event) =>
                          set({ degree: event.target.value })
                        }
                      />
                    </div>
                  </div>
                )
              }}
            />
            {master.education.some(
              (m) => !data.education.some((e) => e.school === m.school),
            ) ? (
              <AddFromMaster
                label="Add education from master"
                onClick={() =>
                  setData({
                    education: [
                      ...data.education,
                      ...master.education
                        .filter(
                          (m) =>
                            !data.education.some((e) => e.school === m.school),
                        )
                        .map((m) => ({
                          school: m.school,
                          degree: m.degree,
                          field: m.field,
                          startDate: m.startDate,
                          endDate: m.endDate,
                          gpa: m.gpa,
                        })),
                    ],
                  })
                }
              />
            ) : null}
          </div>
        )

      case 'skills': {
        const taken = new Set(data.skills.map((s) => normalizeName(s.name)))
        const options = catalog
          .filter((s) => !taken.has(normalizeName(s.name)))
          .map((s) => ({ value: s.name, label: s.name }))
        return (
          <div className="space-y-3">
            <SortableList
              items={data.skills}
              getId={(item) => skillIds.get(item) ?? skillKey(item)}
              onReorder={(items) => setData({ skills: items })}
              handleLabel="Reorder skill"
              className="divide-y rounded-md border"
              renderItem={(item, handle) => (
                <div className="flex items-center gap-2 px-2.5 py-2">
                  {handle}
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">
                    {item.name}
                  </span>
                  <SelectField
                    aria-label={`${item.name} level`}
                    className="w-28"
                    value={item.level ?? 'proficient'}
                    onChange={(value) =>
                      setData({
                        skills: replaceIn(data.skills, item, {
                          level: value as SkillLevel,
                        }),
                      })
                    }
                    options={LEVEL_OPTIONS}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => onChange(removeItem(data, 'skills', item))}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              )}
            />
            <div className="max-w-xs">
              <Combobox
                options={options}
                onSelect={addSkill}
                onCreate={addSkill}
                placeholder="Add skill"
                searchPlaceholder="Search skills..."
                createLabel="Add"
              />
            </div>
          </div>
        )
      }

      case 'projects':
        return (
          <div className="space-y-3">
            <SortableList
              items={data.projects}
              getId={(item) => projectIds.get(item) ?? projectKey(item)}
              onReorder={(items) => setData({ projects: items })}
              handleLabel="Reorder project"
              className="space-y-3"
              renderItem={(item, handle) => {
                const set = (patch: Partial<TailoredProject>) =>
                  setData({ projects: replaceIn(data.projects, item, patch) })
                return (
                  <div className="bg-card rounded-md border p-3">
                    <CardHeader
                      handle={handle}
                      label={item.name || 'Untitled project'}
                      onRemove={() =>
                        onChange(removeItem(data, 'projects', item))
                      }
                      removeLabel={`Remove ${item.name || 'project'}`}
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Input
                        value={item.name}
                        placeholder="Name"
                        onChange={(event) => set({ name: event.target.value })}
                      />
                      <Input
                        value={item.link ?? ''}
                        placeholder="Link"
                        onChange={(event) => set({ link: event.target.value })}
                      />
                    </div>
                  </div>
                )
              }}
            />
            {master.projects.some(
              (m) => !data.projects.some((p) => p.name === m.name),
            ) ? (
              <AddFromMaster
                label="Add projects from master"
                onClick={() =>
                  setData({
                    projects: [
                      ...data.projects,
                      ...master.projects
                        .filter(
                          (m) => !data.projects.some((p) => p.name === m.name),
                        )
                        .map((m) => ({
                          name: m.name,
                          description: m.description,
                          techStack: [...m.techStack],
                          link: m.link,
                        })),
                    ],
                  })
                }
              />
            ) : null}
          </div>
        )

      case 'certifications':
        return (
          <div className="space-y-3">
            <SortableList
              items={data.certifications}
              getId={(item) =>
                certificationIds.get(item) ?? certificationKey(item)
              }
              onReorder={(items) => setData({ certifications: items })}
              handleLabel="Reorder certification"
              className="space-y-3"
              renderItem={(item, handle) => {
                const set = (patch: Partial<TailoredCertification>) =>
                  setData({
                    certifications: replaceIn(data.certifications, item, patch),
                  })
                return (
                  <div className="bg-card rounded-md border p-3">
                    <CardHeader
                      handle={handle}
                      label={item.name || 'Untitled certification'}
                      onRemove={() =>
                        onChange(removeItem(data, 'certifications', item))
                      }
                      removeLabel={`Remove ${item.name || 'certification'}`}
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Input
                        value={item.name}
                        placeholder="Name"
                        onChange={(event) => set({ name: event.target.value })}
                      />
                      <Input
                        value={item.issuer ?? ''}
                        placeholder="Issuer"
                        onChange={(event) =>
                          set({ issuer: event.target.value })
                        }
                      />
                    </div>
                  </div>
                )
              }}
            />
            {master.certifications.some(
              (m) => !data.certifications.some((c) => c.name === m.name),
            ) ? (
              <AddFromMaster
                label="Add certifications from master"
                onClick={() =>
                  setData({
                    certifications: [
                      ...data.certifications,
                      ...master.certifications
                        .filter(
                          (m) =>
                            !data.certifications.some((c) => c.name === m.name),
                        )
                        .map((m) => ({
                          name: m.name,
                          issuer: m.issuer,
                          issuedDate: m.issuedDate,
                          link: m.link,
                        })),
                    ],
                  })
                }
              />
            ) : null}
          </div>
        )

      case 'languages':
        return (
          <div className="space-y-3">
            <SortableList
              items={data.languages}
              getId={(item) => languageIds.get(item) ?? languageKey(item)}
              onReorder={(items) => setData({ languages: items })}
              handleLabel="Reorder language"
              className="space-y-3"
              renderItem={(item, handle) => {
                const set = (patch: Partial<TailoredLanguage>) =>
                  setData({ languages: replaceIn(data.languages, item, patch) })
                return (
                  <div className="bg-card flex items-center gap-2 rounded-md border p-3">
                    {handle}
                    <Input
                      value={item.name}
                      placeholder="Language"
                      className="min-w-0 flex-1"
                      onChange={(event) => set({ name: event.target.value })}
                    />
                    <Input
                      value={item.proficiency ?? ''}
                      placeholder="Proficiency"
                      className="min-w-0 flex-1"
                      onChange={(event) =>
                        set({ proficiency: event.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${item.name}`}
                      onClick={() =>
                        onChange(removeItem(data, 'languages', item))
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )
              }}
            />
            {master.languages.some(
              (m) => !data.languages.some((l) => l.name === m.name),
            ) ? (
              <AddFromMaster
                label="Add languages from master"
                onClick={() =>
                  setData({
                    languages: [
                      ...data.languages,
                      ...master.languages
                        .filter(
                          (m) => !data.languages.some((l) => l.name === m.name),
                        )
                        .map((m) => ({
                          name: m.name,
                          proficiency: m.proficiency,
                        })),
                    ],
                  })
                }
              />
            ) : null}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[3fr_2fr]', className)}>
      <div className="min-w-0 space-y-4">
        <SegmentedControl
          options={PANE_OPTIONS}
          value={pane}
          onChange={setPane}
          ariaLabel="Editor pane"
          className="w-full lg:hidden"
        />
        <aside
          className={cn(
            'bg-card h-fit rounded-md border p-3',
            pane === 'sections' ? 'block' : 'hidden',
            'lg:block',
          )}
        >
          <SectionLabel>Master sections</SectionLabel>
          <SortableList
            items={data.sectionOrder}
            getId={(key) => key}
            onReorder={(order) => setData({ sectionOrder: order })}
            className="mt-2 space-y-0.5"
            renderItem={(key, handle) => {
              const hidden = data.sectionVisibility[key] === false
              return (
                <div
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-1 py-1.5',
                    hidden && 'opacity-50',
                  )}
                >
                  {handle}
                  <span className="flex-1 text-xs">{SECTION_TITLES[key]}</span>
                  <button
                    type="button"
                    aria-pressed={!hidden}
                    aria-label={`${hidden ? 'Show' : 'Hide'} ${SECTION_TITLES[key]}`}
                    onClick={() => toggleVisibility(key)}
                    className={cn(
                      'focus-visible:ring-ring rounded-full border px-1.5 py-0.5 text-[10px] focus-visible:ring-2 focus-visible:outline-none',
                      hidden
                        ? 'text-muted-foreground'
                        : 'border-focus/40 text-focus',
                    )}
                  >
                    {hidden ? 'Show' : 'Hide'}
                  </button>
                </div>
              )
            }}
          />
        </aside>

        <div
          className={cn(
            'min-w-0 space-y-4',
            pane === 'resume' ? 'block' : 'hidden',
            'lg:block',
          )}
        >
          <Field label="Headline">
            <Input
              value={data.headline}
              onChange={(event) => setData({ headline: event.target.value })}
            />
          </Field>
          {data.sectionOrder.map((key) => {
            if (data.sectionVisibility[key] === false) return null
            return (
              <div key={key} className="bg-card rounded-md border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <SectionLabel>{SECTION_TITLES[key]}</SectionLabel>
                </div>
                {renderEditable(key)}
              </div>
            )
          })}
          {removedRows.length > 0 ? (
            <div className="border-destructive/30 bg-destructive/5 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <SectionLabel>Removed</SectionLabel>
                <span className="text-destructive text-xs">
                  {removedRows.length}{' '}
                  {removedRows.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {removedRows.map((row, index) => (
                  <li
                    key={`${row.section}-${index}`}
                    className="border-destructive/30 bg-background flex items-center gap-2 rounded-md border px-2 py-1.5"
                  >
                    <span className="text-destructive min-w-0 flex-1 truncate text-xs">
                      {rowLabel(row)}
                    </span>
                    <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                      {SECTION_TITLES[row.section]}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => onChange(restoreRow(data, row))}
                    >
                      <RotateCcw className="size-3" /> Restore
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'space-y-4',
            pane === 'job' ? 'block' : 'hidden',
            'lg:block',
          )}
        >
          <div className="bg-card rounded-md border p-4">
            <SectionLabel>Job description</SectionLabel>
            {jd ? (
              <div className="bg-muted/40 mt-2 max-h-56 overflow-y-auto rounded-md border p-3">
                <pre className="font-sans text-xs whitespace-pre-wrap">
                  {jd}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2 text-xs">
                No job description attached.
              </p>
            )}
          </div>

          <div className="bg-card rounded-md border p-4">
            <SectionLabel>Skill gaps</SectionLabel>
            <GapPanel
              className="mt-3"
              missingRequired={gaps.missingRequired}
              missingOptional={gaps.missingOptional}
              notInJob={gaps.notInJob}
              onInsert={addSkill}
            />
          </div>
        </div>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Live preview</SectionLabel>
            <span className="text-muted-foreground text-[11px]">
              Updates as you edit
            </span>
          </div>
          <ResumePaper data={data} />
        </div>
      </aside>
    </div>
  )
}

function AddFromMaster({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Plus className="size-3.5" /> {label}
    </Button>
  )
}
