import { Suspense } from 'react'
import type { Metadata } from 'next'

import { JobsList } from '@/components/jobs/jobs-list'

export const metadata: Metadata = {
  title: 'Jobs — seewe',
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsList />
    </Suspense>
  )
}
