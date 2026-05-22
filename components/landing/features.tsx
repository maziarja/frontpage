import { LayoutList, Rss, Zap } from "lucide-react"

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-lg transition-shadow hover:shadow-xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-base leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

export function LandingFeatures() {
  return (
    <section aria-labelledby="features-heading" className="border-y bg-muted/40">
      <div className="mx-auto max-w-(--page-max-width,80rem) px-4 py-20 sm:px-6">
        <h2
          id="features-heading"
          className="mb-12 text-center text-2xl font-semibold tracking-tight"
        >
          Everything you need, nothing you don&apos;t
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Rss size={20} aria-hidden="true" className="text-primary" />}
            title="Your sources, your rules"
            body="Subscribe to any RSS or Atom feed. No algorithms, no ads, no engagement traps — just the content you chose."
          />
          <FeatureCard
            icon={<Zap size={20} aria-hidden="true" className="text-primary" />}
            title="AI summaries in one click"
            body="Powered by Groq. Get the gist of any article without opening a new tab, so you can triage your reading faster."
          />
          <FeatureCard
            icon={<LayoutList size={20} aria-hidden="true" className="text-primary" />}
            title="Organized your way"
            body="Group feeds by topic, track unread counts at a glance, and switch between layouts that match how you like to read."
          />
        </div>
      </div>
    </section>
  )
}
