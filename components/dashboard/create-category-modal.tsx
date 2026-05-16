'use client'

import { useTransition, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory } from '@/app/_actions/category'
import { createCategorySchema, type CreateCategoryValues } from '@/schemas/category'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCategoryModal({ open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryValues>({
    resolver: zodResolver(createCategorySchema),
  })

  useEffect(() => {
    if (!open) {
      reset()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setServerError(null)
    }
  }, [open, reset])

  function onSubmit(values: CreateCategoryValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await createCategory(values.name)
      if ('error' in result) {
        setServerError(result.error)
        toast.error(result.error)
      } else {
        toast.success('Category created')
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              placeholder="e.g. Technology"
              autoFocus
              {...register('name')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'category-name-error' : undefined}
            />
            {errors.name && (
              <p id="category-name-error" className="text-destructive text-sm">
                {errors.name.message}
              </p>
            )}
            {serverError && (
              <p className="text-destructive text-sm" role="alert">
                {serverError}
              </p>
            )}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create category'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
