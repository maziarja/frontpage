import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-(--page-max-width,80rem) items-center justify-center gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <span>© 2026 Frontpage</span>
        <span aria-hidden="true">·</span>
        <Link href="/sign-in" className="transition-colors hover:text-foreground">
          Sign In
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/sign-up" className="transition-colors hover:text-foreground">
          Sign Up
        </Link>
      </div>
    </footer>
  )
}
