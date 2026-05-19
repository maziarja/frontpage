'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ZapIcon, LoaderIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { quickStart } from '@/app/_actions/quick-start'
import { dismissOnboarding } from '@/app/_actions/onboarding'

type Props = {
  categoryName: string
  feedCount: number
}

export function QuickStartButton({ categoryName, feedCount }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleQuickStart() {
    setPending(true)
    const result = await quickStart(categoryName)
    if ('error' in result) {
      toast.error(result.error)
    } else if (result.added > 0) {
      toast.success(`Added ${result.added} feed${result.added !== 1 ? 's' : ''} to ${categoryName}`)
      await dismissOnboarding()
      router.refresh()
    } else {
      toast.info(`Already subscribed to all ${categoryName} feeds`)
      await dismissOnboarding()
      router.refresh()
    }
    setPending(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleQuickStart}
      disabled={pending}
      className="text-xs"
    >
      {pending ? (
        <LoaderIcon size={12} className="animate-spin" aria-hidden />
      ) : (
        <ZapIcon size={12} aria-hidden />
      )}
      Quick start · {feedCount}
    </Button>
  )
}
