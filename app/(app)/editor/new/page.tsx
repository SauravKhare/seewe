import type { Metadata } from 'next'

import { EditorPage } from '@/components/editor/editor-page'

export const metadata: Metadata = {
  title: 'New resume — seewe',
}

export default function StandaloneEditorPage() {
  return <EditorPage />
}
