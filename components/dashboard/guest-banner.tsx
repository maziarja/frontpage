import Link from 'next/link'

export function GuestBanner() {
  return (
    <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-sm">
      <span className="text-muted-foreground">
        You&apos;re browsing as a guest — your data won&apos;t be saved.
      </span>
      <Link
        href="/sign-up"
        className="font-medium underline-offset-4 hover:underline"
      >
        Sign up to save your feeds →
      </Link>
    </div>
  )
}
