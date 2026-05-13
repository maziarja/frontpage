---
name: project-auth-patterns
description: Auth and session security patterns observed in the frontpage codebase — findings from first full audit of auth layer
metadata:
  type: project
---

Auth architecture uses Better Auth v1.6 with Prisma adapter. Server Actions in `app/_actions/auth.ts`, config in `lib/auth.ts`, route protection in `proxy.ts`.

**Known vulnerabilities found (2026-05-12 audit):**

- `signInAction` and `signUpAction` do NOT call Zod schema validation server-side — they rely solely on client-side RHF validation. Any direct Server Action invocation bypasses this entirely.
- `guest-session` cookie value is not validated in `proxy.ts` — only cookie existence is checked (`!!guestCookie`), not that its value is `'true'`. Anyone can set `guest-session=anything` to bypass the auth gate.
- `guest-session` cookie is missing the `secure: true` flag in `startGuestSession()`. Only `httpOnly` and `sameSite: 'lax'` are set.
- Better Auth `secret` field accepts `undefined` (no runtime assertion) — if `BETTER_AUTH_SECRET` is unset, Better Auth may fall back to a weak default or throw at runtime.
- Password reset `redirectTo` URL is built from `window.location.origin` in `forgot-password-form.tsx` — the `/reset-password/confirm` route does not exist in the app directory. Tokens will land on a 404.
- `schemas/auth.ts` uses deprecated Zod v4 chained methods: `z.string().email()` and `z.string().trim().email()` instead of top-level `z.email()`. Per tech-stack rules this may cause silent validation failures.
- No rate limiting on `signInAction`, `signUpAction`, or AI summarization (not yet built). Brute force is unrestricted.
- `BETTER_AUTH_URL` / `BETTER_AUTH_SECRET` are checked but no startup assertion; `DATABASE_URL` uses `!` non-null assertion which silently passes `undefined` to the pg adapter.
- Auth layout (`app/(auth)/layout.tsx`) does NOT redirect already-authenticated users away from auth pages — only `proxy.ts` does this (for sign-in/sign-up/reset-password). This is acceptable since proxy covers those routes.
- `trustedOrigins` in `lib/auth.ts` is correctly restricted to `BETTER_AUTH_URL` only — good.
- `nextCookies()` plugin correctly handles cookie forwarding — no manual Set-Cookie parsing.
- All session reads use `auth.api.getSession({ headers: await headers() })` server-side — no client-side session trust.
- Cascade deletes are correctly configured on User → Session, Feed → FeedItem → ReadState/Bookmark.

**How to apply:** Reference these findings when reviewing future PRs touching auth, session handling, or input validation in Server Actions.

**Why:** First comprehensive security audit of the auth layer conducted 2026-05-12. Patterns of missing server-side Zod validation in Server Actions and incomplete cookie security flags are the most recurring issues to watch.
