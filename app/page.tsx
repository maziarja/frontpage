import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { LandingNav } from "@/components/landing/nav"
import { LandingHero } from "@/components/landing/hero"
import { LandingFeatures } from "@/components/landing/features"
import { LandingCTA } from "@/components/landing/cta"
import { LandingFooter } from "@/components/landing/footer"

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/dashboard")

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen flex-col">
        <LandingNav />
        <main id="main-content" className="flex flex-1 flex-col">
          <LandingHero />
          <LandingFeatures />
          <LandingCTA />
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
