import { notFound } from 'next/navigation'
import { NewspaperIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { requireDashboardSession } from '@/lib/dashboard-session'
import { getDigestData } from '@/app/_queries/digest'
import { DigestCategorySection } from '@/components/dashboard/digest-category-section'

export default async function DigestPage() {
  const { userId, isGuest } = await requireDashboardSession()
  if (!userId) notFound()

  const { since, groups, totalCount } = await getDigestData(userId, isGuest)

  if (totalCount === 0) {
    return (
      <div className="mx-auto max-w-[60rem] px-4 py-4">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <NewspaperIcon size={40} className="text-muted-foreground mb-4" aria-hidden />
          <h1 className="mb-2 text-2xl font-semibold">You&apos;re all caught up</h1>
          <p className="text-muted-foreground text-sm">
            No new articles {formatDistanceToNow(since, { addSuffix: true })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">What did I miss?</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {totalCount} new article{totalCount !== 1 ? 's' : ''} since{' '}
          {formatDistanceToNow(since, { addSuffix: true })}
        </p>
      </div>

      {groups.map((group) => (
        <DigestCategorySection
          key={group.categoryId ?? '__uncategorized__'}
          categoryId={group.categoryId}
          categoryName={group.categoryName}
          initialItems={group.items}
        />
      ))}
    </div>
  )
}
