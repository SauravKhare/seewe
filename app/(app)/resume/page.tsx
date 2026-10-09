import type { Metadata } from 'next'

import { MasterEditor } from '@/components/onboarding/onboarding-builder'

export const metadata: Metadata = {
  title: 'Master resume — seewe',
}

export default function ResumePage() {
  return <MasterEditor />
}
