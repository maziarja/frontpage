import Link from "next/link"

import { startGuestSession } from "@/app/_actions/auth"

export function LandingCTA() {
  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-(--page-max-width,80rem) px-4 py-20 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
          Start reading in seconds.
        </h2>
        <p className="mx-auto mt-3 max-w-[44ch] text-base text-primary-foreground/70">
          Free forever. No credit card. Just your feeds, your way.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-md bg-background px-8 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-background/90"
          >
            Get Started — Free
          </Link>

          <form action={startGuestSession}>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md border border-primary-foreground/30 px-8 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Try as Guest →
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
