import Link from "next/link"

import { startGuestSession } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LandingHero() {
  return (
    <section className="mx-auto w-full max-w-(--page-max-width,80rem) px-4 py-24 text-center sm:px-6 sm:py-32">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Read the web on your terms.
      </h1>

      <p className="mx-auto mt-4 max-w-[60ch] text-lg text-muted-foreground">
        Frontpage is a clean, fast RSS reader. Subscribe to any source, skip the
        algorithm, and read what actually matters.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }))}>
          Get Started — Free
        </Link>

        <form action={startGuestSession}>
          <Button type="submit" size="lg" variant="outline">
            Try as Guest →
          </Button>
        </form>
      </div>
    </section>
  )
}
