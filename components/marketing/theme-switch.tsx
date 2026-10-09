'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Icon + label theme switcher for the marketing footer. */
export function ThemeSwitch({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className={cn(
        'hover:text-foreground inline-flex items-center gap-2 transition-colors',
        className,
      )}
    >
      <span className="hidden items-center gap-2 dark:flex">
        <Sun className="size-3.5" />
        Light
      </span>
      <span className="flex items-center gap-2 dark:hidden">
        <Moon className="size-3.5" />
        Dark
      </span>
    </button>
  )
}
