# Nexbiy — Current State

**Last updated:** 2026-07-23
**Project path:** `/Users/yobbiy/Documents/NexusEdits`
**Stack:** Next.js 16.2.10, React 19, TypeScript, Tailwind CSS 4, HeroUI 3, next-themes, lucide-react, Iconify

## Product state

Nexbiy is a high-fidelity Discord server/bot discovery demo. It remains mock-first, with two live local-test integrations:

1. Discord OAuth2 (`identify` + `guilds`) for login and importing manageable guilds.
2. Discord’s official server widget endpoint for publish-time online-member verification.

Everything else—including listings persistence, analytics, votes, referrals, moderation, notifications, and admin actions—is interactive mock data.

## Routes

| Route | State | Purpose |
|---|---|---|
| `/` | Done | Redirects to `/explore` |
| `/explore` | Done | Discovery hero, rotating theme artwork, categories, featured listings, sidebar, CTA, footer |
| `/server` | Done | Server catalog with filters, search, sort, pagination |
| `/server/[slug]` | Done | Public server profile |
| `/bots` | Done | Bot catalog |
| `/bots/[slug]` | Done | Public bot profile |
| `/login` | Done | Discord-only OAuth test login |
| `/verification` | Done | Server/bot eligibility, animated examples, three-step process |
| `/rewards` | Done | Public referral-rewards explanation for logged-out users |
| `/ref/[slug]` | Done | Mock referral receiver and login/decline flow |
| `/dashboard` | Done | Overview, My Servers, My Bots, Rewards, Settings |
| `/dashboard/new` | Done | Create/edit-quality server and bot listing forms with live preview |
| `/admin` | Done (mock) | Staff control center with protected-action simulations |

## Global shell

- Public brand is **Nexbiy**; app/package metadata is updated.
- The logo asset remains `/nexus-logo.jpg` for compatibility.
- Sticky responsive header: Explore, Servers, Bots, Rewards when logged out, Dashboard when logged in, theme toggle, inbox, account/login.
- The old global search field is intentionally removed.
- Toasts appear at top center.
- Soft light/dark themes use `#2D2E33` / `#323339` and Nexbiy blue `#629BF8` / `#82B0F9`.
- Mobile navigation opens only at its intended breakpoint.

## Discovery and public listings

- Explore rotates `ChillDark/ChillLight` and `disdark/dislight` artwork pairs every 15 minutes.
- Artwork, category marquee, feature CTA, top-bot sidebar, verification promo, FAQ, and footer are theme-aware.
- Server/bot cards have fixed banner geometry, aligned tags, compact actions, and correctly sized More menus.
- Detail and preview banners are sharp with a smooth theme-aware bottom overlay; the prior foggy light band is removed.
- Server public pages exclude reviews, gallery, rules, FAQ, Community Highlights, and Contact Owner.
- Bot public pages may show bot-specific commands/features/gallery.
- Verified listings use the shared stroke badge with a **Verified** tooltip.

## Votes

- Platform terminology is **Vote**, not Like or Save.
- The thumbs-up icon remains the vote icon.
- A listing may be voted for again after a six-hour cooldown.
- The vote result modal explains the next available vote window.
- Counts and cooldown behavior are mock/local for now.

## Listing creation and editing

- Server and bot forms expose owner-editable listing fields only; Discord-derived counts/creation data are not editable.
- Description formatting is global across create/edit flows: bold, italic, heading, link, and bullet list.
- The expanded formatted preview is opt-in, not open by default.
- Missing required fields are scrolled into view, focused, and highlighted red.
- Live Listing Preview and Page Preview update as forms change.
- Server icon and 960×320 banner upload/crop previews sit side by side where possible.
- A fallback banner color can be chosen; icon upload suggests a matching color.
- Bot support server URL is optional.
- Verified status cannot be selected by owners.
- Publish success dialogs are controlled and close only via X unless a navigation action leaves the route.

## Discord OAuth and guild import

- Routes:
  - `/api/auth/discord`
  - `/api/auth/callback/discord`
  - `/api/auth/session`
  - `/api/auth/logout`
- OAuth scopes: `identify guilds`.
- Local redirect: `http://localhost:3010/api/auth/callback/discord`.
- Imported guilds include the Discord server icon.
- Sessions use local test storage/cookies and are not production-grade.
- OAuth secrets belong only in `.env.local`; never commit them.

## Discord widget verification

