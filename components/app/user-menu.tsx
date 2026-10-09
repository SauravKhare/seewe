'use client'

import { useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { clearAuthCookie } from '@/lib/auth/fake-auth'
import { DEMO_USER } from '@/lib/data/fixtures'

const emptySubscribe = () => () => {}

export function UserMenu() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  function signOut() {
    clearAuthCookie()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2"
      >
        <Avatar size="sm">
          <AvatarFallback>{DEMO_USER.initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="text-foreground block text-sm font-medium">
            {DEMO_USER.name}
          </span>
          <span className="text-muted-foreground block text-xs">
            {DEMO_USER.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/resume')}>
          Master resume
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {mounted ? (
          <>
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
