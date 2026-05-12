import Link from "next/link"

import { startGuestSession } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LandingCTA() {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-(--page-max-width,80rem) px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold">Start reading in seconds.</h2>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started — Free
          </Link>

          <form action={startGuestSession}>
            <Button type="submit" size="lg" variant="outline">
              Try as Guest →
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
