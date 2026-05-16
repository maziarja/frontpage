'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function RetryButton({ feedId }: { feedId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleRetry() {
    setPending(true)
    try {
      const res = await fetch(`/api/feeds/fetch?feedId=${feedId}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Retry failed')
      } else {
        toast.success(
          data.cached ? 'Feed is up to date' : `Fetched ${data.newItemCount} new item(s)`,
        )
      }
    } catch {
      toast.error('Could not reach the server')
    } finally {
      setPending(false)
      router.refresh()
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRetry} disabled={pending}>
      <RefreshCwIcon size={14} className={pending ? 'animate-spin' : ''} aria-hidden="true" />
      {pending ? 'Retrying…' : 'Retry fetch'}
    </Button>
  )
}
