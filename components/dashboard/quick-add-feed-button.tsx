'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, CheckIcon, LoaderIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { addFeedSilent } from '@/app/_actions/feed'

export function QuickAddFeedButton({ url }: { url: string }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleAdd() {
    setState('loading')
    const result = await addFeedSilent(url)
    if ('error' in result) {
      if (result.error === 'You are already subscribed to this feed') {
        setState('done')
      } else {
        toast.error(result.error)
        setState('idle')
      }
    } else {
      setState('done')
      router.refresh()
    }
  }

  if (state === 'done') {
    return (
      <span className="text-muted-foreground flex items-center gap-1 text-xs">
        <CheckIcon size={14} className="text-green-500" aria-hidden />
        Added
      </span>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAdd}
      disabled={state === 'loading'}
      className="shrink-0 text-xs"
      aria-label={`Add ${url}`}
    >
      {state === 'loading' ? (
        <LoaderIcon size={12} className="animate-spin" aria-hidden />
      ) : (
        <PlusIcon size={12} aria-hidden />
      )}
      Add
    </Button>
  )
}
