import Link from 'next/link'
import { RssIcon } from 'lucide-react'
import { QuickStartButton } from '@/components/dashboard/quick-start-button'
import { QuickAddFeedButton } from '@/components/dashboard/quick-add-feed-button'
import { DismissOnboardingButton } from '@/components/dashboard/dismiss-onboarding-button'
import sampleFeeds from '@/data/sample-feeds.json'

type Props = {
  isGuest: boolean
  hasFeedsAlready?: boolean
}

export function OnboardingEmptyState({ isGuest, hasFeedsAlready = false }: Props) {
  return (
    <div className="mx-auto max-w-[60rem] px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <RssIcon size={28} className="text-muted-foreground shrink-0" aria-hidden />
            <div>
              <h2 className="text-xl font-semibold">
                {hasFeedsAlready ? 'Discover more feeds' : isGuest ? 'Welcome to Frontpage' : 'Get started with Frontpage'}
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {isGuest
                  ? "You're browsing as a guest. Sign up to subscribe and save your own feeds."
                  : hasFeedsAlready
                  ? 'Add more curated feeds or use a quick-start pack below.'
                  : 'Add your first feeds or use a quick-start pack to begin reading in seconds.'}
              </p>
            </div>
          </div>
          {!isGuest && <DismissOnboardingButton />}
        </div>
      </div>

      <div className="space-y-6">
        {sampleFeeds.categories.map((cat) => (
          <section key={cat.name} aria-label={cat.name}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{cat.name}</h2>
              {isGuest ? (
                <Link
                  href="/sign-up"
                  className="text-muted-foreground text-xs hover:underline"
                >
                  Sign up to add →
                </Link>
              ) : (
                <QuickStartButton categoryName={cat.name} feedCount={cat.feeds.length} />
              )}
            </div>

            <div className="divide-y rounded-xl border shadow-sm">
              {cat.feeds.map((feed) => {
                const hostname = new URL(feed.feedUrl).hostname
                return (
                  <div key={feed.feedUrl} className="flex items-center gap-3 px-4 py-3">
                    <img
                      src={`/api/favicon?domain=${encodeURIComponent(hostname)}`}
                      alt=""
                      aria-hidden
                      width={16}
                      height={16}
                      className="size-4 shrink-0 rounded-sm object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{feed.title}</p>
                      <p className="text-muted-foreground truncate text-xs">{feed.description}</p>
                    </div>
                    {isGuest ? (
                      <Link
                        href="/sign-up"
                        className="text-muted-foreground shrink-0 text-xs hover:underline"
                      >
                        Sign up
                      </Link>
                    ) : (
                      <QuickAddFeedButton url={feed.feedUrl} />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
