import type { Metadata } from 'next'

import { EditorPage } from '@/components/editor/editor-page'

export const metadata: Metadata = {
  title: 'Tailor resume — seewe',
}

export default async function TailorEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditorPage jobId={id} />
}
