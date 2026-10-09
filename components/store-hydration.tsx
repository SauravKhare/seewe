'use client'

import { useEffect } from 'react'

import { useAppStore } from '@/lib/data/store'

/**
 * Rehydrates the persisted store on the client, then marks the store ready.
 * SSR renders skeletons (see `StoreGate`), so persisted data never races a
 * component's initial state.
 */
export function StoreHydration() {
  useEffect(() => {
    const result = useAppStore.persist.rehydrate()
    void Promise.resolve(result).then(() => {
      useAppStore.getState().setHydrated(true)
    })
  }, [])

  return null
}
