'use client'

import { useState } from 'react'
import { Plus, Sparkles, Trash2 } from 'lucide-react'

import { BulletListEditor } from '@/components/app/bullet-list-editor'
import { Field } from '@/components/app/field'
import { ResumePaper } from '@/components/app/resume-paper'
import { SectionLabel } from '@/components/app/section-label'
import { SkillsEditor } from '@/components/app/skills-editor'
import { SortableList } from '@/components/app/sortable-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/data/store'
import { createId } from '@/lib/id'
import { tailoredFromMaster } from '@/lib/tailoring'
import type {
  Certification,
  Education,
  Experience,
  Language,
  MasterResumeData,
  Project,
} from '@/lib/types'
import { cn } from '@/lib/utils'

type SectionKey =
  | 'headline'
  | 'summary'
  | 'contact'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'

const SECTIONS: {
  key: SectionKey
  label: string
  description: string
  required?: boolean
}[] = [
  {
    key: 'headline',
    label: 'Headline',
    description: 'A one-line positioning statement.',
  },
  {
    key: 'summary',
    label: 'Summary',
    description: 'A short paragraph on who you are and what you do.',
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'How a recruiter reaches you.',
  },
  {
    key: 'experience',
    label: 'Experience',
    description: 'Show the work that makes you a strong candidate.',
    required: true,
  },
  {
    key: 'education',
    label: 'Education',
    description: 'Your academic background.',
    required: true,
  },
  {
    key: 'skills',
    label: 'Skills',
    description: 'The tools and strengths you want surfaced.',
    required: true,
  },
  {
    key: 'projects',
    label: 'Projects',
    description: 'Selected work beyond your day job.',
  },
  {
    key: 'certifications',
    label: 'Certifications',
    description: 'Credentials that back up your skills.',
  },
  {
    key: 'languages',
    label: 'Languages',
    description: 'Languages you speak and your level.',
  },
]

type SkillName = (skillId: string) => string

function hasText(...values: (string | undefined | null)[]): boolean {
  return values.some((value) => (value ?? '').trim().length > 0)
}

/** A section counts as done only when a row has a real, identifying value. */
function sectionComplete(
  key: SectionKey,
  master: MasterResumeData,
  skillName: SkillName,
): boolean {
  switch (key) {
    case 'headline':
      return master.resume.headline.trim().length > 0
    case 'summary':
      return master.resume.summary.trim().length > 0
    case 'contact':
      return Boolean(master.resume.contact.fullName?.trim())
    case 'experience':
      return master.experience.some((item) => hasText(item.title, item.company))
    case 'education':
      return master.education.some((item) => hasText(item.school, item.degree))
    case 'skills':
      return master.skills.some((item) => hasText(skillName(item.skillId)))
    case 'projects':
      return master.projects.some((item) => hasText(item.name))
    case 'certifications':
      return master.certifications.some((item) => hasText(item.name))
    case 'languages':
      return master.languages.some((item) => hasText(item.name))
    default:
      return false
  }
}

