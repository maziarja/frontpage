import sanitizeHtml from 'sanitize-html'

export type FeedItemRow = {
  id: string
  url: string
  title: string
  description: string | null
  sanitizedDescription: string | null
  content: string | null
  author: string | null
  publishedAt: Date | null
  createdAt: Date
  isRead: boolean
  isBookmarked: boolean
  summary: string | null
  tags: string[]
  feed: { id: string; title: string; faviconUrl: string | null }
}

type FeedItemWithReadCount = {
  id: string
  url: string
  title: string
  description: string | null
  content: string | null
  author: string | null
  publishedAt: Date | null
  createdAt: Date
  summary: string | null
  tags: string[]
  feed: { id: string; title: string; faviconUrl: string | null }
  _count: { readStates: number; bookmarks: number }
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i',
    'blockquote', 'code', 'pre', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
  },
}

function stripHtml(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim()
}

export function mapFeedItem(item: FeedItemWithReadCount): FeedItemRow {
  return {
    id: item.id,
    url: item.url,
    title: item.title,
    description: item.description ? stripHtml(item.description) : null,
    sanitizedDescription: item.description ? sanitizeHtml(item.description, SANITIZE_OPTIONS) : null,
    content: item.content ? sanitizeHtml(item.content, SANITIZE_OPTIONS) : null,
    author: item.author,
    publishedAt: item.publishedAt,
    createdAt: item.createdAt,
    isRead: item._count.readStates > 0,
    isBookmarked: item._count.bookmarks > 0,
    summary: item.summary,
    tags: item.tags,
    feed: item.feed,
  }
}
