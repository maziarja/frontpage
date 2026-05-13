'use client'

import { useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { editFeed } from '@/app/_actions/feed'
import { editFeedSchema, type EditFeedValues } from '@/schemas/feed'

type Category = { id: string; name: string }
type Feed = { id: string; title: string; categoryId: string | null }

export function EditFeedForm({ feed, categories }: { feed: Feed; categories: Category[] }) {
  const [pending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditFeedValues>({
    resolver: zodResolver(editFeedSchema),
    defaultValues: {
      feedId: feed.id,
      title: feed.title,
      categoryId: feed.categoryId ?? undefined,
    },
  })

  function onSubmit(values: EditFeedValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await editFeed(values)
      if ('error' in result) {
        setServerError(result.error)
        toast.error(result.error)
      } else {
        reset(values)
        toast.success('Feed updated')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register('feedId')} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feed-title">Title</Label>
        <Input
          id="feed-title"
          {...register('title')}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'feed-title-error' : undefined}
        />
        {errors.title && (
          <p id="feed-title-error" className="text-destructive text-sm">
            {errors.title.message}
          </p>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feed-category">Category</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(val) => field.onChange(val === '' ? undefined : val)}
              >
                <SelectTrigger id="feed-category">
                  <SelectValue placeholder="Uncategorized" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

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
