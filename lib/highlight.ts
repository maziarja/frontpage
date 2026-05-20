export type Segment = { text: string; match: boolean }

export function highlightText(text: string, query: string): Segment[] {
  if (!query.trim() || !text) return [{ text, match: false }]

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))

  // split with a capturing group produces [non-match, match, non-match, match, ...]
  return parts
    .map((part, i) => ({ text: part, match: i % 2 === 1 }))
    .filter((s) => s.text.length > 0)
}
