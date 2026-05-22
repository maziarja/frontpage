'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddFeedModal } from '@/components/dashboard/add-feed-modal'
import { useGuest } from '@/components/dashboard/guest-context'

type Category = { id: string; name: string }

export function NavAddFeedButton({ categories }: { categories: Category[] }) {
  const isGuest = useGuest()
  const [open, setOpen] = useState(false)

  if (isGuest) return null

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <PlusIcon size={14} />
        Add Feed
      </Button>
      <AddFeedModal open={open} onOpenChange={setOpen} categories={categories} />
    </>
  )
}
