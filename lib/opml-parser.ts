import { XMLParser } from 'fast-xml-parser'

export type OpmlFeed = { title: string; xmlUrl: string }
export type OpmlCategory = { name: string; feeds: OpmlFeed[] }
export type ParsedOpml = { categories: OpmlCategory[]; uncategorized: OpmlFeed[] }

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  trimValues: true,
  processEntities: true,
  htmlEntities: true,
  isArray: (name) => name === 'outline',
})

function getXmlUrl(outline: Record<string, unknown>): string | undefined {
  // Handle both xmlUrl and xmlurl (case-insensitive attribute variant)
  const val = (outline['@_xmlUrl'] ?? outline['@_xmlurl']) as string | undefined
  return val && val.trim() ? val.trim() : undefined
}

function getLabel(outline: Record<string, unknown>, fallback: string): string {
  const title = outline['@_title'] as string | undefined
  const text = outline['@_text'] as string | undefined
  return (title ?? text ?? fallback).trim()
}

function collectFeeds(outlines: Record<string, unknown>[]): OpmlFeed[] {
  const feeds: OpmlFeed[] = []
  for (const outline of outlines) {
    const xmlUrl = getXmlUrl(outline)
    if (xmlUrl) {
      feeds.push({ title: getLabel(outline, xmlUrl), xmlUrl })
    }
    // Recurse into children regardless (flattens nested subcategories)
    const children = outline['outline'] as Record<string, unknown>[] | undefined
    if (children) feeds.push(...collectFeeds(children))
  }
  return feeds
}

function dedupe(feeds: OpmlFeed[]): OpmlFeed[] {
  const seen = new Set<string>()
  return feeds.filter((f) => {
    if (seen.has(f.xmlUrl)) return false
    seen.add(f.xmlUrl)
    return true
  })
}

export function parseOpml(content: string): ParsedOpml {
  const parsed = parser.parse(content) as Record<string, unknown>
  const body = (parsed['opml'] as Record<string, unknown> | undefined)?.['body'] as
    | Record<string, unknown>
    | undefined

  if (!body) return { categories: [], uncategorized: [] }

  const topOutlines = (body['outline'] as Record<string, unknown>[] | undefined) ?? []

  const categories: OpmlCategory[] = []
  const uncategorized: OpmlFeed[] = []
  const seenUrls = new Set<string>()

  for (const outline of topOutlines) {
    const xmlUrl = getXmlUrl(outline)
    const children = outline['outline'] as Record<string, unknown>[] | undefined

    if (children && children.length > 0) {
      // This is a category outline
      const name = getLabel(outline, 'Uncategorized')
      const feeds = dedupe(collectFeeds(children)).filter((f) => {
        if (seenUrls.has(f.xmlUrl)) return false
        seenUrls.add(f.xmlUrl)
        return true
      })
      if (feeds.length > 0) categories.push({ name, feeds })
    } else if (xmlUrl) {
      // Top-level feed outline (uncategorized)
      if (!seenUrls.has(xmlUrl)) {
        seenUrls.add(xmlUrl)
        uncategorized.push({ title: getLabel(outline, xmlUrl), xmlUrl })
      }
    }
    // Outlines with no xmlUrl and no children are ignored
  }

  return { categories, uncategorized }
}
