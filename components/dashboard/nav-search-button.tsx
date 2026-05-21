'use client'

import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchDialog } from '@/components/dashboard/search-dialog'
import { useSearch } from '@/components/dashboard/search-context'

export function NavSearchButton() {
  const { open, setOpen } = useSearch()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
      >
        <SearchIcon size={18} />
      </Button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
