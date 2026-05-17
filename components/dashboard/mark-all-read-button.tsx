'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUnreadCounts } from '@/components/dashboard/unread-count-context'
import { markAllRead } from '@/app/_actions/read-state'

export function MarkAllReadButton() {
  const router = useRouter()
  const { resetAll } = useUnreadCounts()
  const [pending, startTransition] = useTransition()

  function handleClick() {
    resetAll()
    startTransition(async () => {
      await markAllRead()
      router.refresh()
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Mark all as read"
      onClick={handleClick}
      disabled={pending}
      title="Mark all as read"
      className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
    >
      <CheckCheckIcon size={18} />
    </Button>
  )
}
