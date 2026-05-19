import dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: true })
dotenv.config({ path: '.env' })

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, FeedHealthStatus } from '../lib/generated/prisma/client'
import { parseFeedMeta, parseFeed } from '../lib/feed-parser'
import sampleFeeds from '../data/sample-feeds.json'

const DEMO_EMAIL = 'demo@frontpage.internal'

function getFaviconUrl(feedUrl: string): string {
  const { hostname } = new URL(feedUrl)
  return `/api/favicon?domain=${encodeURIComponent(hostname)}`
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const db = new PrismaClient({ adapter })

  console.log('Seeding demo account…\n')

  const user = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      id: 'demo-user',
      name: 'Demo',
      email: DEMO_EMAIL,
      emailVerified: false,
    },
  })

  console.log(`Demo user: ${user.id}`)

  // Wipe existing demo data so seed is idempotent
  await db.category.deleteMany({ where: { userId: user.id } })
  await db.feed.deleteMany({ where: { userId: user.id } })

  let totalFeeds = 0
  let totalItems = 0

  for (let catIndex = 0; catIndex < sampleFeeds.categories.length; catIndex++) {
    const cat = sampleFeeds.categories[catIndex]
    console.log(`\n[${cat.name}]`)

    const category = await db.category.create({
      data: { userId: user.id, name: cat.name, order: catIndex },
    })

    for (const feedData of cat.feeds) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 10_000)

      try {
        const response = await fetch(feedData.feedUrl, {
          signal: controller.signal,
          redirect: 'follow',
        })

        if (!response.ok) {
          console.warn(`  ✗ ${feedData.title}: HTTP ${response.status}`)
          continue
        }

        const xml = await response.text()

        let meta
        try {
          meta = parseFeedMeta(xml)
        } catch {
          console.warn(`  ✗ ${feedData.title}: failed to parse feed`)
          continue
        }

        const feed = await db.feed.create({
          data: {
            userId: user.id,
            categoryId: category.id,
            url: feedData.feedUrl,
            title: meta.title || feedData.title,
            description: meta.description || feedData.description,
            faviconUrl: getFaviconUrl(feedData.feedUrl),
            healthStatus: FeedHealthStatus.ACTIVE,
            lastFetchedAt: new Date(),
            lastSuccessfulFetchAt: new Date(),
          },
        })

        let itemCount = 0
        try {
          const items = parseFeed(xml, feed.id)
          if (items.length > 0) {
            const result = await db.feedItem.createMany({
              data: items.map((item) => ({ ...item, feedId: feed.id })),
              skipDuplicates: true,
            })
            itemCount = result.count
            totalItems += itemCount
          }
        } catch {
          // Items failed to parse — feed still usable
        }

        totalFeeds++
        console.log(`  ✓ ${feedData.title} (${itemCount} items)`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown error'
        console.warn(`  ✗ ${feedData.title}: ${msg}`)
      } finally {
        clearTimeout(timer)
      }
    }
  }

  console.log(`\nDone! Seeded ${totalFeeds} feeds and ${totalItems} items for demo user.`)
  await db.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
