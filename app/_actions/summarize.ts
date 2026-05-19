'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import sanitizeHtml from 'sanitize-html'
import { startOfDay } from 'date-fns'
import { SUMMARY_DAILY_LIMIT } from '@/lib/const'

function stripHtml(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim()
}

export async function generateSummary(
  feedItemId: string,
): Promise<{ summary: string; tags: string[] } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const userId = session.user.id

  const item = await db.feedItem.findUnique({
    where: { id: feedItemId },
    select: {
      summary: true,
      tags: true,
      title: true,
      content: true,
      description: true,
      feed: { select: { userId: true } },
    },
  })

  if (!item || item.feed.userId !== userId) return { error: 'Not found' }

  if (item.summary) return { summary: item.summary, tags: item.tags }

  const pref = await db.userPreference.findUnique({
    where: { userId },
    select: { summaryRequestsToday: true, summaryLastResetAt: true },
  })

  const todayStart = startOfDay(new Date())
  const needsReset = !pref?.summaryLastResetAt || pref.summaryLastResetAt < todayStart
  const currentCount = needsReset ? 0 : (pref?.summaryRequestsToday ?? 0)

  if (currentCount >= SUMMARY_DAILY_LIMIT) return { error: 'rate_limit' }

  await db.userPreference.upsert({
    where: { userId },
    update: {
      summaryRequestsToday: currentCount + 1,
      summaryLastResetAt: needsReset ? new Date() : undefined,
    },
    create: { userId, summaryRequestsToday: 1, summaryLastResetAt: new Date() },
  })

  const rawText = item.content ? stripHtml(item.content) : (item.description ?? item.title)
  const articleText = rawText.slice(0, 3000)

  if (!process.env.GROQ_API_KEY) {
    console.error('[summarize] GROQ_API_KEY is not set')
    return { error: 'unavailable' }
  }

  try {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: `Summarize this article in 2-3 sentences. Be factual and direct — do not start with "This article". Then return 2-3 short lowercase topic tags.

Respond with ONLY valid JSON — no markdown, no explanation. Format:
{"summary": "...", "tags": ["tag1", "tag2"]}

Title: ${item.title}

Content: ${articleText}`,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { error: 'unavailable' }
    const parsed = JSON.parse(jsonMatch[0])
    const summary = String(parsed.summary ?? '').trim()
    const tags: string[] = Array.isArray(parsed.tags)
      ? parsed.tags.slice(0, 3).map(String)
      : []

    if (!summary) return { error: 'unavailable' }

    await db.feedItem.update({
      where: { id: feedItemId },
      data: { summary, tags },
    })

    return { summary, tags }
  } catch (err) {
    console.error('[summarize] Groq call failed:', err)
    return { error: 'unavailable' }
  }
}
