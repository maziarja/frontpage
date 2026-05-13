'use client'

import { useState, useTransition } from 'react'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteFeed } from '@/app/_actions/feed'

export function DeleteFeedButton({ feedId }: { feedId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFeed(feedId)
      if (result?.error) {
        toast.error(result.error)
        setConfirming(false)
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirming(true)}
          disabled={confirming}
        >
          <Trash2Icon size={14} aria-hidden="true" />
          Delete feed
        </Button>
      </div>

      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{ gridTemplateRows: confirming ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 pt-1">
            <span className="text-destructive text-sm">
              Deletes all articles too. Are you sure?
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={pending || !confirming}
            >
              {pending ? 'Deleting…' : 'Yes, delete'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
