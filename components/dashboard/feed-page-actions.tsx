'use client'

import { useState, useTransition } from 'react'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import { EditFeedForm } from '@/components/dashboard/edit-feed-form'
import { deleteFeed } from '@/app/_actions/feed'

type Category = { id: string; name: string }
type Feed = {
  id: string
  title: string
  categoryId: string | null
  faviconUrl: string | null
  description: string | null
  url: string
}

type Props = {
  feed: Feed
  categories: Category[]
  children: React.ReactNode
  isGuest?: boolean
}

export function FeedPageActions({ feed, categories, children, isGuest = false }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFeed(feed.id)
      if (result?.error) {
        toast.error(result.error)
        setDeleteOpen(false)
      }
    })
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-start gap-3">
        <FeedFavicon src={feed.faviconUrl} size={32} className="mt-1 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight font-semibold">{feed.title}</h1>
              {feed.description && (
                <p className="text-muted-foreground mt-1 text-sm">{feed.description}</p>
              )}
              <p className="text-muted-foreground mt-1 truncate text-xs">{feed.url}</p>
            </div>

            {/* Action buttons */}
            {!isGuest && (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="group"
                  onClick={() => {
                    setEditOpen((v) => !v)
                    setDeleteOpen(false)
                  }}
                  aria-expanded={editOpen}
                  aria-label="Edit feed"
                >
                  <PencilIcon size={15} aria-hidden="true" />
                  <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-200 ease-in-out group-hover:grid-cols-[1fr]">
                    <span className="overflow-hidden pl-1 whitespace-nowrap">Edit</span>
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group text-destructive hover:text-destructive"
                  onClick={() => {
                    setDeleteOpen((v) => !v)
                    setEditOpen(false)
                  }}
                  aria-expanded={deleteOpen}
                  aria-label="Delete feed"
                  disabled={pending}
                >
                  <Trash2Icon size={15} aria-hidden="true" />
                  <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-200 ease-in-out group-hover:grid-cols-[1fr]">
                    <span className="overflow-hidden pl-1 whitespace-nowrap">Delete</span>
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats and rest of page content */}
      {children}

      {/* Edit panel */}
      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{ gridTemplateRows: editOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pt-4">
            <EditFeedForm
              feed={feed}
              categories={categories}
              onSuccess={() => setTimeout(() => setEditOpen(false), 1000)}
            />
          </div>
        </div>
      </div>

      {/* Delete panel */}
      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{ gridTemplateRows: deleteOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 pt-4">
            <span className="text-muted-foreground text-sm">
              Permanently deletes this feed and all its articles.
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={pending || !deleteOpen}
            >
              {pending ? 'Deleting…' : 'Yes, delete'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(false)}
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
