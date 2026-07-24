# Nexbiy — AI Worklog

Chronological record of major work, failures, and fixes.  
**Purpose:** new chats should learn from past mistakes instead of repeating them.

---

## 2026-07-09 — Project bootstrap

### Done
- Scaffolded Next.js App Router + TypeScript + Tailwind v4 at `C:\Users\noste\nexus`
- Installed `@heroui/react`, `@heroui/styles`, `next-themes`, `lucide-react`
- Workspace was `system32` initially — project correctly lives under user home `nexus`
- Copied dark explore artwork → `public/artworkdark1.png`
- Built mock-data-driven pages: explore, server list, bots, dashboard, create listing
- Design tokens for light + soft charcoal dark in `app/globals.css`
- Shared navbar, theme toggle, toasts

### Issues
- HeroUI **has no Navbar component** in v3 → custom sticky shell with HeroUI pieces
- Unix install script not used on Windows; npm install used instead

---

## Explore polish

### Done
- Explore hero with theme-aware artwork layer + bottom fade
- Featured server cards + right sidebar (Top Bots, CTA)
- Category chips

### Later change (by request)
- **Removed** Trending Tags card from explore sidebar
- **Removed** Categories + Leaderboard from navbar

---

## HeroUI control bugs (checkboxes / switches)

### Failure
- Switches and checkboxes appeared broken / “stuck”

### Root cause
HeroUI v3.2 composition: `Switch.Control` / `Checkbox.Control` are **not** the clickable hit target.  
`Switch.Content` / `Checkbox.Content` is the pressable control.

### Fix
Wrap Control (and Indicator/Thumb) **inside** Content.  
Updated `listing-filters.tsx`, `/server`, `/bots`, create-listing switches.

### Lesson
Always follow HeroUI LLM docs for compound forms. Do not invent v2-style single-node Checkbox/Switch APIs.

---

## Dropdown hydration crash (dashboard)

### Failure
```
<button> cannot be a descendant of <button>
```
on Create Listing navigation / listings table more menu.

### Root cause
`Dropdown.Trigger` already renders a `<button>`; nested HeroUI `Button` inside it.

### Fix
Style `Dropdown.Trigger` with button BEM classes; put icon only as children.

### Lesson
Never nest Button inside Dropdown.Trigger.

---

## Create listing crash (Tabs.Indicator)

### Failure
```
<SharedElement> must be rendered inside a <SharedElementTransition>
```
at `/dashboard/new` on `Tabs.Indicator`.

### Fix
Replaced HeroUI Tabs + Indicator with a **Button tab strip** (Server Listing / Bot Listing).  
Live preview and forms preserved.

### Lesson
Avoid `Tabs.Indicator` unless SharedElement transition is fully set up.

---

## Link + Button typing issues

### Failure
Type errors using `Button render={(props) => <Link {...props} href=.../>}`.

### Fix
`components/ui/link-button.tsx` using `useRouter().push`.

---

## `/Explore` redirect loop (Windows)

### Failure
`next.config` redirect `/Explore` → `/explore` looped (case-insensitive matching).

### Fix
Removed redirect from next.config; use **`proxy.ts`** with case-sensitive path match for `/Explore`.

---

## Server detail page (major feature)

### Done
- Route `/server/[slug]` with SSG params
- View buttons from explore/server cards navigate to detail
- Rich detail layout: hero, about, features, sidebar, similar servers, modals

### Evolution of product requirements (accepted final)

1. **About** = description only (metadata moved out)  
2. **Server Stats** sidebar = metrics + Created/Region  
3. **Like** replaces Save/Bookmark  
4. **No** reviews, gallery, rules on server detail  
5. **No** likes count inside Server Stats (only on Like button)  
6. Server detail icons for Created/Region = **plain icons**, no square chips behind them  

### Data model
- `lib/types.ts` + `lib/data/server-details.ts`  
- Fields: `likes`, `isLiked`, `createdAt`, `region`, atmosphere, features, highlights, faq, trust  

