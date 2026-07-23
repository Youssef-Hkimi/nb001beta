# Nexbiy — Project Context

## Vision

**Nexbiy** is a polished demo of a **Discord server and bot discovery platform**.

It should feel like:

- **Top.gg** (bot/server listing marketplace)
- **Discord Explore** (discovery and browsing)
- **Product Hunt / modern creator marketplace** (alive, clickable, not empty SaaS)

It is still a **mock-first product demo**, but it includes a local test Discord OAuth flow (`identify` + `guilds`) and live Discord widget verification. Listings, analytics, moderation, rewards, votes, notifications, and admin data remain mocked. Interactions must still feel production-ready.

## Stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| UI library | **HeroUI React v3** (`@heroui/react` + `@heroui/styles`) |
| Theme | **next-themes** (`class` strategy on `<html>`) |
| Icons | **lucide-react** for general UI; Iconify for branded/platform icons; never emojis as UI icons |
| Data | Mock modules under `lib/data/` |

### Project location

`/Users/yobbiy/Documents/NexusEdits`

### Run locally

```bash
cd /Users/yobbiy/Documents/NexusEdits
npm run dev -- -p 3010
```

(Port **3010** is preferred if 3000 is taken by another project.)

### Production check

```bash
npm run build
```

## Product routes

| Route | Purpose |
|--------|---------|
| `/` | Redirects to `/explore` |
| `/explore` | Main discovery landing (hero + featured servers + sidebar) |
| `/Explore` | Case-sensitive redirect → `/explore` via `proxy.ts` |
| `/server` | Server catalog only (filters + grid + pagination) |
| `/server/[slug]` | Public server detail / profile page |
| `/bots` | Bot catalog only (filters + grid + pagination) |
| `/bots/[slug]` | Public bot detail / profile page |
| `/login` | Discord-only login |
| `/verification` | Server and bot verification requirements |
| `/rewards` | Public rewards explanation and Discord login CTA |
| `/ref/[slug]` | Mock referral receiver and reward-claim flow |
| `/dashboard` | Creator dashboard: Overview, My Servers, My Bots, Rewards, Settings |
| `/dashboard/new` | Create server or bot listing (form + live preview) |
| `/admin` | Mock staff control center for listings, users, reports, rewards, reviews, and platform health |

There are **no** dedicated Categories or Leaderboard pages (removed from nav).

## Product pillars

1. **Discover** — Explore, browse servers, browse bots  
2. **Inspect** — Open a real-feeling public server profile  
3. **List** — Dashboard + create-listing flow for owners  
4. **Reward growth** — referrals, Growth Points, votes, and transparent cooldowns
5. **Operate safely** — verification, reports, moderation queues, roles, and protected admin actions
6. **Feel alive** — hover, filters, skeletons, modals, toasts, motion, and light/dark

## HeroUI is mandatory

- Prefer HeroUI for UI: `Button`, `Card`, `Chip`, `Avatar`, `SearchField`, `Select`, `Switch`, `Checkbox`, `Table`, `Modal`, `Dropdown`, `Drawer`, `Toast`, `Skeleton`, `Pagination`, form fields, etc.
- Do **not** rebuild UI from raw divs when HeroUI has a component.
- Follow HeroUI v3 **compound** APIs (e.g. `Card.Header`, `Modal.Backdrop`, `Switch.Content`).
- Read HeroUI LLM docs when unsure:  
  - https://heroui.com/react/llms.txt  
  - https://heroui.com/react/llms-components.txt  
  - https://heroui.com/react/llms-patterns.txt  

## Important related docs

| File | Purpose |
|------|---------|
| `DESIGN_SYSTEM.md` | Colors, radii, banner rules, motion |
| `CURRENT_STATE.md` | What exists right now |
| `TODO_NEXT.md` | Real remaining work (not already-done items) |
| `AI_WORKLOG.md` | History of fixes, failures, and why |
| `AGENTS.md` | Agent rules (Next.js 16 + doc pointers) |

## Design ethos

- Premium discovery product, not generic SaaS landing page  
- Soft dark mode (charcoal, not pure black)  
- Brand blue accents  
- Wide listing cards, clean server profiles  
- Sharp server banners with **tiny** theme-aware bottom fade only  
- Clear creator tooling without exposing internal/admin-only metrics
- Public engagement is called **Votes** and uses the thumbs-up icon

## Integration boundary

- Discord OAuth and guild import are local test integrations, not production authentication.
- Discord widget checks are live and cache-busted only on manual publish/retry requests.
- Production persistence, file storage, rate limiting, RBAC/2FA, analytics, notifications, and anti-abuse are not connected yet.
- Never commit OAuth secrets or `.env.local`.
