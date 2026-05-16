'use client'

import { useState, useTransition, useEffect } from 'react'
import { GripVerticalIcon, FolderIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import { useUnreadCounts } from '@/components/dashboard/unread-count-context'
import { reorderCategories } from '@/app/_actions/category'

type SidebarFeed = {
  id: string
  title: string
  healthStatus: string
  faviconUrl: string | null
}

type SidebarCategory = {
  id: string
  name: string
  feeds: SidebarFeed[]
}

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="text-muted-foreground ml-auto shrink-0 text-xs">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function SortableCategoryItem({ category }: { category: SidebarCategory }) {
  const pathname = usePathname()
  const { counts } = useUnreadCounts()
  const categoryUnread = category.feeds.reduce((sum, f) => sum + (counts[f.id] ?? 0), 0)
  const [open, setOpen] = useState(true)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <SidebarMenuItem>
        <div className="group/cat flex items-center">
          <button
            {...listeners}
            {...attributes}
            aria-label="Drag to reorder"
            className="text-muted-foreground/40 hover:text-muted-foreground relative z-10 -mr-5 shrink-0 cursor-grab touch-none p-1 opacity-0 transition-opacity group-hover/cat:opacity-100 active:cursor-grabbing"
            tabIndex={-1}
          >
            <GripVerticalIcon size={12} />
          </button>
          <SidebarMenuButton
            render={<Link href={`/dashboard/category/${category.id}`} />}
            isActive={pathname === `/dashboard/category/${category.id}`}
            aria-current={pathname === `/dashboard/category/${category.id}` ? 'page' : undefined}
            className="flex-1"
          >
            <FolderIcon />
            <span className="flex-1 truncate">{category.name}</span>
            <UnreadBadge count={categoryUnread} />
          </SidebarMenuButton>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Collapse category' : 'Expand category'}
            className="text-muted-foreground hover:bg-muted shrink-0 rounded p-1 transition-colors"
          >
            <ChevronRightIcon
              size={14}
              className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {open && category.feeds.length > 0 && (
          <SidebarMenuSub>
            {category.feeds.map((feed) => (
              <SidebarMenuSubItem key={feed.id}>
                <SidebarMenuSubButton
                  render={<Link href={`/dashboard/feed/${feed.id}`} />}
                  isActive={pathname === `/dashboard/feed/${feed.id}`}
                  aria-current={pathname === `/dashboard/feed/${feed.id}` ? 'page' : undefined}
                >
                  <FeedFavicon src={feed.faviconUrl} />
                  <span className="flex-1 truncate">{feed.title}</span>
                  {feed.healthStatus === 'ERROR' ? (
                    <span
                      className="ml-auto h-2 w-2 shrink-0 rounded-full bg-red-500"
                      aria-label="Feed error"
                    />
                  ) : (
                    <UnreadBadge count={counts[feed.id] ?? 0} />
                  )}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </div>
  )
}

type Props = {
  initialCategories: SidebarCategory[]
}

export function SortableCategoryList({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [, startTransition] = useTransition()

  // Sync when the server sends new data (e.g. after create/delete)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategories(initialCategories)
  }, [initialCategories])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(categories, oldIndex, newIndex)

    setCategories(reordered)
    startTransition(async () => {
      await reorderCategories(reordered.map((c) => c.id))
    })
  }

  return (
    <DndContext
      id="sidebar-categories"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <SidebarMenu>
          {categories.map((category) => (
            <SortableCategoryItem key={category.id} category={category} />
          ))}
        </SidebarMenu>
      </SortableContext>
    </DndContext>
  )
}
