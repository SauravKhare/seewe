/**
 * Phase 1 fake auth. A single demo credential gates the app behind a cookie.
 * Phase 2 replaces this with better-auth; the cookie name and helpers are the
 * only surface the UI and middleware touch.
 */

export const AUTH_COOKIE = 'seewe_session'
export const AUTH_COOKIE_VALUE = 'demo'

export const DEMO_EMAIL = 'demo@seewe.app'
export const DEMO_PASSWORD = 'demo1234'

export function isAuthenticated(value?: string | null): boolean {
  return value === AUTH_COOKIE_VALUE
}

export function validateCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
  )
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
