'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type ShortcutRow = { keys: string[]; label: string }
type Group = { heading: string; rows: ShortcutRow[] }

const GROUPS: Group[] = [
  {
    heading: 'Navigate',
    rows: [
      { keys: ['j'], label: 'Next item' },
      { keys: ['k'], label: 'Previous item' },
      { keys: ['o', '↵'], label: 'Open item' },
      { keys: ['l'], label: 'Load more items' },
    ],
  },
  {
    heading: 'Actions',
    rows: [
      { keys: ['m'], label: 'Toggle read / unread' },
      { keys: ['s'], label: 'Toggle bookmark' },
    ],
  },
  {
    heading: 'Go to',
    rows: [
      { keys: ['g', 'h'], label: 'All items' },
      { keys: ['g', 's'], label: 'Saved' },
      { keys: ['g', 'd'], label: 'Digest' },
    ],
  },
  {
    heading: 'Global',
    rows: [
      { keys: ['/'], label: 'Search' },
      { keys: ['⌘', 'k'], label: 'Search' },
      { keys: ['?'], label: 'Show shortcuts' },
      { keys: ['Esc'], label: 'Close / dismiss' },
    ],
  },
]

export function KeyboardShortcutOverlay({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">
                {group.heading}
              </p>
              <div className="space-y-1.5">
                {group.rows.map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground text-sm">{row.label}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      {row.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="bg-muted text-foreground inline-flex h-6 min-w-6 items-center justify-center rounded border px-1.5 font-mono text-xs"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
