'use client'

import { useState, useTransition } from 'react'
import { LogOutIcon, UploadIcon, DownloadIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/_actions/auth'
import { OpmlImportModal } from '@/components/dashboard/opml-import-modal'

type UserMenuProps = {
  user: { name: string; email: string } | null
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function UserMenu({ user }: UserMenuProps) {
  const [, startTransition] = useTransition()
  const [importOpen, setImportOpen] = useState(false)
  const displayName = user?.name ?? 'Guest'
  const initials = user ? getInitials(user.name) : 'G'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'w-full justify-start gap-3 px-2 font-normal'
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          >
            {initials}
          </span>
          <span className="truncate text-sm capitalize">{displayName}</span>
          <span className="sr-only">User menu</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <p className="font-medium capitalize text-foreground">{displayName}</p>
              {user?.email && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          {user && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setImportOpen(true)}
                className="cursor-pointer"
              >
                <UploadIcon className="mr-2 size-4" />
                Import OPML
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { window.location.href = '/api/opml/export' }}
                className="cursor-pointer"
              >
                <DownloadIcon className="mr-2 size-4" />
                Export OPML
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => startTransition(() => signOut())}
            className="cursor-pointer"
          >
            <LogOutIcon className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {user && <OpmlImportModal open={importOpen} onOpenChange={setImportOpen} />}
    </>
  )
}
