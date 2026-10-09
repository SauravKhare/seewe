/**
 * Phase 1 local auth. One account lives in localStorage behind a session
 * cookie. Phase 2 replaces this with better-auth; the cookie name and these
 * helpers are the only surface the UI and proxy touch.
 */

export const AUTH_COOKIE = 'seewe_session'
export const AUTH_COOKIE_VALUE = 'signed-in'

const ACCOUNT_KEY = 'seewe_account'

interface LocalAccount {
  email: string
  password: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function readAccount(): LocalAccount | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LocalAccount>
    if (typeof parsed.email !== 'string' || typeof parsed.password !== 'string')
      return null
    return { email: parsed.email, password: parsed.password }
  } catch {
    return null
  }
}

export function isAuthenticated(value?: string | null): boolean {
  return value === AUTH_COOKIE_VALUE
}

/** Creates the single local account. Returns false if one already exists. */
export function createAccount(email: string, password: string): boolean {
  if (typeof window === 'undefined') return false
  if (readAccount()) return false
  window.localStorage.setItem(
    ACCOUNT_KEY,
    JSON.stringify({ email: normalizeEmail(email), password }),
  )
  return true
}

export function validateCredentials(email: string, password: string): boolean {
  const account = readAccount()
  if (!account) return false
  return (
    account.email === normalizeEmail(email) && account.password === password
  )
}

export function clearAccount(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCOUNT_KEY)
}

export function setAuthCookie(): void {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 30
  document.cookie = `${AUTH_COOKIE}=${AUTH_COOKIE_VALUE}; path=/; max-age=${maxAge}; samesite=lax`
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`
}
