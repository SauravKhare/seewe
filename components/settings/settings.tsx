'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Field } from '@/components/app/field'
import { PageHeading } from '@/components/app/page-heading'
import { Panel, PanelHeader } from '@/components/app/panel'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { clearAccount, clearAuthCookie } from '@/lib/auth/fake-auth'
import { useAppStore } from '@/lib/data/store'
import { DEMO_USER } from '@/lib/data/fixtures'

export function Settings() {
  const router = useRouter()
  const [name, setName] = useState(DEMO_USER.name)
  const [email, setEmail] = useState(DEMO_USER.email)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function deleteAccount() {
    clearAuthCookie()
    clearAccount()
    useAppStore.getState().resetDemo()
    toast('Account deleted. Signed out.')
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Workspace"
        title="Settings"
        description="Profile, template, and data."
      />

      <Panel className="p-5">
        <PanelHeader title="Profile" />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar size="lg">
            <AvatarFallback>{DEMO_USER.initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Field label="Name">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() => toast('Profile saved.')}
          >
            Save profile
          </Button>
        </div>
      </Panel>

      <Panel className="p-5">
        <PanelHeader
          title="Resume template"
          description="One ATS-safe template for now."
        />
        <div className="border-focus/40 bg-focus/5 mt-4 flex items-center gap-3 rounded-md border p-3">
          <span className="bg-background flex h-12 w-9 items-center justify-center rounded border text-[10px] font-bold">
            ATS
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">ATS single column</p>
            <p className="text-muted-foreground text-xs">
              Plain, parseable, and predictable.
            </p>
          </div>
          <span className="text-focus text-xs">Selected</span>
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          More templates soon.
        </p>
      </Panel>

      {process.env.NEXT_PUBLIC_ENABLE_DEMO_TOOLS === 'true' ? (
        <Panel className="p-5">
          <PanelHeader
            title="Demo data"
            description="Preview empty states or restore the seed dataset."
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                useAppStore.getState().clearDemo()
                toast('Empty states enabled.')
              }}
            >
              Preview empty states
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                useAppStore.getState().resetDemo()
                toast('Demo data restored.')
              }}
            >
              Reset demo data
            </Button>
          </div>
        </Panel>
      ) : null}

      <Panel className="p-5">
        <PanelHeader
          title="Privacy and data"
          description="Everything stays in this browser for now. Accounts, cloud storage, and data export arrive with the backend."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            Delete account
          </Button>
        </div>
      </Panel>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears your local data and signs you out. It cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAccount}>
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
