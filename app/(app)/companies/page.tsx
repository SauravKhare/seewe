import type { Metadata } from 'next'

import { CompaniesTable } from '@/components/companies/companies-table'

export const metadata: Metadata = {
  title: 'Companies — seewe',
}

export default function CompaniesPage() {
  return <CompaniesTable />
}
