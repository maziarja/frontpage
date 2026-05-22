import Link from "next/link"

import { startGuestSession } from "@/app/_actions/auth"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-foreground">
      {/* Radial spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(255,255,255,0.07),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-(--page-max-width,80rem) px-4 py-24 text-center sm:px-6 sm:py-36">
        {/* Pill badge */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/8 px-4 py-1.5 text-xs font-medium tracking-wide text-background/60">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          No algorithms · No ads · Your content
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-background sm:text-5xl lg:text-[3.75rem] lg:leading-[1.1]">
          Read the web<br className="hidden sm:block" /> on your terms.
        </h1>

        <p className="mx-auto mt-5 max-w-[52ch] text-lg leading-relaxed text-background/55">
          Frontpage is a clean, fast RSS reader. Subscribe to any source, skip
          the algorithm, and read what actually matters.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-md bg-background px-8 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-background/90"
          >
            Get Started — Free
          </Link>

          <form action={startGuestSession}>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md border border-background/25 px-8 text-sm font-medium text-background/70 transition-colors hover:bg-background/10 hover:text-background"
            >
              Try as Guest →
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
