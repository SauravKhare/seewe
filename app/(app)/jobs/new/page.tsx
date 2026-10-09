import type { Metadata } from 'next'

import { NewJobWizard } from '@/components/jobs/new-job-wizard'

export const metadata: Metadata = {
  title: 'New job — seewe',
}

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>
}) {
  const { job } = await searchParams
  return <NewJobWizard jobId={job} />
}
