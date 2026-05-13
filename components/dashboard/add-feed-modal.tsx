'use client'

import { useTransition, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addFeed } from '@/app/_actions/feed'
import { addFeedSchema, type AddFeedValues } from '@/schemas/feed'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFeedModal({ open, onOpenChange }: Props) {
  const [pending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddFeedValues>({
    resolver: zodResolver(addFeedSchema),
  })

  useEffect(() => {
    if (!open) {
      reset()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setServerError(null)
    }
  }, [open, reset])

  function onSubmit(values: AddFeedValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await addFeed(values.url)
      if (result?.error) {
        setServerError(result.error)
        toast.error(result.error)
      }
      // on success, addFeed redirects — modal unmounts automatically
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a feed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feed-url">Feed URL</Label>
            <Input
              id="feed-url"
              type="url"
              placeholder="https://example.com/feed.xml"
              autoFocus
              {...register('url')}
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? 'feed-url-error' : undefined}
            />
            {errors.url && (
              <p id="feed-url-error" className="text-destructive text-sm">
                {errors.url.message}
              </p>
            )}
            {serverError && (
              <p className="text-destructive text-sm" role="alert">
                {serverError}
              </p>
            )}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? 'Adding…' : 'Add feed'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
