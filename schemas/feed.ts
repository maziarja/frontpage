import { z } from 'zod'

export const feedFetchQuerySchema = z.object({
  feedId: z.string().trim().min(1, 'feedId is required'),
})

export type FeedFetchQuery = z.infer<typeof feedFetchQuerySchema>
