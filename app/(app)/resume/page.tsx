import type { Metadata } from 'next'

import { MasterResume } from '@/components/resume/master-resume'

export const metadata: Metadata = {
  title: 'Master resume — seewe',
}

export default function ResumePage() {
  return <MasterResume />
}
