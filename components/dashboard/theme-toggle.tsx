'use client'

import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateTheme } from '@/app/_actions/preferences'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  function toggle() {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    updateTheme(next === 'dark' ? 'DARK' : 'LIGHT')
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      <SunIcon size={20} className="dark:hidden" />
      <MoonIcon size={20} className="hidden dark:block" />
    </Button>
  )
}
