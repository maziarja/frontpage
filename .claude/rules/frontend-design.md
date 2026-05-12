# Frontend Design Rules

All rules below are derived from `guidance/brand-kit.md`, `guidance/patterns.md`, and `guidance/accessibility.md`. Those files are the source of truth — read them before designing any new screen.

---

## Tokens & Theming

- Never hardcode colors, spacing, font sizes, or radii — always use the CSS custom properties from `starter/tokens.css`
- Dark mode is required — all surfaces must have both light and dark token values defined
- Font stack: `Inter` for all UI + headings, `Georgia` for reader/article content, `JetBrains Mono` for code in feed content
- Spacing is based on a 4px unit — use `--space-*` tokens, never arbitrary pixel values
- Border radii: `--radius-sm` for badges/tags, `--radius-md` for buttons/inputs, `--radius-lg` for cards/panels/modals

---

## Layout

- Sidebar width: `--sidebar-width` (16.25rem) — fixed on desktop, overlay/bottom nav on mobile
- Content max width: `--content-max-width` (45rem) for reader view, `--feed-max-width` (60rem) for feed list, `--page-max-width` (80rem) for page container
- No horizontal scrolling — ever
- No fixed sidebar on mobile — collapses to overlay or bottom navigation
- No hamburger menu on desktop — sidebar is always visible, collapsible to icon rail
- Sidebar must show categories + feeds + unread counts at all times

---

## Typography

- Use the type scale tokens — `--text-xs` through `--text-3xl`
- Never use more than 2 font sizes within a single feed item
- Pair text sizes with their matching line heights as defined in `brand-kit.md`
- Timestamps: `--text-xs`, `--color-text-tertiary`, relative format ("2h ago") with full date on hover
- Feed item titles: `--text-lg`, `--font-medium`
- Body / descriptions: `--text-base`, `--font-regular`
- Headings: `--text-xl` or `--text-2xl`, `--font-semibold`

---

## Feed Item Design

- Visual hierarchy order: title → source → time → excerpt — always in this order
- Source favicon: 16–20px, decorative role — never dominant
- Unread indicator: subtle but unmissable — dot, font-weight change, or opacity shift; never color alone
- Read items: visually de-emphasized (lower opacity or lighter weight), never hidden
- Transition from unread → read must be smooth, not jarring (use CSS transition)
- Clicking an item must feel immediately responsive — use optimistic UI for read state
- Show at most 2–3 pieces of metadata per item — do not pile on author + date + category + word count + read time

---

## Loading & Empty States

- Always use skeleton screens for loading — shape must match the real content layout
- Spinner only for explicit user-triggered operations (manual feed refresh)
- Empty states must explain why it's empty and what to do — never a blank page
- Error states must be specific: "This feed returned a 404" not "Something went wrong"
- Never show raw error messages or stack traces to users

---

## Navigation & Information Architecture

- "All Items", "Saved", and "Search" are top-level navigation destinations
- Current location must be obvious at all times — active state required in nav (`aria-current`)
- Sidebar is collapsible to maximize reading area — persist this preference

---

## Interactions & Behavior

- No modals for routine actions — use inline forms, drawers, or sheets instead
- No auto-play media from feeds
- Bulk actions ("Mark all as read") must have a brief undo window or confirmation
- Notification badges cap at "99+" — never show raw counts over 99
- Guest users must be able to explore freely — sign-up prompts are gentle, never blocking

---

## Performance Rules (UI layer)

- Never load all feed items on initial render — virtualize or paginate long lists
- Lazy load all images below the fold (`loading="lazy"`)
- Never block the UI during feed refresh — show a non-blocking progress indicator
- Cache aggressively — do not re-fetch feeds on every navigation

---

## Responsive Design

- Breakpoints: content-driven, not fixed pixel targets
- Touch targets: minimum 44×44px on mobile
- Feed items on mobile: less metadata, full detail on large screens
- Reader view: full-width on mobile with comfortable margins

---

## Accessibility (WCAG 2.1 AA — required)

- All text must meet 4.5:1 contrast ratio (normal), 3:1 (large text)
- Never convey information by color alone — always pair with icon, text, or weight
- Feed health status: icon + color + screen-reader text (e.g. `aria-label="Feed status: error"`)
- Unread indicators: dot/weight + color — not color alone
- All interactive elements reachable via Tab, with visible `:focus-visible` styling
- Logical focus order — no keyboard traps (except modals, where focus must be trapped and restored on close)
- Skip link required to jump to main content
- Proper landmark regions: `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`
- Heading hierarchy: h1 → h2 → h3, no skipped levels
- All form fields have visible labels — never rely on placeholder text alone
- Error messages associated to fields via `aria-describedby`
- Dynamic content changes announced via `aria-live` regions (new items, refresh complete, errors)
- All animations respect `prefers-reduced-motion`
- Sanitize all HTML from feed content before rendering — prevent XSS, preserve semantic structure

---

## Icons

- Use Lucide React exclusively — 16px inline/metadata, 20px UI actions, 24px navigation
- Icons are always paired with a label or `aria-label` — never icon-only interactive elements without accessible text

---

## Key Screens (highest design priority)

1. **Main feed view** — where users spend 90% of their time. Visual rhythm, information density, and scannability matter most.
2. **Landing page** — first impression. Must communicate value instantly and feel like a real product.
3. **Empty / onboarding state** — sets emotional tone. Must guide users to value, not feel barren.
