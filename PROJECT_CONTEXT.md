# Nexbiy — Project Context

## Vision

**Nexbiy** is a polished demo of a **Discord server and bot discovery platform**.

It should feel like:

- **Top.gg** (bot/server listing marketplace)
- **Discord Explore** (discovery and browsing)
- **Product Hunt / modern creator marketplace** (alive, clickable, not empty SaaS)

It is a **front-end product demo** with **mock data only** for now. No real Discord OAuth, no real invites, no real uploads. Interactions (toasts, modals, filters, likes) must still feel production-ready.

## Stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| UI library | **HeroUI React v3** (`@heroui/react` + `@heroui/styles`) |
| Theme | **next-themes** (`class` strategy on `<html>`) |
| Icons | **lucide-react only** — **never emojis as UI icons** |
| Data | Mock modules under `lib/data/` |

### Project location

```
C:\Users\noste\nexus
```

### Run locally

```bash
cd C:\Users\noste\nexus
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
| `/dashboard` | Creator dashboard (stats, listings table, activity) |
| `/dashboard/new` | Create server or bot listing (form + live preview) |

There are **no** dedicated Categories or Leaderboard pages (removed from nav).

## Product pillars

1. **Discover** — Explore, browse servers, browse bots  
2. **Inspect** — Open a real-feeling public server profile  
3. **List** — Dashboard + create-listing flow for owners  
4. **Feel alive** — Hover, filters, skeletons, modals, toasts, light/dark  

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