function ItemCard({
  handle,
  title,
  onRemove,
  children,
}: {
  handle: React.ReactNode
  title: string
  onRemove: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-card rounded-md border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          {handle}
          {title}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${title}`}
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Plus className="size-3.5" /> {label}
    </Button>
  )
}

export function MasterEditor() {
  const master = useAppStore((state) => state.master)
  const catalog = useAppStore((state) => state.skills)
  const [active, setActive] = useState<SectionKey>('headline')

  const skillName: SkillName = (skillId) =>
    catalog.find((skill) => skill.id === skillId)?.name ?? ''

  const store = useAppStore.getState.bind(useAppStore)
  const previewData = tailoredFromMaster(master, catalog)

  function goTo(section: SectionKey) {
    setActive(section)
    document.getElementById(`section-${section}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function newExperience(): Experience {
    return {
      id: createId('exp'),
      resumeId: master.resume.id,
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
      sortOrder: master.experience.length,
    }
  }

  function newEducation(): Education {
    return {
      id: createId('edu'),
      resumeId: master.resume.id,
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      sortOrder: master.education.length,
    }
  }

  function newProject(): Project {
    return {
      id: createId('proj'),
      resumeId: master.resume.id,
      name: '',
      description: '',
      techStack: [],
      link: '',
      sortOrder: master.projects.length,
    }
  }

  function newCertification(): Certification {
    return {
      id: createId('cert'),
      resumeId: master.resume.id,
      name: '',
      issuer: '',
      issuedDate: '',
      link: '',
      sortOrder: master.certifications.length,
    }
  }

  function newLanguage(): Language {
    return {
      id: createId('lang'),
      resumeId: master.resume.id,
      name: '',
      proficiency: '',
      sortOrder: master.languages.length,
    }
  }

  function renderSection(key: SectionKey = active) {
    switch (key) {
      case 'headline':
        return (
          <Field label="Headline">
            <Input
              value={master.resume.headline}
              placeholder="Senior Backend Engineer"
              onChange={(event) =>
                store().updateMaster({ headline: event.target.value })
              }
            />
          </Field>
        )

      case 'summary':
        return (
          <Field label="Summary">
            <Textarea
              rows={6}
              value={master.resume.summary}
              placeholder="A short paragraph on who you are and what you do."
              onChange={(event) =>
                store().updateMaster({ summary: event.target.value })
              }
            />
          </Field>
        )

      case 'contact': {
        const contact = master.resume.contact
        const set = (patch: Partial<typeof contact>) =>
          store().updateMaster({ contact: { ...contact, ...patch } })
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={contact.fullName ?? ''}
                onChange={(event) => set({ fullName: event.target.value })}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={contact.email ?? ''}
                onChange={(event) => set({ email: event.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={contact.phone ?? ''}
                onChange={(event) => set({ phone: event.target.value })}
              />
            </Field>
            <Field label="Location">
              <Input
                value={contact.location ?? ''}
                onChange={(event) => set({ location: event.target.value })}
              />
            </Field>
            <Field label="LinkedIn">
              <Input
                value={contact.linkedin ?? ''}
                onChange={(event) => set({ linkedin: event.target.value })}
              />
            </Field>
            <Field label="GitHub">
              <Input
                value={contact.github ?? ''}
                onChange={(event) => set({ github: event.target.value })}
              />
            </Field>
            <Field label="Website" className="sm:col-span-2">
              <Input
                value={contact.website ?? ''}
                onChange={(event) => set({ website: event.target.value })}
              />
            </Field>
          </div>
        )
      }

      case 'experience':
        return (
          <div className="space-y-4">
            <SortableList
              items={master.experience}
              getId={(item) => item.id}
              onReorder={(items) =>
                store().reorderMasterSection(
                  'experience',
                  items.map((item) => item.id),
                )
              }
              className="space-y-4"
              renderItem={(item, handle) => (
                <ItemCard
                  handle={handle}
                  title={item.title || 'New experience'}
                  onRemove={() => store().removeExperience(item.id)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Title">
                      <Input
                        value={item.title}
                        onChange={(event) =>
                          store().upsertExperience({
                            ...item,
                            title: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Company">
                      <Input
                        value={item.company}
                        onChange={(event) =>
                          store().upsertExperience({
                            ...item,
                            company: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Start">
                      <Input
                        type="month"
                        value={item.startDate ?? ''}
                        onChange={(event) =>
                          store().upsertExperience({
                            ...item,
                            startDate: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="End">
                      <Input
                        type="month"
                        disabled={item.current}
                        value={item.endDate ?? ''}
                        onChange={(event) =>
                          store().upsertExperience({
                            ...item,
                            endDate: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Location" className="sm:col-span-2">
                      <Input
                        value={item.location ?? ''}
                        onChange={(event) =>
                          store().upsertExperience({
                            ...item,
                            location: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.current}
                      onChange={(event) =>
                        store().upsertExperience({
                          ...item,
                          current: event.target.checked,
                        })
                      }
                    />
                    I currently work here
                  </label>
                  <div className="border-t pt-4">
                    <BulletListEditor
                      bullets={item.bullets}
                      onChange={(bullets) =>
                        store().upsertExperience({ ...item, bullets })
                      }
                    />
                  </div>
                </ItemCard>
              )}
            />
            <AddButton
              label="Add experience"
              onClick={() => store().upsertExperience(newExperience())}
            />
          </div>
        )

      case 'education':
        return (
          <div className="space-y-4">
            <SortableList
              items={master.education}
              getId={(item) => item.id}
              onReorder={(items) =>
                store().reorderMasterSection(
                  'education',
                  items.map((item) => item.id),
                )
              }
              className="space-y-4"
              renderItem={(item, handle) => (
                <ItemCard
                  handle={handle}
                  title={item.school || 'New education'}
                  onRemove={() => store().removeEducation(item.id)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="School">
                      <Input
                        value={item.school}
                        onChange={(event) =>
                          store().upsertEducation({
                            ...item,
                            school: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Degree">
                      <Input
                        value={item.degree ?? ''}
                        onChange={(event) =>
                          store().upsertEducation({
                            ...item,
                            degree: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Field">
                      <Input
                        value={item.field ?? ''}
                        onChange={(event) =>
                          store().upsertEducation({
                            ...item,
                            field: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="GPA">
                      <Input
                        value={item.gpa ?? ''}
                        onChange={(event) =>
                          store().upsertEducation({
                            ...item,
                            gpa: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Start">
                      <Input
                        type="month"
                        value={item.startDate ?? ''}
                        onChange={(event) =>
                          store().upsertEducation({
                            ...item,
                            startDate: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="End">
                      <Input
                        type="month"
                        value={item.endDate ?? ''}
                        onChange={(event) =>
                          store().upsertEducation({
                            ...item,
                            endDate: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </ItemCard>
              )}
            />
            <AddButton
              label="Add education"
              onClick={() => store().upsertEducation(newEducation())}
            />
          </div>
        )

      case 'skills':
        return <SkillsEditor />

      case 'projects':
        return (
          <div className="space-y-4">
            <SortableList
              items={master.projects}
              getId={(item) => item.id}
              onReorder={(items) =>
                store().reorderMasterSection(
                  'projects',
                  items.map((item) => item.id),
                )
              }
              className="space-y-4"
              renderItem={(item, handle) => (
                <ItemCard
                  handle={handle}
                  title={item.name || 'New project'}
                  onRemove={() => store().removeProject(item.id)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name">
                      <Input
                        value={item.name}
                        onChange={(event) =>
                          store().upsertProject({
                            ...item,
                            name: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Link">
                      <Input
                        value={item.link ?? ''}
                        onChange={(event) =>
                          store().upsertProject({
                            ...item,
                            link: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Tech stack" className="sm:col-span-2">
                      <Input
                        value={item.techStack.join(', ')}
                        placeholder="TypeScript, PostgreSQL, AWS"
                        onChange={(event) =>
                          store().upsertProject({
                            ...item,
                            techStack: event.target.value
                              .split(',')
                              .map((entry) => entry.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </Field>
                    <Field label="Description" className="sm:col-span-2">
                      <Textarea
                        rows={3}
                        value={item.description ?? ''}
                        onChange={(event) =>
                          store().upsertProject({
                            ...item,
                            description: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </ItemCard>
              )}
            />
            <AddButton
              label="Add project"
              onClick={() => store().upsertProject(newProject())}
            />
          </div>
        )

      case 'certifications':
        return (
          <div className="space-y-4">
            <SortableList
              items={master.certifications}
              getId={(item) => item.id}
              onReorder={(items) =>
                store().reorderMasterSection(
                  'certifications',
                  items.map((item) => item.id),
                )
              }
              className="space-y-4"
              renderItem={(item, handle) => (
                <ItemCard
                  handle={handle}
                  title={item.name || 'New certification'}
                  onRemove={() => store().removeCertification(item.id)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name">
                      <Input
                        value={item.name}
                        onChange={(event) =>
                          store().upsertCertification({
                            ...item,
                            name: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Issuer">
                      <Input
                        value={item.issuer ?? ''}
                        onChange={(event) =>
                          store().upsertCertification({
                            ...item,
                            issuer: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Issued">
                      <Input
                        type="month"
                        value={item.issuedDate ?? ''}
                        onChange={(event) =>
                          store().upsertCertification({
                            ...item,
                            issuedDate: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Link">
                      <Input
                        value={item.link ?? ''}
                        onChange={(event) =>
                          store().upsertCertification({
                            ...item,
                            link: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </ItemCard>
              )}
            />
            <AddButton
              label="Add certification"
              onClick={() => store().upsertCertification(newCertification())}
            />
          </div>
        )

      case 'languages':
        return (
          <div className="space-y-4">
            <SortableList
              items={master.languages}
              getId={(item) => item.id}
              onReorder={(items) =>
                store().reorderMasterSection(
                  'languages',
                  items.map((item) => item.id),
                )
              }
              className="space-y-4"
              renderItem={(item, handle) => (
                <ItemCard
                  handle={handle}
                  title={item.name || 'New language'}
                  onRemove={() => store().removeLanguage(item.id)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Language">
                      <Input
                        value={item.name}
                        onChange={(event) =>
                          store().upsertLanguage({
                            ...item,
                            name: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Proficiency">
                      <Input
                        value={item.proficiency ?? ''}
                        placeholder="Native, Fluent, Conversational"
                        onChange={(event) =>
                          store().upsertLanguage({
                            ...item,
                            proficiency: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </ItemCard>
              )}
            />
            <AddButton
              label="Add language"
              onClick={() => store().upsertLanguage(newLanguage())}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="min-w-0 space-y-6">
        <div className="border-focus/30 bg-focus/5 text-focus flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-xs">
          <Sparkles className="size-4" />
          This is your master resume. Tailoring always edits a copy, never this.
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SECTIONS.map((section) => {
            const done = sectionComplete(section.key, master, skillName)
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => goTo(section.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  section.key === active
                    ? 'border-focus/50 bg-focus/10 text-focus font-medium'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {done ? '✓ ' : ''}
                {section.label}
              </button>
            )
          })}
        </div>

        {SECTIONS.map((section) => (
          <section
            key={section.key}
            id={`section-${section.key}`}
            className="scroll-mt-24 space-y-4"
          >
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">
                {section.label}
                {section.required ? (
                  <span className="text-focus ml-2 text-xs font-normal">
                    Required
                  </span>
                ) : null}
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {section.description}
              </p>
            </div>
            <div className="bg-card rounded-md border p-4">
              {renderSection(section.key)}
            </div>
          </section>
        ))}
      </div>

      <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Live preview</SectionLabel>
            <span className="text-muted-foreground text-[11px]">
              Updates as you type
            </span>
          </div>
          <ResumePaper data={previewData} />
        </div>
      </aside>
    </div>
  )
}
