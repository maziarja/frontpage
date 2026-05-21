# Frontpage — Maziar Jamalialem

A full-stack, AI-powered RSS and Atom feed reader built as a Frontend Mentor Product Challenge. Aggregates content from multiple sources into a clean, scannable dashboard with three reading layouts, a digest view, full keyboard navigation, and AI-generated summaries.

**Live URL:** https://frontpage-kohl.vercel.app

![Screenshot of Frontpage](./screenshot.png)

---

## Overview

Frontpage is a production-ready content aggregator where users subscribe to RSS and Atom feeds, browse and track articles, and get AI-powered summaries on demand. Guest visitors land in a fully populated dashboard with 18 curated feeds across five categories — no account required. The project covers 15 implementation phases from schema design through polish, with all four differentiators implemented.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| UI Components | shadcn/ui |
| Database | PostgreSQL + Prisma v7 |
| Auth | Better Auth v1.3 |
| Validation | Zod v4 |
| Forms | React Hook Form v7 |
| RSS Parsing | fast-xml-parser |
| AI | Vercel AI SDK + Groq API |
| Drag & Drop | dnd-kit |
| Hosting | Vercel |

---

## Design Decisions

These are the product and design choices I made where the spec left room for interpretation.

### Content Discovery & Onboarding

**The problem I was solving:** New users hit a blank dashboard with no feeds — the classic cold-start problem. Portfolio viewers and hiring managers clicking the live link won't create an account, so they'd see nothing without guest mode.

**My approach:** A "Try as Guest" CTA on the landing page seeds a complete dashboard instantly, pre-loaded with 18 curated feeds across five categories: Frontend, Design, Backend & DevOps, General Tech, and AI & ML. Authenticated new users get the same experience via a quick-start onboarding flow that lets them add category bundles in one click.

**Why I chose this approach:** Eliminating the cold-start problem was the highest-leverage improvement I could make to the first impression. Any visitor — recruiter, peer, or user — sees a working, populated product from the first click. No friction, no empty states, no "add your first feed" walls.

**What I'd do differently:** Add smart AI-powered category suggestions that analyze feed content and recommend categories automatically, so users aren't categorizing feeds manually.

---

### Digest View

**The problem I was solving:** Readers who return after a few days away face hundreds of unread items with no way to orient themselves. A time-based window doesn't account for how long you were actually gone.

**My approach:** A visit-based digest at `/dashboard/digest` that shows only articles published since your last session, grouped by category. `lastVisitedAt` is stored in `UserPreference` and updated on each authenticated dashboard visit.

**Why I chose this approach:** If you were away for three days, a "last 24 hours" filter is wrong — it silently hides two days of content. Visit-based framing is inherently personal: the digest shows exactly what you missed, nothing more, nothing less. Grouping by category preserves the mental model users already have from the sidebar.

**What I'd do differently:** Add a top-story ranking within each category — using either recency-weighted scoring or AI-based relevance — so the most important items surface above the fold.

---

### Layout Customization

**The problem I was solving:** Different reading contexts call for different information densities. Scanning 200 headlines benefits from a compact list; image-rich design feeds are better as cards.

**My approach:** Three fully independent layout components — Compact (high-density text list), Standard (default with excerpt), and Card (image-prominent grid) — toggled from the top toolbar and persisted to `UserPreference.layout`. Each layout is a separate React component, not a CSS variant of one component.

**Why I chose this approach:** Separate components rather than CSS tweaks keeps layout-specific logic clean. Compact doesn't need image handling; Card doesn't need excerpt truncation logic. Each component optimizes for its own use case without compromise.

**What I'd do differently:** Add a reading-width control in the reader view for users who prefer narrower or wider columns for long-form content.

---

## Differentiators

All four differentiators from the spec were implemented.

### 1. AI-Powered Summarization

**Why I chose this:** Feed descriptions are often truncated, promotional, or missing entirely. On-demand summaries give readers a real signal before committing to a full article.

**How it enhances the product:** A "Summarize" button on each feed item triggers a Server Action that calls Groq via the Vercel AI SDK, stores the result in `FeedItem.summary`, and returns it to the UI. Summaries are never re-generated — the cached result is served on all subsequent requests. Auto-tagging extracts 2–3 topic tags per item.

