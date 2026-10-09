import { SALARY_PERIOD_LABELS } from '@/lib/constants'
import type { ApplicationStatus, SalaryPeriod } from '@/lib/types'

const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
})

const DAY_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const DATETIME_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/** Accepts `YYYY-MM` or `YYYY-MM-DD` and returns a short label. */
export function formatMonth(value?: string): string {
  if (!value) return ''
  const date = new Date(value.length === 7 ? `${value}-01` : value)
  if (Number.isNaN(date.getTime())) return value
  return MONTH_FORMAT.format(date)
}

export function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return DAY_FORMAT.format(date)
}

export function formatDateTime(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return DATETIME_FORMAT.format(date)
}

/** Human relative time for autosave indicators. */
export function formatRelativeTime(
  timestamp?: number,
  now = Date.now(),
): string {
  if (!timestamp) return ''
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000))
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function formatDateRange(
  start?: string,
  end?: string,
  current?: boolean,
): string {
  const from = formatMonth(start)
  const to = current ? 'Present' : formatMonth(end)
  if (from && to) return `${from} – ${to}`
  return from || to
}

export function formatSalary(
  min?: number,
  max?: number,
  currency = 'USD',
  period?: SalaryPeriod,
): string {
  if (min == null && max == null) return ''
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: 'compact',
  })
  const range =
    min != null && max != null
      ? `${formatter.format(min)} – ${formatter.format(max)}`
      : formatter.format((min ?? max) as number)
  return period ? `${range} ${SALARY_PERIOD_LABELS[period]}` : range
}

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i
const BLOCKED_SCHEME = /^(javascript|data|vbscript|file):/i

/**
 * Normalises a user-entered job URL: adds `https://` only when no scheme is
 * present, and rejects non-http(s) schemes. Returns undefined for empty input.
 */
export function normalizeJobUrl(value?: string): string | undefined {
  const raw = value?.trim()
  if (!raw) return undefined
  if (BLOCKED_SCHEME.test(raw)) return undefined
  if (HAS_SCHEME.test(raw)) return raw
  return `https://${raw}`
}

/** Returns a normalized URL only if it resolves to http/https. */
export function safeJobHref(value?: string): string | undefined {
  const url = normalizeJobUrl(value)
  if (!url) return undefined
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:' ? url : undefined
  } catch {
    return undefined
  }
}

/**
 * A `saved` application has not been submitted yet, so its stored date is a
 * default rather than a real application date. Never present it as one.
 */
export function effectiveAppliedDate(job: {
  status: ApplicationStatus
  appliedDate?: string
}): string | undefined {
  return job.status === 'saved' ? undefined : job.appliedDate
}
