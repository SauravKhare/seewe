'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
}

export function Combobox({
  options,
  value,
  onSelect,
  onCreate,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No matches.',
  createLabel = 'Create',
  className,
}: {
  options: ComboboxOption[]
  value?: string
  onSelect: (value: string) => void
  onCreate?: (query: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  createLabel?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((option) => option.value === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query])

  const trimmed = query.trim()
  const canCreate =
    Boolean(onCreate) &&
    trimmed.length > 0 &&
    !options.some(
      (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
    )

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery('')
      }}
    >
      <PopoverTrigger
        className={cn(
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3',
          className,
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="text-muted-foreground size-3.5 shrink-0" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filtered.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onSelect(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                  {option.value === value ? (
                    <Check className="ml-auto size-3.5" />
                  ) : null}
                </CommandItem>
              ))}
              {canCreate ? (
                <CommandItem
                  value={`__create__${trimmed}`}
                  onSelect={() => {
                    onCreate?.(trimmed)
                    setOpen(false)
                  }}
                >
                  {createLabel} “{trimmed}”
                </CommandItem>
              ) : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
