import { AlertCircleIcon, CheckCircleIcon } from 'lucide-react'

type Props = {
  healthy: number
  erroring: number
}

export function FeedHealthSummaryBanner({ healthy, erroring }: Props) {
  return (
    <div
      className="mb-4 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm"
      role="status"
      aria-label={`Feed health: ${erroring} feed${erroring !== 1 ? 's' : ''} with errors`}
    >
      <AlertCircleIcon size={14} className="shrink-0 text-destructive" aria-hidden="true" />
      <span className="font-medium text-destructive">
        {erroring} feed{erroring !== 1 ? 's' : ''} {erroring !== 1 ? 'are' : 'is'} experiencing
        errors
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground flex items-center gap-1">
        <CheckCircleIcon size={12} aria-hidden="true" />
        {healthy} healthy
      </span>
    </div>
  )
}
