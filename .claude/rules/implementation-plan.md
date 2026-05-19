# Implementation Plan

---

## Phase 0 — Project Setup

> Foundation everything else builds on. Do not skip steps.

- [ ] Scaffold Next.js 16 with TypeScript (`create-next-app`)
- [ ] Configure Tailwind v4 — wire `starter/tokens.css` + `starter/tailwind.css` into global CSS via `@import`
- [ ] Install and init shadcn/ui
- [ ] Install Lucide React
- [ ] Configure ESLint + Prettier
- [ ] Set up folder structure: `app/`, `components/`, `lib/`, `server/`, `db/`
- [ ] Initialize Prisma with PostgreSQL provider
- [ ] Create `.env.local` template with all required env vars
- [ ] Deploy skeleton to Vercel — confirm CI works before writing features

---

## Phase 1 — Database Schema

> Design the schema once, carefully. Changing it later is expensive.

- [ ] `User` — id, email, created_at (Better Auth manages this)
- [ ] `Account` — id, user_id, provider_id, hashed_password (Better Auth — stores credentials + OAuth per user)
- [ ] `Session` — id, user_id, token, expires_at (Better Auth — one row per active session)
- [ ] `Verification` — id, identifier, value, expires_at (Better Auth — password reset + email verification tokens)
- [ ] `Feed` — id, user_id, url, title, description, favicon_url, category_id, health_status, last_fetched_at, error_message
- [ ] `FeedItem` — id, feed_id, url, title, description, content, author, published_at, guid (for deduplication)
- [ ] `Category` — id, user_id, name, order
- [ ] `ReadState` — user_id, feed_item_id, read_at (composite PK)
- [ ] `Bookmark` — user_id, feed_item_id, saved_at (composite PK)
- [ ] `UserPreference` — user_id, layout, refresh_interval, theme
- [ ] Generate Better Auth schema via their CLI — confirms all 4 auth models match what the adapter expects
- [ ] Add indexes: `FeedItem(feed_id, published_at)`, `ReadState(user_id)`, `Bookmark(user_id)`
- [ ] Write and run initial Prisma migration

---

## Phase 2 — Authentication

- [ ] Install and configure Better Auth with Prisma adapter
- [ ] Install Better Auth UI (shadcn/ui-based auth forms)
- [ ] Sign up page (`/signup`) — email + password
- [ ] Sign in page (`/signin`)
- [ ] Password reset flow (`/reset-password`)
- [ ] Sign out Server Action
- [ ] Session persistence across browser refreshes
- [ ] `proxy.ts` (Next.js 16 — replaces `middleware.ts`) — protect `/dashboard` and all app routes, redirect to `/signin`
- [ ] Guest mode — session-scoped state, no DB writes

---

## Phase 3 — Landing Page

- [ ] Hero section — value proposition headline + subheading
- [ ] Feature highlights — 3–4 cards explaining Frontpage's value
- [ ] Dual CTAs — "Sign Up" + "Try as Guest" (both prominent)
- [ ] Responsive layout (mobile → desktop)
- [ ] Fast load — no heavy blocking assets
- [ ] "Try as Guest" CTA initializes guest session and redirects to `/dashboard`

---

## Phase 4 — App Shell & Navigation

- [ ] Root dashboard layout — sidebar + main content area
- [ ] Sidebar — category list, feed list per category, unread counts per feed + category + total
- [ ] Sidebar collapsed state on mobile (slide-in drawer)
- [ ] Top navigation bar — search trigger, refresh button, mark all as read, sort order toggle, layout switcher, user menu
- [ ] Active state highlighting for current feed/category
- [ ] Dark mode toggle — respect `prefers-color-scheme`, persist to `UserPreference`

---

## Phase 5 — RSS Feed Fetching & Parsing

> Route Handler (not Server Action) — external HTTP fetch cannot be a Server Action.

- [ ] Route Handler `GET /api/feeds/fetch` — server-side RSS proxy, 10s timeout, follows redirects, updates stored URL on 301
- [ ] Parse RSS 2.0 with `fast-xml-parser`
- [ ] Parse Atom 1.0
- [ ] Parse RSS 1.0 / RDF
- [ ] Normalize dates (ISO 8601, RFC 822, RFC 2822, non-standard)
- [ ] Normalize HTML entities in titles + descriptions
- [ ] Handle missing optional fields gracefully (no author, no date, no description)
- [ ] Deduplicate items by `guid` or URL on re-fetch
- [ ] Cache feed responses using `ETag` / `Last-Modified` headers
- [ ] Store parsed items in `FeedItem` table

---

## Phase 6 — Feed Management

- [ ] Add feed form — URL input, validate it's a real RSS/Atom feed before saving (Server Action)
- [ ] Display feed title, description, favicon after successful add
- [ ] Edit feed — custom title, assigned category (Server Action)
- [ ] Delete feed with confirmation — cascade delete items, read state, bookmarks (Server Action)
- [ ] Feed health status badge — active / stale (30+ days) / error
- [ ] Last successful fetch time display
- [ ] Manual retry button for errored feeds

---

## Phase 7 — Content Browsing

- [ ] Feed item list — title, source name, favicon, published date, excerpt
- [ ] Reverse-chronological sort by default
- [ ] Filter by feed
- [ ] Filter by category
- [ ] Item count per feed and per category
- [ ] Visual distinction between sources when viewing mixed feeds
- [ ] Infinite scroll (or pagination) — performant with 100+ items
- [ ] Skeleton loading states — no layout shift during load

---

## Phase 8 — Read / Unread Tracking