**Implementation highlights:** Rate-limited per user per day to control API costs. Graceful fallback — if Groq is unavailable or times out, the original excerpt is shown with no error surfaced to the user. Summary generation uses `generateObject` with a Zod schema for structured output.

---

### 2. OPML Import / Export

**Why I chose this:** OPML is the standard interchange format for RSS subscriptions. Supporting it makes Frontpage a real alternative to tools like Feedly or NetNewsWire — users can bring their existing subscriptions and take them elsewhere.

**How it enhances the product:** Import parses an OPML file on the server, previews the feed list before committing, flags duplicates against existing subscriptions, and reports results per-feed. Export reconstructs the OPML document with category structure intact. Tested against `sample-feeds.opml` which includes edge cases (missing titles, nested outlines, non-standard attributes).

---

### 3. Keyboard Navigation

**Why I chose this:** RSS readers are inherently high-volume browsing tools. Mouse-driven navigation for 200+ items is slow; keyboard shortcuts make the product competitive with native apps.

**How it enhances the product:** Full shortcut system — `j`/`k` to move between items, `o`/`Enter` to open in reader view, `m` to toggle read state, `s` to bookmark, `g+h`/`g+s`/`g+f` to navigate between sections, `/` to focus search, `?` to show the shortcut overlay, `Cmd+K` for the command palette.

---

### 4. Auto-refresh with ETags

**Why I chose this:** A content aggregator that requires manual refresh isn't really an aggregator. Auto-refresh with smart caching makes the product feel live without hammering every feed on every poll.

**How it enhances the product:** Configurable intervals (15m / 30m / 1h / manual). Refresh requests include `If-None-Match` and `If-Modified-Since` headers; unchanged feeds return 304 and are skipped entirely. New items surface via a non-blocking "N new items" banner so the reading position isn't disrupted mid-scroll.

---

## Development Journey

### Initial Approach vs. Final

The project followed a strict 15-phase implementation plan, and the sequence held well. The main deviation was in data mutation architecture: the initial plan assumed Route Handlers for all mutations. Mid-build, I switched everything to Server Actions (except the RSS proxy fetch, which requires server-to-server HTTP). Server Actions simplified auth context propagation and eliminated a layer of client-side fetch boilerplate.

### Decisions Reconsidered

Feed error handling was initially a simple boolean `isError` flag. Once I started testing real feeds, it became clear the model needed more nuance: `ACTIVE`, `STALE` (30+ days), and `ERROR` states; a separate `lastSuccessfulFetchAt` distinct from `lastFetchedAt`; and exponential backoff with a `nextRetryAt` timestamp. The more precise model was worth the extra schema complexity.

### What Surprised Me

RSS real-world parsing was harder than expected. The spec covers three formats (RSS 2.0, Atom, RDF), but real feeds combine non-standard date strings, HTML entities in titles, missing GUIDs, malformed XML, and redirected URLs — sometimes all in one feed. The normalization layer grew significantly over what the initial plan anticipated.

Feed health tracking was the other surprise. `lastSuccessfulFetchAt` and `lastFetchedAt` sound similar but serve completely different UI needs — one tells you when the feed last had content, the other tells you when it was last attempted. Getting that distinction right early would have saved a schema migration.

### Session Breakdown

| Session | Focus | What I Accomplished |
|---|---|---|
| 1 | Foundation | Project scaffold, Tailwind v4, Prisma schema, Better Auth |
| 2 | Auth | Signup, signin, session, proxy.ts route protection |
| 3 | Landing page | Hero, feature highlights, guest CTA, responsive layout |
| 4 | App shell | Sidebar, category/feed list, unread counts, top nav |
| 5 | RSS fetching | Proxy route, parser, format normalization, deduplication |
| 6 | Feed management | Add/edit/delete, health status, favicon extraction |
| 7 | Content browsing | Feed item list, sorting, filtering, skeleton loading |
| 8 | Read tracking | Mark read/unread, bulk actions, optimistic UI |
| 9 | Reader view | In-app article render, HTML sanitization, navigation |
| 10 | Categories | CRUD, drag-and-drop reorder, category view |
| 11 | Error handling | Feed health states, exponential backoff, error UI |
| 12 | Design challenges | Compact/Standard/Card layouts, digest view, onboarding |
| 13 | AI summarization | Groq integration, caching, rate limiting, auto-tags |
| 14 | Stretch features | Bookmarks, search, OPML, auto-refresh, keyboard nav |
| 15 | Polish | Lighthouse audit, accessibility pass, README |

