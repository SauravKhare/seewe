import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'

import {
  buildResumeVisual,
  type VisualEntry,
  type VisualSection,
} from '@/lib/resume'
import type { TailoredResumeData } from '@/lib/types'

Font.register({
  family: 'EB Garamond',
  fonts: [
    { src: '/fonts/eb-garamond-regular.ttf', fontWeight: 400 },
    { src: '/fonts/eb-garamond-medium.ttf', fontWeight: 500 },
    { src: '/fonts/eb-garamond-semibold.ttf', fontWeight: 600 },
    { src: '/fonts/eb-garamond-bold.ttf', fontWeight: 700 },
    {
      src: '/fonts/eb-garamond-italic.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
  ],
})

const INK = '#1a1a1a'
const MUTED = '#4a4a4a'
const RULE = '#2b2b2b'

const styles = StyleSheet.create({
  page: {
    paddingVertical: 34,
    paddingHorizontal: 40,
    fontFamily: 'EB Garamond',
    fontSize: 10,
    color: INK,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontFamily: 'EB Garamond',
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: 0.2,
  },
  headline: {
    fontFamily: 'EB Garamond',
    fontWeight: 400,
    fontSize: 12,
    color: MUTED,
  },
  contact: {
    marginTop: 4,
    fontSize: 9,
    color: MUTED,
  },
  columns: {
    flexDirection: 'row',
    columnGap: 22,
    marginTop: 2,
  },
  colLeft: {
    flexGrow: 1.15,
    flexBasis: 0,
  },
  colRight: {
    flexGrow: 1,
    flexBasis: 0,
  },
  section: {
    marginBottom: 12,
  },
  heading: {
    fontFamily: 'EB Garamond',
    fontWeight: 700,
    fontSize: 10.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  rule: {
    borderBottomWidth: 0.8,
    borderBottomColor: RULE,
    marginBottom: 5,
  },
  entry: {
    marginBottom: 6,
  },
  entryHead: {
    fontWeight: 700,
    fontSize: 10,
  },
  entryMeta: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 1,
  },
  body: {
    fontSize: 9.5,
    lineHeight: 1.35,
    marginTop: 1,
  },
  line: {
    fontSize: 9.5,
    lineHeight: 1.35,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 1.5,
  },
  bulletMarker: {
    width: 9,
    fontSize: 9.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.35,
  },
})

function Entry({ entry }: { entry: VisualEntry }) {
  return (
    <View style={styles.entry} wrap>
      {entry.head ? (
        <Text style={styles.entryHead}>
          {entry.head}
          {!entry.meta && entry.lines?.length ? ': ' : ''}
          {!entry.meta && entry.lines?.length ? entry.lines[0] : ''}
        </Text>
      ) : null}
      {entry.meta ? <Text style={styles.entryMeta}>{entry.meta}</Text> : null}
      {entry.head && entry.lines?.length
        ? entry.lines.slice(entry.meta ? 0 : 1).map((line, index) => (
            <Text key={index} style={styles.line}>
              {line}
            </Text>
          ))
        : null}
      {!entry.head && entry.lines
        ? entry.lines.map((line, index) => (
            <Text key={index} style={styles.line}>
              {line}
            </Text>
          ))
        : null}
      {entry.body ? <Text style={styles.body}>{entry.body}</Text> : null}
      {entry.bullets?.map((bullet, index) => (
        <View key={index} style={styles.bulletRow} wrap>
          <Text style={styles.bulletMarker}>•</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
    </View>
  )
}

function Section({ section }: { section: VisualSection }) {
  return (
    <View style={styles.section} wrap>
      <Text style={styles.heading}>{section.heading}</Text>
      <View style={styles.rule} />
      {section.entries.map((entry, index) => (
        <Entry key={index} entry={entry} />
      ))}
    </View>
  )
}

/** Two-column EB Garamond resume document shared by preview and download. */
export function AtsDocument({
  data,
  fileName,
}: {
  data: TailoredResumeData
  fileName?: string
}) {
  const doc = buildResumeVisual(data)

  return (
    <Document
      title={fileName?.replace(/\.pdf$/i, '')}
      author={doc.name || undefined}
      subject="Tailored resume"
      creator="seewe"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>
            {doc.name ? <Text style={styles.name}>{doc.name}</Text> : null}
            {doc.name && doc.headline ? '   ' : ''}
            {doc.headline ? (
              <Text style={styles.headline}>{doc.headline}</Text>
            ) : null}
          </Text>
          {doc.contact ? (
            <Text style={styles.contact}>{doc.contact}</Text>
          ) : null}
        </View>

        <View style={styles.columns}>
          <View style={styles.colLeft}>
            {doc.left.map((section) => (
              <Section key={section.key} section={section} />
            ))}
          </View>
          <View style={styles.colRight}>
            {doc.right.map((section) => (
              <Section key={section.key} section={section} />
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}

function safeFileName(name: string): string {
  const trimmed = name.trim() || 'resume.pdf'
  return /\.pdf$/i.test(trimmed) ? trimmed : `${trimmed}.pdf`
}

/**
 * Renders the document in the browser and hands it to the user as a file.
 * Phase 2 reuses `AtsDocument` with `renderToBuffer` on the server.
 */
export async function downloadResumePdf(
  data: TailoredResumeData,
  fileName: string,
): Promise<void> {
  const name = safeFileName(fileName)
  const blob = await pdf(<AtsDocument data={data} fileName={name} />).toBlob()
  const url = URL.createObjectURL(blob)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    anchor.rel = 'noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
  }
}
