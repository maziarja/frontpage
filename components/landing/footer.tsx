import Link from "next/link"
import { FrontpageIcon } from "@/components/icons/frontpage-icon"

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-(--page-max-width,80rem) flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FrontpageIcon className="h-4 w-4" />
          Frontpage · © 2026
        </span>

        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/sign-in" className="transition-colors hover:text-foreground">
            Sign In
          </Link>
          <Link href="/sign-up" className="transition-colors hover:text-foreground">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  )
}
