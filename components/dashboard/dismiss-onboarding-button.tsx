'use client'

import { useState } from 'react'
import { XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { dismissOnboarding } from '@/app/_actions/onboarding'

export function DismissOnboardingButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleDismiss() {
    setPending(true)
    await dismissOnboarding()
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDismiss}
      disabled={pending}
      className="text-muted-foreground shrink-0 text-xs"
    >
      <XIcon size={13} aria-hidden />
      Dismiss
    </Button>
  )
}
