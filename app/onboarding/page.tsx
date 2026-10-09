import type { Metadata } from 'next'

import { OnboardingBuilder } from '@/components/onboarding/onboarding-builder'
import { StoreGate } from '@/components/store-gate'

export const metadata: Metadata = {
  title: 'Build your master resume — seewe',
}

export default function OnboardingPage() {
  return (
    <StoreGate>
      <OnboardingBuilder />
    </StoreGate>
  )
}
