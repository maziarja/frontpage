'use client'

import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NavSearchButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Search"
      disabled
      title="Search — coming soon"
      className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
    >
      <SearchIcon size={18} />
    </Button>
  )
}