---

## Server banner white fog (multiple iterations)

### Failures
- Banner looked like a washed gradient / white foggy band  
- Overlays too tall, mid-opacity white stops  
- Content sitting inside fade  
- SVG art itself had bright bottom “horizon” wash  

### What did NOT work well enough alone
- Tall fade (`min(28%, 130px)`)  
- Gradients with `rgba(255,255,255,0.55)` mid stops  
- Large negative margin pulling profile into overlay  

### Final accepted approach
1. **CSS**
   - `--page-bg` light `#fff` / dark `#2D2E33`
   - Banner height ~420px, cover/center, no blur/opacity wash
   - `::after` only **~56px**: `transparent → var(--page-bg)` (no white mid-stops)
   - Profile section on solid `--page-bg`, `margin-top: 0`
   - Only avatar uses negative margin to overlap banner edge
2. **Art**
   - `lib/server-banner.ts` cinematic SVG per slug
   - Darker bottom terrain; no pale bottom wash
   - Lofi-specific cozy palette

### Lesson
Banner problems can be **CSS overlay + illustration composition**. Fix both.  
**Do not reintroduce** white mid-stops, backdrop-blur, or tall fades.

### formatCount crash during banner work
- `formatCount(undefined)` when likes missing  
- Guarded in `lib/format.ts` + safer likes init/merge in server-details  

---

## Server listing card layout polish

### Request
Wider, more premium cards; less rounding; match marketplace references.

### Done
- `.server-listing-shell` max-width **1600px**, tighter padding  
- `.server-listing-grid` 1/2/3 cols, 20–24px gaps  
- Card radius **~15px**, banner **~13px**, icon **~13px** rounded square  
- Slightly taller card banner  
- Soft hover border  
- Join button width reduced (no `flex-1`)  

### Scope discipline
Only listing cards/grid — not navbar, not filters redesign, not bots cards unless requested.

---

## Dev server notes

- Prefer `npm run dev -- -p 3010` when 3000 occupied  
- Kill stale Next processes if “another next dev server is already running”  
- Next 16 may warn middleware → proxy; project uses `proxy.ts`  

---

## Session handoff principles for next AI

1. Read all root `*.md` docs before coding.  
2. Prefer **minimal diffs**; do not redesign completed pages.  
3. Check `TODO_NEXT.md` “Do NOT redo” table first.  
4. Use HeroUI correctly (Content wrappers, no nested dropdown buttons).  
5. Preserve soft dark mode and brand blues.  
6. Server pages: no gallery/reviews/rules; bots may have gallery later.  
7. Banner: sharp + tiny fade only.  
8. After changes: typecheck/build and smoke the touched routes.  

---

## 2026-07-22 — Rewards referral demo + verified badge hydration fix

### Rewards dashboard

- Added a mock-only **Rewards** dashboard section with a referral-program setup agreement.
- Product wording is **Growth Points**, not Growth Credits.
- Agreement confirms a maximum of 10 Growth Points can be applied each day and warns against referral abuse.
- After setup, the page provides Referral and Tracking tabs, a copyable referral link, selectable mock server rewards, daily point limits, and mock referral activity.
- The falling gift effect uses the supplied Cloudinary WebP, grows during setup transition, fades away afterward, and can be toggled from the page header.
- Particle density and transformation size remain intact; rendering snapshots the WebP into a lightweight canvas sprite for smoother motion.

### Verified badge hydration error

- HeroUI `Tooltip.Trigger` renders a `div` by default, but `VerifiedBadgeIcon` is frequently used inside paragraph text.
- This created invalid `p > div` HTML and a React hydration error.
- Permanent fix: render the shared tooltip trigger as an inline `span` in `components/ui/verified-badge-icon.tsx`.

---

## 2026-07-23 — Nexbiy rebrand and durable project handoff

### Public rebrand

