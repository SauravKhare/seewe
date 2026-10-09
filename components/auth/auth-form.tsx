'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, FileText, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createAccount,
  setAuthCookie,
  validateCredentials,
} from '@/lib/auth/fake-auth'
import { cn } from '@/lib/utils'

type Mode = 'sign-in' | 'sign-up'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSignUp = mode === 'sign-up'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validateField(
    field: 'email' | 'password' | 'confirm',
    value: string,
  ) {
    let message = ''
    if (field === 'email' && !EMAIL_RE.test(value.trim())) {
      message = 'Enter a valid email address.'
    }
    if (field === 'password' && value.length < 8) {
      message = 'Use at least 8 characters.'
    }
    if (field === 'confirm' && value !== password) {
      message = 'Passwords do not match.'
    }
    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const nextErrors: Record<string, string> = {}
    if (!EMAIL_RE.test(email.trim()))
      nextErrors.email = 'Enter a valid email address.'
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (isSignUp && confirm !== password)
      nextErrors.confirm = 'Passwords do not match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    window.setTimeout(() => {
      if (isSignUp) {
        if (!createAccount(email, password)) {
          setSubmitting(false)
          setFormError('An account with this email already exists.')
          return
        }
        setAuthCookie()
        router.push('/onboarding')
        return
      }
      if (!validateCredentials(email, password)) {
        setSubmitting(false)
        setFormError('Email or password is incorrect.')
        return
      }
      setAuthCookie()
      const next = searchParams.get('next')
      router.push(next && next.startsWith('/') ? next : '/dashboard')
    }, 500)
  }

  return (
    <div className="bg-card rounded-md border p-7">
      <div className="text-center">
        <span className="bg-muted text-focus mx-auto flex size-9 items-center justify-center rounded-full">
          <FileText className="size-4" />
        </span>
        <h1 className="mt-3.5 text-2xl font-semibold tracking-[-0.02em]">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isSignUp
            ? 'Start tailoring with a master resume.'
            : 'Pick up where you left off.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={(event) => validateField('email', event.target.value)}
          />
          {errors.email ? (
            <p role="alert" className="text-destructive text-xs">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            placeholder="At least 8 characters"
            value={password}
            aria-invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={(event) => validateField('password', event.target.value)}
          />
          {errors.password ? (
            <p role="alert" className="text-destructive text-xs">
              {errors.password}
            </p>
          ) : null}
        </div>

        {isSignUp ? (
          <div className="grid gap-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm}
              aria-invalid={Boolean(errors.confirm)}
              onChange={(event) => setConfirm(event.target.value)}
              onBlur={(event) => validateField('confirm', event.target.value)}
            />
            {errors.confirm ? (
              <p role="alert" className="text-destructive text-xs">
                {errors.confirm}
              </p>
            ) : null}
          </div>
        ) : null}

        {formError ? (
          <p
            role="alert"
            className="border-destructive/40 text-destructive rounded-md border px-3 py-2 text-xs"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {isSignUp ? 'Create account' : 'Sign in'}
          {!submitting ? <ArrowRight className="size-4" /> : null}
        </Button>
      </form>

      <p className="text-muted-foreground mt-5 text-center text-xs">
        {isSignUp ? 'Already have an account?' : 'New to seewe?'}{' '}
        <Link
          href={isSignUp ? '/sign-in' : '/sign-up'}
          className="text-focus hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </div>
  )
}

function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('pr-9', className)}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {visible ? (
          <EyeOff className="size-3.5" />
        ) : (
          <Eye className="size-3.5" />
        )}
      </button>
    </div>
  )
}
