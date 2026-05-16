'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { createCategorySchema, renameCategorySchema } from '@/schemas/category'

export async function createCategory(name: string): Promise<{ error: string } | { success: true }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const parsed = createCategorySchema.safeParse({ name })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid name' }

  const maxOrder = await db.category.findFirst({
    where: { userId: session.user.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  await db.category.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      order: (maxOrder?.order ?? -1) + 1,
    },
  })

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function renameCategory(
  categoryId: string,
  name: string,
): Promise<{ error: string } | { success: true }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const parsed = renameCategorySchema.safeParse({ categoryId, name })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const category = await db.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
  })
  if (!category) return { error: 'Category not found' }

  await db.category.update({
    where: { id: categoryId },
    data: { name: parsed.data.name },
  })

  revalidatePath('/dashboard', 'layout')
  revalidatePath(`/dashboard/category/${categoryId}`)
  return { success: true }
}

export async function deleteCategory(categoryId: string): Promise<{ error: string } | void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const category = await db.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
  })
  if (!category) return { error: 'Category not found' }

  // onDelete: SetNull on Feed.categoryId handles reassigning feeds to Uncategorized
  await db.category.delete({ where: { id: categoryId } })

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<{ error: string } | { success: true }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  await db.$transaction(
    orderedIds.map((id, index) =>
      db.category.update({
        where: { id, userId: session.user.id },
        data: { order: index },
      }),
    ),
  )

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
