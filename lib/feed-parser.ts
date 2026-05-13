import { XMLParser } from 'fast-xml-parser'

export type NormalizedFeedItem = {
  url: string
  title: string
  description: string | undefined
  content: string | undefined
  author: string | undefined
  publishedAt: Date | undefined
  guid: string
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  trimValues: true,
  cdataPropName: '__cdata',
  processEntities: true,
  htmlEntities: true,
  isArray: (name) => ['item', 'entry', 'link'].includes(name),
})

function extractText(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined
  if (typeof val === 'string') return val || undefined
  if (typeof val === 'object' && val !== null && '__cdata' in val) {
    const cdata = (val as Record<string, unknown>).__cdata
    return typeof cdata === 'string' ? cdata || undefined : undefined
  }
  return undefined
}

function normalizeDate(dateStr: unknown): Date | undefined {
  if (!dateStr || typeof dateStr !== 'string') return undefined
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? undefined : d
}

function resolveGuid(raw: unknown, url: string | undefined, feedId: string, title: string | undefined): string {
  const rawStr = extractText(raw)
  return rawStr || url || `${feedId}:${title ?? ''}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRss2Items(parsed: any, feedId: string): NormalizedFeedItem[] {
  const items: unknown[] = parsed?.rss?.channel?.item ?? []
  return (items as Record<string, unknown>[]).map((item) => {
    const title = extractText(item.title) ?? '(no title)'
    const url = extractText(item.link) ?? ''
    return {
      url,
      title,
      description: extractText(item.description),
      content: extractText(item['content:encoded']),
      author: extractText(item.author) ?? extractText(item['dc:creator']),
      publishedAt: normalizeDate(extractText(item.pubDate)),
      guid: resolveGuid(item.guid, url, feedId, title),
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAtomItems(parsed: any, feedId: string): NormalizedFeedItem[] {
  const entries: unknown[] = parsed?.feed?.entry ?? []
  return (entries as Record<string, unknown>[]).map((entry) => {
    const title = extractText(entry.title) ?? '(no title)'
    const links: Record<string, unknown>[] = Array.isArray(entry.link) ? (entry.link as Record<string, unknown>[]) : []
    const altLink = links.find((l) => l['@_rel'] === 'alternate') ?? links.find((l) => l['@_href'])
    const url = (altLink?.['@_href'] as string | undefined) ?? ''
    const author = (entry.author as Record<string, unknown> | undefined)?.name
    return {
      url,
      title,
      description: extractText(entry.summary),
      content: extractText(entry.content),
      author: extractText(author),
      publishedAt: normalizeDate(extractText(entry.updated) ?? extractText(entry.published)),
      guid: resolveGuid(entry.id, url, feedId, title),
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRdfItems(parsed: any, feedId: string): NormalizedFeedItem[] {
  const rdf = parsed['rdf:RDF'] ?? parsed['RDF']
  const items: unknown[] = rdf?.item ?? []
  return (items as Record<string, unknown>[]).map((item) => {
    const title = extractText(item.title) ?? '(no title)'
    const url = extractText(item.link) ?? ''
    return {
      url,
      title,
      description: extractText(item.description),
      content: extractText(item['content:encoded']),
      author: extractText(item['dc:creator']),
      publishedAt: normalizeDate(extractText(item['dc:date'])),
      guid: resolveGuid(item['@_rdf:about'], url, feedId, title),
    }
  })
}

export function parseFeed(xml: string, feedId: string): NormalizedFeedItem[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed: any = parser.parse(xml)

  if (parsed?.rss) return extractRss2Items(parsed, feedId)
  if (parsed?.feed) return extractAtomItems(parsed, feedId)
  if (parsed?.['rdf:RDF'] || parsed?.['RDF']) return extractRdfItems(parsed, feedId)

  throw new Error('Unrecognised feed format')
}
