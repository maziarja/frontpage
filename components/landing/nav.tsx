import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LandingNav() {
  return (
    <header className="border-b">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-(--page-max-width,80rem) items-center justify-between px-4 py-4 sm:px-6"
      >
        <span className="text-xl font-semibold tracking-tight">Frontpage</span>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost" }))}>
            Sign In
          </Link>
          <Link href="/sign-up" className={cn(buttonVariants({ variant: "default" }))}>
            Sign Up →
          </Link>
        </div>
      </nav>
    </header>
  )
}
