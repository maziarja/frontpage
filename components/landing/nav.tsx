import Link from "next/link"
import { FrontpageIcon } from "@/components/icons/frontpage-icon"

export function LandingNav() {
  return (
    <header className="border-b border-background/10 bg-foreground">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-(--page-max-width,80rem) items-center justify-between px-4 py-4 sm:px-6"
      >
        <span className="flex items-center gap-2 text-xl font-semibold tracking-tight text-background">
          <FrontpageIcon className="h-5 w-5 text-background" />
          Frontpage
        </span>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-background/60 transition-colors hover:text-background"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center justify-center rounded-md bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
          >
            Sign Up →
          </Link>
        </div>
      </nav>
    </header>
  )
}
