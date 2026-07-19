# Nexus — Current State

**Last updated:** 2026-07-09  
**Project path:** `C:\Users\noste\nexus`  
**Stack versions:** Next `16.2.10`, React `19.2.4`, HeroUI `3.2.2`, Tailwind `4`, next-themes `0.4.6`, lucide-react  

## What works today

### App shell

- Global layout: `app/layout.tsx` + `globals.css` + Geist fonts  
- Providers: `components/providers.tsx` (next-themes + `Toast.Provider`)  
- Sticky navbar: Explore, Servers, Bots, Dashboard + search + theme toggle + Login toast  
- Test-only Discord OAuth (`identify` + `guilds`) now powers login and server import; sessions use local test storage and listing data remains mocked
- **No** Categories / Leaderboard nav items  
- Theme: light/dark, soft charcoal dark  
- Root `/` → `/explore`  
- `/Explore` → `/explore` via `proxy.ts` (case-sensitive; next.config redirects caused loops on Windows)

### Pages

| Route | Status | Notes |
|--------|--------|--------|
| `/explore` | Done | Hero artwork, category chips, featured server grid, sidebar (Top Bots + CTA). No Trending Tags. |
| `/server` | Done | Search, sort, verified switch, filters, grid, skeleton, empty, pagination, load more |
| `/server/[slug]` | Done | Full public server profile; SSG via `generateStaticParams` |
| `/bots` | Done | Bot listing mirror of servers (no bot detail route yet) |
| `/dashboard` | Done | Stats, listings table, chart, activity, modals, quick actions |
| `/dashboard/new` | Done | Server/bot forms, upload placeholders, live preview, toasts; tab strip = Buttons not Tabs.Indicator |

### Components (high level)

```
components/
  cards/server-card.tsx, bot-card.tsx
  layout/site-navbar.tsx, theme-toggle.tsx
  explore/hero-section.tsx, explore-sidebar.tsx
  filters/category-chips.tsx, listing-filters.tsx
  server/server-detail-view.tsx, server-detail-client.tsx
  dashboard/* (sidebar, stats, table, chart, activity)
  forms/upload-dropzone.tsx
  ui/link-button.tsx, empty-state.tsx, card-skeleton.tsx, gradient-banner.tsx
  providers.tsx
```

### Mock data

| Module | Contents |
|--------|----------|
| `lib/data/servers.ts` | Server listings (13 servers, featured flags) |
| `lib/data/server-details.ts` | Detail enrichments: likes, createdAt, region, atmosphere, features, highlights, faq, trust, owner |
| `lib/data/bots.ts` | 12 bots + top bots |
| `lib/data/categories.ts` | Categories, tags, sort options, languages, sizes |
| `lib/data/dashboard.ts` | Stats, listings table rows, activity, chart series |
| `lib/server-banner.ts` | Per-slug cinematic SVG banner data-URLs |
| `lib/types.ts` | Shared TypeScript models |
| `lib/format.ts` | `formatCount` (null-safe), `initials`, `bannerStyle` (cards) |

### Server listing cards (Explore + Servers)

- Wider shell (max **1600px**), tighter padding  
- Grid 1/2/3 with 20–24px gaps  
- Card radius ~**15px**, banner ~**13px**, icon rounded square ~**13px**  
- Join button **compact** (not full-width)  
- View → `/server/{id}`  
- Join → toast mock  

### Server detail page (`/server/[slug]`) — accepted design

**Hero**

- Tall sharp banner from `getServerBannerUrl`  
- Tiny bottom fade into `--page-bg` only  
- Avatar overlaps banner edge; title/meta/actions below  
- Actions: **Like** (+ count) · Copy Invite · Join · More  
- No Save/Bookmark  

**Left**

- About (description only)  
- Atmosphere  
- What you can do here  
- Community Highlights  
- FAQ  

**Right**

- Server Stats (members, online, growth, join clicks) + Server Details (Created, Region) with **plain icons** (no square backgrounds)  
- Owner / Staff  
- Trust & Safety  
- Similar Servers  
- Sticky join CTA  

**Explicitly removed from server detail**

- Reviews / review score / write review  
- Rules  
- Gallery / screenshots  
- Likes metric inside Server Stats (kept only on Like button)  

### Known good interactions

- Theme toggle  
- Filters / verified switch (after Checkbox/Switch composition fix)  
- Copy invite toast  
- Like toggle + count + toast  
- Report modal  
- Dashboard delete/preview modals  
- Create listing draft/publish toasts + live preview  

## Important architectural decisions

1. **Mock-first** — no backend; keep UX dense and interactive.  
2. **HeroUI v3 compound components** — follow Content/Control patterns.  
3. **LinkButton** helper for navigation styled as buttons.  
4. **Server banners** are generated SVG scenes, not flat gradients.  
5. **Dashboard new listing** uses Button tab strip to avoid Tabs.Indicator SharedElement crash.  
6. **Windows path case** — `/Explore` handled in `proxy.ts`, not next.config redirects.  

## Assets

- `public/artworkdark1.png` — explore dark hero artwork  
- Light explore hero uses CSS gradients (no light artwork file found)  

## Build status

`npm run build` has succeeded with static generation for server slugs (when last verified during this workstream). Re-run after large changes.

## What is NOT built yet

- Bot detail page `/bots/[slug]`  
- Production Discord auth/session persistence, real invites, and uploads
- Real search/backend  
- Categories or Leaderboard product pages  
- Full visual QA automation  

See `TODO_NEXT.md` for prioritized remaining work.  
See `AI_WORKLOG.md` for how we got here (including fixed bugs — do not re-open them as fresh tasks).  
