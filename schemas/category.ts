import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
})

export const renameCategorySchema = z.object({
  categoryId: z.string().trim().min(1),
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
})

export type CreateCategoryValues = z.infer<typeof createCategorySchema>
export type RenameCategoryValues = z.infer<typeof renameCategorySchema>
