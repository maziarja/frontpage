import { z } from 'zod'

export const feedFetchQuerySchema = z.object({
  feedId: z.string().trim().min(1, 'feedId is required'),
})

export const addFeedSchema = z.object({
  url: z.url('Enter a valid URL'),
  categoryId: z.string().trim().min(1).nullable().optional(),
})

export const editFeedSchema = z.object({
  feedId: z.string().trim().min(1),
  title: z.string().trim().min(1, 'Title is required'),
  categoryId: z.string().trim().min(1).nullable().optional(),
})

export type FeedFetchQuery = z.infer<typeof feedFetchQuerySchema>
export type AddFeedValues = z.infer<typeof addFeedSchema>
export type EditFeedValues = z.infer<typeof editFeedSchema>
