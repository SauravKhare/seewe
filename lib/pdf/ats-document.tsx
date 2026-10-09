import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'

import { buildResumeDocument } from '@/lib/resume'
import type { TailoredResumeData } from '@/lib/types'

const styles = StyleSheet.create({
  page: {
    paddingVertical: 46,
    paddingHorizontal: 52,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#171717',
  },
  contact: {
    marginBottom: 3,
  },
  contactName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  contactLine: {
    fontSize: 9,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#404040',
    marginTop: 3,
    marginBottom: 4,
  },
  section: {
    marginTop: 11,
  },
  heading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    letterSpacing: 1.2,
    marginBottom: 4,
    color: '#0a0a0a',
  },
  entry: {
    marginBottom: 5,
  },
  line: {
    lineHeight: 1.3,
  },
  bulletRow: {
    flexDirection: 'row',
  },
  bulletMarker: {
    width: 10,
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginBottom: 6,
    marginTop: 1,
  },
})

/** ATS-safe, single-column resume document shared by preview and download. */
export function AtsDocument({
  data,
  fileName,
}: {
  data: TailoredResumeData
  fileName?: string
}) {
  const doc = buildResumeDocument(data)

  return (
    <Document
      title={fileName?.replace(/\.pdf$/i, '')}
      author={doc.contact?.fullName}
      subject="Tailored resume"
      creator="seewe"
    >
      <Page size="LETTER" style={styles.page}>
        <View wrap>
          {doc.contact ? (
            <View style={styles.contact} wrap>
              {doc.contact.fullName ? (
                <Text style={styles.contactName}>
                  {doc.contact.fullName.toUpperCase()}
                </Text>
              ) : null}
              {doc.contact.line ? (
                <Text style={styles.contactLine}>{doc.contact.line}</Text>
              ) : null}
              <Text style={styles.divider} />
            </View>
          ) : null}

          {doc.sections.map((section) => (
            <View key={section.heading} wrap style={styles.section}>
              <Text style={styles.heading}>{section.heading}</Text>
              {section.entries.map((entry, index) => (
                <View key={index} wrap style={styles.entry}>
                  {entry.lines.map((line, lineIndex) => (
                    <Text key={lineIndex} style={styles.line}>
                      {line}
                    </Text>
                  ))}
                  {entry.bullets.map((bullet, bulletIndex) => (
                    <View key={bulletIndex} wrap style={styles.bulletRow}>
                      <Text style={styles.bulletMarker}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
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
