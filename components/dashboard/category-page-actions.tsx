'use client'

import { useState, useTransition } from 'react'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RenameCategoryForm } from '@/components/dashboard/rename-category-form'
import { deleteCategory } from '@/app/_actions/category'

type Props = {
  category: { id: string; name: string }
  isGuest?: boolean
}

export function CategoryPageActions({ category, isGuest = false }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result?.error) {
        toast.error(result.error)
        setDeleteOpen(false)
      }
    })
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl leading-tight font-semibold">{category.name}</h1>
        {!isGuest && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="group"
              onClick={() => { setEditOpen((v) => !v); setDeleteOpen(false) }}
              aria-expanded={editOpen}
              aria-label="Rename category"
            >
              <PencilIcon size={15} aria-hidden="true" />
              <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-200 ease-in-out group-hover:grid-cols-[1fr]">
                <span className="overflow-hidden pl-1 whitespace-nowrap">Rename</span>
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="group text-destructive hover:text-destructive"
              onClick={() => { setDeleteOpen((v) => !v); setEditOpen(false) }}
              aria-expanded={deleteOpen}
              aria-label="Delete category"
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

      {/* Rename panel */}
      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{ gridTemplateRows: editOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pt-4">
            <RenameCategoryForm
              category={category}
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
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="text-muted-foreground text-sm">
              Deletes this category. Feeds will move to Uncategorized.
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={pending || !deleteOpen}
            >
              {pending ? 'Deleting…' : 'Yes, delete'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
