import { AlertCircleIcon, CheckCircleIcon, ClockIcon } from 'lucide-react'
import { isAfter, subDays } from 'date-fns'
import { FeedHealthStatus } from '@/lib/generated/prisma/client'
import { Badge } from '@/components/ui/badge'

type Props = {
  status: FeedHealthStatus
  lastFetchedAt: Date | null
}

export function FeedHealthBadge({ status, lastFetchedAt }: Props) {
  const isStale =
    status === FeedHealthStatus.ACTIVE &&
    lastFetchedAt !== null &&
    isAfter(subDays(new Date(), 30), lastFetchedAt)

  const effectiveStatus = isStale ? 'STALE' : status

  const config = {
    ACTIVE: {
      icon: CheckCircleIcon,
      label: 'Active',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    STALE: {
      icon: ClockIcon,
      label: 'Stale',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    ERROR: {
      icon: AlertCircleIcon,
      label: 'Error',
      className: '',
    },
  }[effectiveStatus]

  const Icon = config.icon

  return (
    <Badge
      variant={effectiveStatus === 'ERROR' ? 'destructive' : 'outline'}
      className={config.className}
      aria-label={`Feed status: ${config.label}`}
    >
      <Icon aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