- Changed the visible product name from **Nexus** to **Nexbiy** across navigation, metadata, login, discovery, verification, rewards, admin, dashboard, mock copy, and package metadata.
- Kept legacy internal identifiers where changing them would break compatibility: `nexus-*` CSS classes/tokens, existing storage/cookie names, OAuth environment names, `/nexus-logo.jpg`, and the historical `nexus-hub` slug.
- Permanent rule: public copy is Nexbiy; internal identifiers require an explicit migration rather than a global search/replace.

### Discovery and listing polish

- Explore now uses synchronized light/dark artwork pairs and rotates them every 15 minutes.
- Server and bot detail/preview banners use a sharp image plus a smooth theme-aware overlay. Do not reintroduce masks that create a foggy light band.
- Fixed card tag/action alignment, More trigger sizing, responsive menu behavior, and imported bot/server icon previews.
- Verification badges use the shared stroke icon with an inline-safe tooltip containing only “Verified”.

### Listing workflow and Discord integration

- Added local-test Discord OAuth2 with `identify` and `guilds`; imported guilds include their Discord icons.
- Server ID is required for server publishing.
- Manual widget verification performs a cache-busted Discord request, distinguishes disabled widgets from missing invite channels, and leaves background reads cache-safe.
- Widget-disabled owners can watch the setup video, retry, or skip after confirmation. Skipped listings remain live with active members temporarily matching total members and a persistent compact reminder.
- Publish-success and verification dialogs are controlled overlays to prevent flicker. Publish-success dialogs close only with X unless navigation intentionally changes route.
- Required-field failures now focus/scroll to the field and highlight it, rather than showing only a generic alert.

### Dashboard and engagement

- Platform engagement terminology is now **Votes**, with the existing thumbs-up icon and six-hour cooldown.
- My Servers includes Overview, Analytics, and Status; Members Left is explicitly Coming Soon.
- My Bots has developer controls, full edit/delete/refresh interactions, optional support server URL, and no Successful Installations metric. Removed Servers is Coming Soon.
- Settings keep Discord identity read-only while allowing a short bio, X/GitHub/Roblox links, and inbox preferences.
- Events and update toasts appear at top center.

### Rewards and referrals

- Added Dashboard Rewards setup, agreement, referral link, tracking, daily countdown, listing target, and activity table.
- Product term is **Growth Points**; maximum applicable amount is 10 per day.
- Added public `/rewards` and receiver `/ref/[slug]` mock flows.
- Gift rain uses the supplied Cloudinary WebP across the full viewport, supports smooth mouse repulsion after refresh/toggle, and can be disabled. Current public effect is not drag-and-drop.
- Mock receiver flow awards 10 Growth Points after an accepted referral login and allows only one referral attribution.

### Admin control center

- Added a dense mock `/admin` dashboard for overview analytics, moderation urgency, listings, users, reports, pending review, rewards risk, featured placement, moderators, support, announcements, health, and audit logs.
- Featured listings use search rather than a fixed select.
- Manual staff vote adjustment is capped at +10 and marked as 2FA-protected.
- User Hammer actions and custom staff notifications expose multiple moderation simulations.
- Permanent production rule: authorization must be enforced server-side; destructive actions require RBAC, re-authentication/2FA, a reason, and an audit record.

### Backup state

- Accumulated product work and rebrand were committed as `5333a24` and pushed over SSH to `git@github.com:Youssef-Hkimi/nb001.git` on `main`.
- Root handoff documents were refreshed immediately afterward so future ChatGPT/Codex tasks can recover without conversation memory.
- Local remote name is `nexbiy`; the working branch tracks `nexbiy/main`.

---

## 2026-07-24 — Final mock-demo checkpoint

- Explore Browse More now loads at most four additional servers per action.
- Removed the bulk “Show all remaining” action so the Explore page cannot suddenly render the full catalog.
- Kept the full server catalog link for users who want unrestricted browsing.
- This checkpoint is the preserved mock-first state before Nexbiy begins its full-stack production migration.
