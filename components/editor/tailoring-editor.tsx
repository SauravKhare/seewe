'use client'

import { useMemo } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

import { BulletListEditor } from '@/components/app/bullet-list-editor'
import { Combobox } from '@/components/app/combobox'
import { Field } from '@/components/app/field'
import { GapPanel } from '@/components/editor/gap-panel'
import { SectionLabel } from '@/components/app/section-label'
import { SelectField } from '@/components/app/select-field'
import { SortableList } from '@/components/app/sortable-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SKILL_LEVEL_LABELS } from '@/lib/constants'
import { useAppStore } from '@/lib/data/store'
import { normalizeName } from '@/lib/id'
import { renderAtsText } from '@/lib/resume'
import { computeGaps } from '@/lib/tailoring'
import type { ResumeSectionKey, SkillLevel, TailoredResumeData } from '@/lib/types'
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

const LEVEL_OPTIONS = (
  Object.keys(SKILL_LEVEL_LABELS) as SkillLevel[]
).map((level) => ({ value: level, label: SKILL_LEVEL_LABELS[level] }))

export interface EditorJobSkill {
  name: string
  required: boolean
}

export function TailoringEditor({
  data,
  onChange,
  jd,
  jobSkills,
  mode,
  className,
}: {
  data: TailoredResumeData
  onChange: (data: TailoredResumeData) => void
  jd?: string
  jobSkills: EditorJobSkill[]
  mode: 'visual' | 'ats'
  className?: string
}) {
  const master = useAppStore((state) => state.master)
  const catalog = useAppStore((state) => state.skills)

  const gaps = useMemo(
    () => computeGaps(data, jobSkills),
    [data, jobSkills],
  )

  const setData = (patch: Partial<TailoredResumeData>) =>
    onChange({ ...data, ...patch })

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
    setData({
      skills: [
        ...data.skills,
        {
          name,
          category: fromMaster?.category,
          level: fromMaster?.level,
        },
      ],
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
            {data.experience.map((item, index) => (
              <div key={index} className="bg-card rounded-md border p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={item.title}
                    placeholder="Title"
                    onChange={(event) => {
                      const next = data.experience.slice()
                      next[index] = { ...item, title: event.target.value }
                      setData({ experience: next })
                    }}
                  />
                  <Input
                    value={item.company}
                    placeholder="Company"
                    onChange={(event) => {
                      const next = data.experience.slice()
                      next[index] = { ...item, company: event.target.value }
                      setData({ experience: next })
                    }}
                  />
                  <Input
                    type="month"
                    value={item.startDate ?? ''}
                    onChange={(event) => {
                      const next = data.experience.slice()
                      next[index] = { ...item, startDate: event.target.value }
                      setData({ experience: next })
                    }}
                  />
                  <Input
                    type="month"
                    disabled={item.current}
                    value={item.endDate ?? ''}
                    onChange={(event) => {
                      const next = data.experience.slice()
                      next[index] = { ...item, endDate: event.target.value }
                      setData({ experience: next })
                    }}
                  />
                </div>
                <div className="mt-3">
                  <BulletListEditor
                    bullets={item.bullets}
                    onChange={(bullets) => {
                      const next = data.experience.slice()
                      next[index] = { ...item, bullets }
                      setData({ experience: next })
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      setData({
                        experience: data.experience.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    <Trash2 className="size-3" /> Remove
                  </Button>
                </div>
              </div>
            ))}
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
            {data.education.map((item, index) => (
              <div key={index} className="bg-card rounded-md border p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={item.school}
                    placeholder="School"
                    onChange={(event) => {
                      const next = data.education.slice()
                      next[index] = { ...item, school: event.target.value }
                      setData({ education: next })
                    }}
                  />
                  <Input
                    value={item.degree ?? ''}
                    placeholder="Degree"
                    onChange={(event) => {
                      const next = data.education.slice()
                      next[index] = { ...item, degree: event.target.value }
                      setData({ education: next })
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      setData({
                        education: data.education.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 className="size-3" /> Remove
                  </Button>
                </div>
              </div>
            ))}
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
                          (m) => !data.education.some((e) => e.school === m.school),
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
            <ul className="divide-y rounded-md border">
              {data.skills.map((skill, index) => (
                <li key={index} className="flex items-center gap-2 px-2.5 py-2">
                  <span className="flex-1 font-mono text-xs">{skill.name}</span>
                  <SelectField
                    aria-label={`${skill.name} level`}
                    className="w-28"
                    value={skill.level ?? 'proficient'}
                    onChange={(value) => {
                      const next = data.skills.slice()
                      next[index] = { ...skill, level: value as SkillLevel }
                      setData({ skills: next })
                    }}
                    options={LEVEL_OPTIONS}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${skill.name}`}
                    onClick={() =>
                      setData({
                        skills: data.skills.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <X className="size-3" />
                  </Button>
                </li>
              ))}
            </ul>
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
            {data.projects.map((item, index) => (
              <div key={index} className="bg-card rounded-md border p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={item.name}
                    placeholder="Name"
                    onChange={(event) => {
                      const next = data.projects.slice()
                      next[index] = { ...item, name: event.target.value }
                      setData({ projects: next })
                    }}
                  />
                  <Input
                    value={item.link ?? ''}
                    placeholder="Link"
                    onChange={(event) => {
                      const next = data.projects.slice()
                      next[index] = { ...item, link: event.target.value }
                      setData({ projects: next })
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      setData({
                        projects: data.projects.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 className="size-3" /> Remove
                  </Button>
                </div>
              </div>
            ))}
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
                        .filter((m) => !data.projects.some((p) => p.name === m.name))
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
            {data.certifications.map((item, index) => (
              <div key={index} className="bg-card rounded-md border p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={item.name}
                    placeholder="Name"
                    onChange={(event) => {
                      const next = data.certifications.slice()
                      next[index] = { ...item, name: event.target.value }
                      setData({ certifications: next })
                    }}
                  />
                  <Input
                    value={item.issuer ?? ''}
                    placeholder="Issuer"
                    onChange={(event) => {
                      const next = data.certifications.slice()
                      next[index] = { ...item, issuer: event.target.value }
                      setData({ certifications: next })
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      setData({
                        certifications: data.certifications.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    <Trash2 className="size-3" /> Remove
                  </Button>
                </div>
              </div>
            ))}
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
                          (m) => !data.certifications.some((c) => c.name === m.name),
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
            {data.languages.map((item, index) => (
              <div
                key={index}
                className="bg-card flex items-center gap-2 rounded-md border p-3"
              >
                <Input
                  value={item.name}
                  placeholder="Language"
                  onChange={(event) => {
                    const next = data.languages.slice()
                    next[index] = { ...item, name: event.target.value }
                    setData({ languages: next })
                  }}
                />
                <Input
                  value={item.proficiency ?? ''}
                  placeholder="Proficiency"
                  onChange={(event) => {
                    const next = data.languages.slice()
                    next[index] = { ...item, proficiency: event.target.value }
                    setData({ languages: next })
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${item.name}`}
                  onClick={() =>
                    setData({
                      languages: data.languages.filter((_, i) => i !== index),
                    })
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
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
                        .filter((m) => !data.languages.some((l) => l.name === m.name))
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
    <div
      className={cn(
        'grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)_18rem]',
        className,
      )}
    >
      <aside className="bg-card h-fit rounded-md border p-3 lg:sticky lg:top-20">
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
                    'rounded-full border px-1.5 py-0.5 text-[10px]',
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

      <div className="min-w-0">
        {mode === 'ats' ? (
          <pre className="bg-neutral-900 min-h-[28rem] overflow-auto rounded-md p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-lime-100">
            {renderAtsText(data)}
          </pre>
        ) : (
          <div className="space-y-4">
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
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="bg-card rounded-md border p-4">
          <SectionLabel>Job description</SectionLabel>
          {jd ? (
            <div className="bg-muted/40 mt-2 max-h-56 overflow-y-auto rounded-md border p-3">
              <pre className="font-sans text-xs whitespace-pre-wrap">{jd}</pre>
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
            missingFromResume={gaps.missingFromResume}
            notInJob={gaps.notInJob}
            onInsert={addSkill}
          />
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
