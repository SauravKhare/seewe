'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Plus } from 'lucide-react'

import { CommandPalette } from '@/components/app/command-palette'
import { Sidebar } from '@/components/app/sidebar'
import { ThemeToggle } from '@/components/app/theme-toggle'
import { UserMenu } from '@/components/app/user-menu'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Topbar() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-background sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 lg:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          aria-label="Open navigation"
          className="hover:bg-muted inline-flex size-8 items-center justify-center rounded-md lg:hidden"
        >
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <CommandPalette />

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <Button size="sm" onClick={() => router.push('/jobs/new')}>
          <Plus className="size-3.5" />
          New job / resume
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
