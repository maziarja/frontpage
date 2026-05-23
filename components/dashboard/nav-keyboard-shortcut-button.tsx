'use client'

import { KeyboardIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KeyboardShortcutOverlay } from '@/components/dashboard/keyboard-shortcut-overlay'
import { useShortcutOverlay } from '@/components/dashboard/shortcut-overlay-context'

export function NavKeyboardShortcutButton() {
  const { open, setOpen } = useShortcutOverlay()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
        onClick={() => setOpen(true)}
        className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
      >
        <KeyboardIcon size={18} />
      </Button>
      <KeyboardShortcutOverlay open={open} onOpenChange={setOpen} />
    </>
  )
}
