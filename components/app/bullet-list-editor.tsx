'use client'

import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function BulletListEditor({
  bullets,
  onChange,
  hint = 'Write measurable impact.',
}: {
  bullets: string[]
  onChange: (bullets: string[]) => void
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs">{hint}</p>
      {bullets.map((bullet, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-muted-foreground">—</span>
          <Input
            value={bullet}
            onChange={(event) => {
              const next = bullets.slice()
              next[index] = event.target.value
              onChange(next)
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove bullet ${index + 1}`}
            onClick={() => onChange(bullets.filter((_, i) => i !== index))}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange([...bullets, ''])}
      >
        <Plus className="size-3.5" /> Add bullet
      </Button>
    </div>
  )
}
