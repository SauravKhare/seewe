'use client'

import { X } from 'lucide-react'

import { Combobox } from '@/components/app/combobox'
import { SelectField } from '@/components/app/select-field'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/data/store'
import { SKILL_LEVEL_LABELS } from '@/lib/constants'
import { createId } from '@/lib/id'
import type { SkillLevel } from '@/lib/types'

const LEVELS = Object.entries(SKILL_LEVEL_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function SkillsEditor() {
  const master = useAppStore((state) => state.master)
  const catalog = useAppStore((state) => state.skills)

  const options = catalog
    .filter((skill) => !master.skills.some((row) => row.skillId === skill.id))
    .map((skill) => ({ value: skill.id, label: skill.name }))

  function addSkill(skillId: string) {
    const state = useAppStore.getState()
    if (state.master.skills.some((row) => row.skillId === skillId)) return
    state.upsertResumeSkill({
      id: createId('rs'),
      resumeId: state.master.resume.id,
      skillId,
      level: 'proficient',
      sortOrder: state.master.skills.length,
    })
  }

  function addByName(name: string) {
    const skill = useAppStore.getState().ensureSkill(name)
    addSkill(skill.id)
  }

  return (
    <div className="space-y-4">
      {master.skills.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No skills yet. Add the ones you want on your master resume.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {master.skills.map((row) => {
            const skill = catalog.find((entry) => entry.id === row.skillId)
            return (
              <li
                key={row.id}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <span className="flex-1 font-mono text-xs">
                  {skill?.name ?? 'Unknown'}
                </span>
                <SelectField
                  aria-label={`${skill?.name ?? 'Skill'} level`}
                  value={row.level ?? 'proficient'}
                  onChange={(level) =>
                    useAppStore
                      .getState()
                      .upsertResumeSkill({ ...row, level: level as SkillLevel })
                  }
                  options={LEVELS}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${skill?.name ?? 'skill'}`}
                  onClick={() =>
                    useAppStore.getState().removeResumeSkill(row.id)
                  }
                >
                  <X className="size-3.5" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      <div className="max-w-xs">
        <Combobox
          options={options}
          onSelect={addSkill}
          onCreate={addByName}
          placeholder="Add skill"
          searchPlaceholder="Search skills..."
          createLabel="Add"
        />
      </div>
    </div>
  )
}
