import { SALARY_PERIOD_LABELS } from '@/lib/constants'
import type { SalaryPeriod } from '@/lib/types'

const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
})

const DAY_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
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
