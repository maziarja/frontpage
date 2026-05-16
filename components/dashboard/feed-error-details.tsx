import { AlertCircleIcon, AlertTriangleIcon, ClockIcon, HashIcon, RefreshCwIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { classifyFeedError } from '@/lib/feed-error'
import { RetryButton } from '@/components/dashboard/retry-button'
import { Badge } from '@/components/ui/badge'

type Props = {
  feedId: string
  errorMessage: string | null
  lastSuccessfulFetchAt: Date | null
  nextRetryAt: Date | null
  retryCount: number
}

export function FeedErrorDetails({
  feedId,
  errorMessage,
  lastSuccessfulFetchAt,
  nextRetryAt,
  retryCount,
}: Props) {
  const errorInfo = classifyFeedError(errorMessage)
  const Icon = errorInfo.isPermanent ? AlertTriangleIcon : AlertCircleIcon

  return (
    <div
      className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm"
      role="alert"
      aria-label="Feed error details"
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-destructive" aria-hidden="true" />
        <span className="font-medium text-destructive">{errorInfo.headline}</span>
        <Badge
          variant={errorInfo.isPermanent ? 'destructive' : 'outline'}
          className="text-xs"
        >
          {errorInfo.isPermanent ? 'Permanent' : 'Temporary'}
        </Badge>
      </div>

      <p className="mb-1 text-foreground/80">{errorInfo.userMessage}</p>
      <p className="mb-3 text-muted-foreground">{errorInfo.helpText}</p>

      <div className="mb-3 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ClockIcon size={12} aria-hidden="true" />
          {lastSuccessfulFetchAt ? (
            <span>
              Last successful fetch:{' '}
              <time dateTime={lastSuccessfulFetchAt.toISOString()}>
                {formatDistanceToNow(lastSuccessfulFetchAt, { addSuffix: true })}
              </time>
            </span>
          ) : (
            <span>Never successfully fetched</span>
          )}
        </div>
        {nextRetryAt && (
          <div className="flex items-center gap-1.5">
            <RefreshCwIcon size={12} aria-hidden="true" />
            <span>
              Next automatic retry:{' '}
              <time dateTime={nextRetryAt.toISOString()}>
                {formatDistanceToNow(nextRetryAt, { addSuffix: true })}
              </time>
            </span>
          </div>
        )}
        {retryCount > 0 && (
          <div className="flex items-center gap-1.5">
            <HashIcon size={12} aria-hidden="true" />
            <span>
              {retryCount} failed attempt{retryCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <RetryButton feedId={feedId} />
    </div>
  )
}
