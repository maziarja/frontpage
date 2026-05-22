import Link from 'next/link'

export function GuestBanner() {
  return (
    <div className="flex items-center justify-between gap-4 border-b bg-primary/5 px-4 py-2.5 text-sm">
      <span className="text-foreground/70">
        You&apos;re browsing as a guest — your data won&apos;t be saved.
      </span>
      <Link
        href="/sign-up"
        className="shrink-0 font-semibold text-primary underline-offset-4 hover:underline"
      >
        Sign up to save your feeds →
      </Link>
    </div>
  )
}
