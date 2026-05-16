'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { renameCategory } from '@/app/_actions/category'
import { renameCategorySchema, type RenameCategoryValues } from '@/schemas/category'

type Props = {
  category: { id: string; name: string }
  onSuccess?: () => void
}

export function RenameCategoryForm({ category, onSuccess }: Props) {
  const [pending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RenameCategoryValues>({
    resolver: zodResolver(renameCategorySchema),
    defaultValues: { categoryId: category.id, name: category.name },
  })

  function onSubmit(values: RenameCategoryValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await renameCategory(values.categoryId, values.name)
      if ('error' in result) {
        setServerError(result.error)
        toast.error(result.error)
      } else {
        reset(values)
        toast.success('Category renamed')
        onSuccess?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register('categoryId')} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          {...register('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'category-name-error' : undefined}
        />
        {errors.name && (
          <p id="category-name-error" className="text-destructive text-sm">
            {errors.name.message}
          </p>
        )}
      </div>
      {serverError && (
        <p className="text-destructive text-sm" role="alert">
          {serverError}
        </p>
      )}
      <Button type="submit" disabled={pending || !isDirty}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
