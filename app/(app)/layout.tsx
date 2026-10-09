import { AppShell } from '@/components/app/app-shell'
import { StoreGate } from '@/components/store-gate'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell>
      <StoreGate>{children}</StoreGate>
    </AppShell>
  )
}