---

## AI Collaboration Reflection

### How I Used AI

Claude Code (claude-sonnet-4-6) was active throughout all 15 phases via the project's `AGENTS.md` and `CLAUDE.md` context files. Most valuable for: Prisma schema design, Server Action scaffolding, RSS parsing edge cases, and Zod schema definitions. I reviewed and understood every generated file before moving on.

### What Worked Well

Providing explicit architectural constraints in `CLAUDE.md` — file conventions (`_actions/`, `_queries/`, `schemas/`), server vs client rules, and the Server Action pattern — produced consistently well-structured output from the first attempt. The model respected the rules without needing reminders mid-session.

### What I Learned

Starting each session with a phase goal and the implementation plan in context gave the model enough orientation to make good judgment calls on ambiguous requirements. Vague prompts produced generic code; specific ones with file path targets produced production-quality code.

### Where I Pushed Back

Occasionally the model suggested helper utilities or abstraction layers that added indirection without solving a real problem. Keeping the architecture flat — direct Server Actions, no intermediary service classes — was a conscious choice I had to reinforce a few times. The result is simpler and easier to trace.

---

## Self-Assessment

| Category | Rating | Notes |
|---|---|---|
| **Works for real users** | 5/5 | Deployed, functional end-to-end; guest mode verified in incognito |
| **Feed parsing robustness** | 5/5 | RSS 2.0, Atom 1.0, RDF; date normalization; ETag caching; GUID deduplication |
| **Design-it-yourself features** | 4/5 | All three implemented with clear problem framing and rationale |
| **Design quality** | 4/5 | Token-based system, consistent type scale, WCAG AA targets |
| **Responsive design** | 4/5 | Sidebar drawer on mobile, touch targets, no horizontal scroll |
| **Performance** | 5/5 | Mobile 99 · Desktop 100 |
| **Accessibility** | 4/5 | Mobile 96 · Desktop 85 — desktop has room to improve |
| **Edge case handling** | 4/5 | Feed health states, empty states, sanitized HTML rendering |
| **Code quality** | 5/5 | Clean `_actions/` / `_queries/` separation, all schemas in `schemas/` |
| **Landing page** | 4/5 | Clear value proposition, dual CTA, fast load |
| **Guest experience** | 5/5 | 18 curated feeds, zero friction, full feature access |

### Lighthouse Scores

|  | Mobile | Desktop |
|---|---|---|
| Performance | 99 | 100 |
| Accessibility | 96 | 85 |
| Best Practices | 96 | 96 |

### Strengths

- Feed parsing handles real-world format variations reliably — the normalization layer covers formats and edge cases the spec doesn't explicitly address
- Guest experience is immediately impressive with no signup required — 18 curated feeds across five categories from the first click
- Clean server/client separation throughout — no data fetching in Client Components, no Server Actions defined inline

### Areas for Improvement

- Desktop accessibility (85) has room to grow — some shadcn/ui components need additional ARIA attributes for full screen reader compatibility
- Smart category suggestions would meaningfully reduce manual setup friction for new users

---

## Known Limitations

- **Smart category suggestions** — AI-powered auto-categorization (analyzing feed content to suggest which category a feed belongs in) is not yet implemented. Users assign categories manually.
- **Desktop accessibility** — Lighthouse desktop accessibility score of 85 reflects some ARIA labeling gaps in complex interactive components (sidebar toggle, drag-and-drop handles).

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/maziarja/frontpage.git
cd frontpage

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your database URL, Groq API key, and Better Auth secrets

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Groq API key for AI summarization |
| `BETTER_AUTH_SECRET` | Random secret for Better Auth session signing |
| `BETTER_AUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |

---

## Acknowledgments

Built as a [Frontend Mentor Product Challenge](https://www.frontendmentor.io).
