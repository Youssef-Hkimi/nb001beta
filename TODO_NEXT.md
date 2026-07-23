# Nexbiy — Next Work

## Do NOT redo these (already shipped & accepted)

The following were requested earlier and are **already implemented with good results**.  
**Do not re-implement or “fix” them unless the user reports a regression.**

| Item | Where it lives |
|------|----------------|
| Server detail banner: sharp, no heavy blur/fog, tiny theme-aware bottom fade | `globals.css` (`.server-hero-banner`), `lib/server-banner.ts`, `server-detail-view.tsx` |
| Server listing cards wider + less rounded (card/banner/icon) | `globals.css` (`.server-listing-*`), `server-card.tsx`, explore/server grids |
| Compact Join button on cards | `server-card.tsx` |
| Like instead of Save/Bookmark on server detail | `server-detail-view.tsx` |
| Server Stats: members/online/growth/join clicks; **no** likes metric, **no** review score | `server-detail-view.tsx` |
| Server Details: Created + Region with **simple icons** (no square backgrounds) | `server-detail-view.tsx` |
| No server reviews / gallery / rules on server detail | removed from detail view + data model |
| Checkbox/Switch working (HeroUI Content wrapping Control) | `listing-filters.tsx`, server/bots pages, create form |
| Dropdown without nested Button | listings table + server detail |
| Dashboard new listing without Tabs.Indicator crash | button tab strip in `dashboard/new/page.tsx` |
| Categories/Leaderboard removed from nav; Trending Tags removed from explore | navbar + explore sidebar |

If the user asks to “fix banner fog” or “make cards wider” again, first **verify current code** — these are already done.

---

## Real remaining / next product tasks

### High value (product completeness)

1. **Bot detail page** — `/bots/[slug]`
   - Mirror server detail quality
   - Include **gallery / screenshot previews** (allowed on bots; not on servers)
   - Wire bot card **View** → detail route
   - Invite / Vote / View actions stay distinct

2. **Bot create-form gallery**
   - Already has upload placeholders on `/dashboard/new`
   - Later: live preview of mock gallery for bots only

3. **Server/bot public consistency**
   - Shared patterns for hero, sidebar, trust, similar items
   - Keep server rules: no gallery/reviews on servers

4. **Polish empty/loading states**
   - Ensure bot listing skeleton matches server listing grid classes if desired

### Medium

5. **Accessibility pass**
   - Dropdown PressResponder warnings if still present
   - Focus order on server hero actions

6. **Search behavior**
   - Navbar search currently decorative — wire to `/server` or `/bots` query params

7. **Explore light-mode artwork**
   - Add real light banner asset if user provides one; currently CSS gradient

### Later / backend (out of current mock scope)

8. Production-grade Discord OAuth persistence (the local test flow is implemented)
9. Real invite validation  
10. Real image uploads / CDN  
11. Persistence for likes, listings, reviews (if product wants reviews later — **not** on servers for now)

---

## How to take tasks in a new session

1. Read `PROJECT_CONTEXT.md`, `DESIGN_SYSTEM.md`, `CURRENT_STATE.md`, this file, `AI_WORKLOG.md`.  
2. Confirm the user request is not already completed (table above).  
3. Make **minimal, scoped** changes — do not redesign the whole site.  
4. Prefer HeroUI components and follow composition rules in `DESIGN_SYSTEM.md`.  
5. Run `npm run build` or at least `npx tsc --noEmit` after non-trivial edits.  
6. Dev server: `npm run dev -- -p 3010` if 3000 is busy.  
