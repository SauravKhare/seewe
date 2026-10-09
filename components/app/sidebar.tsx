'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
} from 'lucide-react'

import { SectionLabel } from '@/components/app/section-label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DEMO_USER } from '@/lib/data/fixtures'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/jobs', icon: BriefcaseBusiness },
  { label: 'Master resume', href: '/resume', icon: FileText },
  { label: 'Companies', href: '/companies', icon: Building2 },
] as const

export function Sidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className={cn('flex h-full flex-col gap-1 p-4', className)}>
      <Link
        href="/"
        onClick={onNavigate}
        className="px-2 text-lg font-bold tracking-[-0.06em]"
      >
        seewe<span className="text-focus">.</span>
      </Link>

      <SectionLabel className="mt-8 mb-1 px-2">Workspace</SectionLabel>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
              active
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      })}

      <div className="flex-1" />

      <Link
        href="/settings"
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
          isActive('/settings')
            ? 'bg-muted text-foreground font-medium'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        )}
      >
        <Settings className="size-4" />
        Settings
      </Link>

      <div className="mt-3 flex items-center gap-2.5 border-t pt-4">
        <Avatar size="sm">
          <AvatarFallback>{DEMO_USER.initials}</AvatarFallback>
        </Avatar>
        <span className="min-w-0">
          <strong className="block truncate text-xs font-medium">
            {DEMO_USER.name}
          </strong>
          <small className="text-muted-foreground block text-xs">
            Free plan
          </small>
        </span>
      </div>
    </div>
  )
}
