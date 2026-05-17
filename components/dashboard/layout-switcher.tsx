'use client'

import { AlignJustifyIcon, LayoutGridIcon, LayoutListIcon } from 'lucide-react'
import { Layout } from '@/lib/generated/prisma/enums'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLayout } from '@/components/dashboard/layout-context'

const LAYOUTS: { value: Layout; label: string; icon: React.ReactNode }[] = [
  { value: Layout.STANDARD, label: 'Standard', icon: <LayoutListIcon size={16} /> },
  { value: Layout.COMPACT, label: 'Compact', icon: <AlignJustifyIcon size={16} /> },
  { value: Layout.CARD, label: 'Card', icon: <LayoutGridIcon size={16} /> },
]

export function LayoutSwitcher() {
  const { layout, setLayout } = useLayout()
  const activeIcon = LAYOUTS.find((l) => l.value === layout)?.icon ?? <LayoutListIcon size={18} />

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Switch layout"
        title="Switch layout"
        className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors"
      >
        {activeIcon}
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="end">
        {LAYOUTS.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setLayout(value)}
            className={`flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm transition-colors ${
              layout === value
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
