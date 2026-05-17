'use client'

import { Layout } from '@/lib/generated/prisma/enums'
import type { FeedItemRow } from '@/lib/feed-items'
import { FeedItemCardCompact } from '@/components/dashboard/feed-item-card-compact'
import { FeedItemCardStandard } from '@/components/dashboard/feed-item-card-standard'
import { FeedItemCardCard } from '@/components/dashboard/feed-item-card-card'

type Props = {
  item: FeedItemRow
  layout?: Layout
  showSource?: boolean
  onMarkRead?: (id: string) => void
  onMarkUnread?: (id: string) => void
  onOpenReader?: (id: string) => void
}

export function FeedItemCard({ layout = Layout.STANDARD, ...props }: Props) {
  if (layout === Layout.COMPACT) return <FeedItemCardCompact {...props} />
  if (layout === Layout.CARD) return <FeedItemCardCard {...props} />
  return <FeedItemCardStandard {...props} />
}
