'use client'

import { useEffect } from 'react'

import { useAppStore } from '@/lib/data/store'

/**
 * Rehydrates the persisted store on the client. SSR renders the fixture seed,
 * then persisted edits take over after mount, avoiding hydration mismatches.
 */
export function StoreHydration() {
  useEffect(() => {
    void useAppStore.persist.rehydrate()
    useAppStore.getState().setHydrated(true)
  }, [])

  return null
}
