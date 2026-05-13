# Tech Stack Rules

## Documentation

Always use context7 (`mcp__context7__resolve-library-id` + `mcp__context7__query-docs`) to look up current documentation before recommending, configuring, or using any library, framework, SDK, or tool. Never rely on training-data knowledge for versions or APIs.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 — App Router, TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Database | PostgreSQL + Prisma v7 |
| Auth | Better Auth v1.3 (server-side only — no Better Auth UI) |
| Validation | Zod v4 |
| Forms | React Hook Form v7 |
| Client state | TanStack Query v5 |
| RSS parsing | fast-xml-parser |
| Date formatting & math | date-fns v4 |
| Drag & drop | dnd-kit |
| AI | Vercel AI SDK (`ai` + `@ai-sdk/groq`) + Groq API |
| Deployment | Vercel |

## Rules

- Use the App Router exclusively — no Pages Router.
- In Next.js 16, `middleware.ts` is renamed to `proxy.ts` and `export function middleware` becomes `export function proxy`. Always use `proxy.ts` for route protection. Note: `proxy` runs on Node.js runtime only — edge runtime is not supported.
- All database access goes through Prisma — no raw SQL unless Prisma cannot express the query.
- All form inputs and API route payloads must be validated with Zod schemas. Zod v4: use `z.email()` (not `z.string().email()` — deprecated), `z.url()`, etc. as top-level types.
- All Zod schemas live in `schemas/` — one file per domain (e.g. `schemas/auth.ts`, `schemas/feed.ts`). Never define schemas inline inside components or server actions; always import from `schemas/`.
- Server-side only: RSS fetching, Prisma queries, auth session reads.
- Client-side only: TanStack Query for polling, optimistic updates, and feed refresh state.
- shadcn/ui is the first choice for any UI primitive — only build custom components when shadcn/ui has no equivalent.
- Use date-fns for all date/time formatting and arithmetic — never write manual date math (`Date.now()`, manual diff calculations, hand-rolled relative time strings). Prefer `formatDistanceToNow`, `format`, `isAfter`, `isBefore`, `subDays`, `addDays`, etc. from date-fns.
- AI calls use Vercel AI SDK (`generateText` from `ai`, model from `@ai-sdk/groq`) inside Server Actions — never call Groq API directly from the client.
- Cache AI-generated summaries in the `FeedItem` table (`summary` column) — never re-generate a summary that already exists.

## Server vs Client

- All pages are Server Components by default — never add `"use client"` to a page unless there is no other option.
- Prefer Server Components for everything: data fetching, rendering, layout. Only use Client Components when the feature genuinely requires it (browser APIs, event listeners, stateful interactivity, third-party client-only libs).
- Use Server Actions for all data mutations (form submissions, feed add/delete, read state, bookmarks, preferences). Only fall back to Route Handlers when a Server Action cannot work (e.g. webhooks, RSS proxy fetching, non-form-based external API calls).
- All Server Actions live in `app/_actions/` — one file per domain (e.g. `app/_actions/auth.ts`, `app/_actions/feed.ts`). Never define Server Actions inline in components or page files.
- Never fetch data in a Client Component if a Server Component can do it instead — pass data down as props.