- [ ] Mark item as read on click — Server Action writes to `ReadState`
- [ ] Visual distinction read vs unread (opacity / font weight / dot indicator)
- [ ] Mark individual item read/unread manually — Server Action
- [ ] "Mark all as read" per feed — Server Action
- [ ] "Mark all as read" per category — Server Action
- [ ] "Mark all as read" globally — Server Action
- [ ] Unread counts update in sidebar after mutations (TanStack Query invalidation or optimistic update)

---

## Phase 9 — Article / Reader View

- [ ] Click item → open original URL in new tab
- [ ] Reader view for items with full HTML content — render in-app
- [ ] Clean HTML rendering — headings, paragraphs, lists, code blocks, images
- [ ] Strip ads, nav, and non-content elements from feed HTML
- [ ] Article metadata — title, author, source, published date
- [ ] Link back to original source
- [ ] Next / previous item navigation without returning to list

---

## Phase 10 — Category Organization

- [ ] Create category — Server Action
- [ ] Rename category — Server Action
- [ ] Delete category — reassign feeds to Uncategorized — Server Action
- [ ] Assign feed to category — Server Action
- [ ] "Uncategorized" default group
- [ ] Drag-and-drop category reorder with dnd-kit — persist order via Server Action
- [ ] Category view — all items within a category

---

## Phase 11 — Feed Error Handling

- [ ] Clear error state UI per feed (network error, timeout, 404, 500)
- [ ] Distinguish temporary vs permanent errors
- [ ] Exponential backoff retry logic (server-side)
- [ ] Show last successful fetch time even when current fetch fails
- [ ] Non-blocking UI — one broken feed doesn't block the rest
- [ ] Feed health summary indicator (X healthy, Y erroring)

---

## Phase 12 — Design Challenges

### Layout Customization
- [ ] Compact list layout (high density, no images)
- [ ] Standard list layout (default)
- [ ] Card grid layout (images prominent)
- [ ] Layout switcher UI — toggle in toolbar
- [ ] Persist layout preference to `UserPreference` (Server Action)
- [ ] Each layout adapts across mobile / tablet / desktop

### Content Discovery & Onboarding
- [ ] Empty state — helpful, not barren; CTA to add first feed
- [ ] Curated feed suggestions by category (pre-populated list from `data/sample-feeds.json`)
- [ ] "Quick start" pack — one click adds 5 curated feeds by interest area
- [ ] Guest dashboard pre-loaded with all 19 curated feeds across 5 categories

### Digest View
- [ ] "What did I miss?" view — items since last visit, grouped by category
- [ ] Separate digest route or toggleable mode
- [ ] Visit-based (since last session) rather than purely time-based

---

## Phase 13 — AI-Powered Summarization

> Differentiator. Uses Vercel AI SDK (`ai` + `@ai-sdk/groq`) with Groq API inside Server Actions.

- [x] Add `summary` column to `FeedItem` table — nullable, populated lazily on first request
- [x] Add `GROQ_API_KEY` to `.env.local` and Vercel environment variables
- [x] Server Action `generateSummary(feedItemId)` — calls `generateObject` with `@ai-sdk/groq`, stores result in `FeedItem.summary` + `tags`, returns summary
- [x] Never re-generate if `summary` already exists — read from DB, not Groq
- [x] "Summarize" button on feed items and reader view — triggers Server Action, shows loading state, renders summary inline
- [x] Auto-tag content by topic — Server Action extracts 2–3 topic tags per item, stores in `FeedItem.tags`
- [x] Graceful fallback — if Groq API is unavailable or times out, show the original excerpt with no error shown to the user
- [x] Rate limiting — cap summarization requests per user per day to control API costs

---

## Phase 14 — Stretch Features

- [ ] **Bookmarks** — bookmark from list or reader view, dedicated Saved section, sort by date saved / published, search within bookmarks
- [ ] **Search** — full-text across titles + descriptions, highlight matches, filter by feed / category / date, results within 500ms, recent search history
- [ ] **OPML import** — parse file, preview feed list, flag duplicates, report results; handle `sample-feeds.opml`
- [ ] **OPML export** — current subscriptions with category structure
- [ ] **Auto-refresh** — configurable interval (15m / 30m / 1h / manual), non-blocking background fetch, "N new items" banner, use ETags to skip unchanged feeds
- [ ] **Keyboard navigation** — `j`/`k` move items, `o`/`Enter` open, `m` toggle read, `s` bookmark, `g`+`h`/`s`/`f` nav shortcuts, `/` focus search, `?` shortcut overlay, `Cmd+K` command palette

---

## Phase 15 — Polish & Deployment

- [ ] Responsive audit — every screen, every breakpoint, no horizontal scroll
- [ ] Accessibility audit — WCAG AA, semantic HTML, ARIA labels, focus management, keyboard navigable
- [ ] Lighthouse audit on deployed site — target Performance >85, Accessibility >90, Best Practices >90
- [ ] Dark mode polish — all surfaces, all states
- [ ] Custom SVG favicon
- [ ] `robots.txt`, `sitemap.xml`, Open Graph meta tags
- [ ] README — Lighthouse scores, design decisions, differentiator documentation
- [ ] Production environment variables configured on Vercel
- [ ] Final deploy + smoke test on live URL

---

## Order of Priority

```
Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15
Setup   Auth  Landing  Shell  RSS   Feeds  Browse  Read  Reader  Cats  Errors  Design  AI  Stretch  Polish
```

Core (Phases 0–11) = complete, shippable product.
Phases 12–15 = portfolio-quality finish.