- Server ID is a required form field with explanatory help.
- Manual publish/retry checks call `/api/discord/server-widget`.
- The manual check cache-busts with `?t=${Date.now()}` and `cache: "no-store"`; this behavior is intentionally not used for page-load/background reads.
- Outcomes:
  - `200`: reads server name and `presence_count`.
  - `widget_disabled`: public widget is unavailable.
  - `widget_no_channel`: widget is enabled but no public invite channel is selected.
- The guide modal uses:
  - `https://res.cloudinary.com/zux0o0wz/video/upload/v1784559620/WIDGETGUIDE_vtxvge.mp4`
  - Text path: **Server Settings → Engagement → Widget**
- Owners may skip after a confirmation. The listing still publishes, active members temporarily equal total members, and a compact reminder persists.
- Verify Now lets the owner select the pending listing and retry the existing check.
- Optional MongoDB caching is supported for safe shared/background reads via `MONGODB_URI`.

## Creator dashboard

### Overview

- Summary metrics, performance chart, listings table, collapsible Tips & Getting Started, inbox, and verification promotion.
- Verification Learn More opens `/verification` in a new tab.
- Quick actions and table actions are fully clickable mock interactions.

### My Servers

- Tabs: Overview, Analytics, Status.
- Select, preview, edit, update invite, delete one/multiple, and status inspection.
- Analytics update per selected server.
- **Members Left** is labelled **Coming Soon**; no fake value is presented.

### My Bots

- Developer-focused controls for listing details, commands/features, links/integrations, and media/settings.
- Full edit flow, refresh, preview, public page, and multi-select delete confirmation.
- Successful Installations was removed.
- **Removed Servers** is labelled **Coming Soon**; no fake value is presented.

### Rewards

- Setup landing and referral-program agreement.
- Product term is **Growth Points**.
- Limit: up to 10 applicable Growth Points per day.
- Referral tab provides a copyable mock referral URL.
- Tracking tab includes clicks, countdown to the daily reset, available balance, listing reward target, and activity table.
- Gift rain uses the Cloudinary WebP, runs across the viewport, fades smoothly, supports mouse repulsion, and can be toggled.
- Rewards nav accent blends `#c0fc1c` and `#2596be`.

### Settings

- Discord username/display identity is read-only.
- Users can edit a short bio.
- Social fields: X, GitHub, Roblox with Iconify marks.
- Inbox notification preferences are interactive mock settings.

## Public referral flow

- `/rewards` explains the program and has a Discord login CTA.
- `/ref/[slug]` displays a receiver offer after three seconds.
- Accept continues to login; decline resumes normal browsing.
- Mock policy: one referral per user; qualified referrer and receiver each earn 10 Growth Points.
- The receiver confirmation directs the user to Dashboard → Rewards.

## Admin dashboard (mock)

`/admin` is intentionally dense and staff-oriented:

- Overview metrics, time ranges, traffic status, export simulation, moderation urgency queue, and quick controls.
- Listings: inspect/edit/status/verification/featured placement/pause/suspend/delete.
- Featured placement uses search, not a fixed select.
- Manual vote adjustment is capped at +10 and shown as 2FA-protected.
- Users: identity, role, status, listings, activity, history, Hammer action menu, freeze/notify/suspend/delete simulations.
- Staff notifications accept custom text.
- Reports: reporter, target, listing, reason, severity, notify, pass, dismiss.
- Pending Review: separate server/bot queue with inspect, accept, reject, and moderation notes.
- Rewards: points issued, referrals, balances, risk review, adjustment/suspension controls.
- Featured servers and recommended bots are managed separately.
- Moderators, limited permissions, support tickets, announcements, site health, and audit-log simulations.
- Permanent/destructive actions are documented as RBAC + 2FA requirements for production.

## Important compatibility decisions

- Public copy says Nexbiy.
- Legacy internal `nexus-*` CSS names, storage/cookie keys, OAuth environment names, logo filename, and `nexus-hub` slug remain intentionally.
- Do not rename them without a migration.
- Continue using Button tab strips where `Tabs.Indicator` would trigger SharedElement crashes.
- Keep `Switch.Control` / `Checkbox.Control` inside Content.
- Never nest a Button inside `Dropdown.Trigger`.

## Verification status

- Latest accumulated product changes were typechecked before the rebrand backup.
- Re-run `npx tsc --noEmit` after implementation changes.
- Use `npm run build` before deployment; production deployment is not configured yet.
