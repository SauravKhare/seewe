'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  handleLabel = 'Reorder item',
  className,
}: {
  items: T[]
  getId: (item: T) => string
  onReorder: (items: T[]) => void
  renderItem: (item: T, handle: React.ReactNode) => React.ReactNode
  handleLabel?: string
  className?: string
}) {
  const [dragId, setDragId] = useState<string | null>(null)

  function moveOver(overId: string) {
    if (!dragId || dragId === overId) return
    const from = items.findIndex((item) => getId(item) === dragId)
    const to = items.findIndex((item) => getId(item) === overId)
    if (from < 0 || to < 0) return
    const next = items.slice()
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onReorder(next)
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const id = getId(item)
        const handle = (
          <button
            type="button"
            draggable
            aria-label={handleLabel}
            onDragStart={() => setDragId(id)}
            onDragEnd={() => setDragId(null)}
            className={cn(
              'text-muted-foreground hover:text-foreground cursor-grab p-1 active:cursor-grabbing',
              dragId === id && 'opacity-50',
            )}
          >
            <span aria-hidden className="text-xs">
              ⣿
            </span>
          </button>
        )
        return (
          <div
            key={id}
            onDragOver={(event) => {
              event.preventDefault()
              moveOver(id)
            }}
            onDrop={() => setDragId(null)}
          >
            {renderItem(item, handle)}
          </div>
        )
      })}
    </div>
  )
}
