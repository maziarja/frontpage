'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { addFeedSilent } from '@/app/_actions/feed'
import sampleFeeds from '@/data/sample-feeds.json'

export async function quickStart(
  categoryName: string,
): Promise<{ added: number; errors: number } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const category = sampleFeeds.categories.find((c) => c.name === categoryName)
  if (!category) return { error: 'Category not found' }

  const maxOrder = await db.category.aggregate({
    where: { userId: session.user.id },
    _max: { order: true },
  })

  const existingCat = await db.category.findFirst({
    where: { userId: session.user.id, name: categoryName },
    select: { id: true },
  })

  const cat =
    existingCat ??
    (await db.category.create({
      data: {
        userId: session.user.id,
        name: categoryName,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    }))

  const results = await Promise.allSettled(
    category.feeds.map((feed) => addFeedSilent(feed.feedUrl, cat.id)),
  )

  let added = 0
  let errors = 0
  for (const result of results) {
    if (result.status === 'rejected') {
      errors++
    } else if ('success' in result.value) {
      added++
    } else if (result.value.error !== 'You are already subscribed to this feed') {
      errors++
    }
  }

  revalidatePath('/dashboard')
  return { added, errors }
}
