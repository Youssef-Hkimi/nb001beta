# Nexbiy — Next Work

## Do not redo

These are shipped and should only change when the user reports a specific regression:

| Completed behavior | Owner files/areas |
|---|---|
| Public rebrand from Nexus to Nexbiy | UI copy, metadata, package/docs |
| Legacy internal keys preserved for compatibility | `nexus-*` CSS/storage/cookies/env names, logo filename, historical slug |
| Theme-aware rotating Explore artwork and bottom blend | `components/explore/hero-section.tsx`, `app/globals.css` |
| Explore Browse More loads four servers at most; no Show All action | `app/explore/page.tsx` |
| Sharp server/bot banners with smooth light/dark fade and no fog | detail/preview components, `app/globals.css` |
| Votes terminology with thumbs-up icon and six-hour cooldown | public listing views and dashboard metrics |
| Server pages contain no reviews/gallery/rules/FAQ/highlights/contact-owner | server detail |
| Bot detail route and bot preview | `/bots/[slug]`, bot components |
| Global formatted descriptions and opt-in expanded preview | listing create/edit components |
| Banner crop/fallback color/icon color suggestion | listing media controls |
| Discord OAuth test login and guild icon import | auth API routes, login/listing flow |
| Server ID and widget verification/skip/retry/reminder flow | widget API and listing modals |
| My Servers Overview/Analytics/Status | creator dashboard |
| My Bots developer controls and full edit/delete flow | creator dashboard |
| Dashboard/Public Rewards and referral receiver mock | rewards/referral components/routes |
| Dense mock admin control center | `/admin` |
| Top-center toasts, stable close-only publish modal | providers and listing flow |
| HeroUI compound-component fixes | Switch/Checkbox/Dropdown/Tabs patterns |

## Next product work

### 1. Production data foundation

- Connect Supabase/Postgres (or the final chosen database) for users, listings, listing media, votes, reports, notifications, referrals, moderation, and audit logs.
- Define migrations, row-level security, indexes, retention, and backup/restore.
- Keep mock adapters available until each real feature is migrated safely.

### 2. Production authentication

- Replace local test sessions with durable encrypted sessions.
- Rotate the exposed test Discord secret before any public deployment.
- Validate OAuth state/PKCE, callback origins, token refresh/revocation, ownership permissions, and logout.
- Add admin/staff RBAC, scoped moderator roles, 2FA, recovery, and audit events.

### 3. Listing persistence and media

- Persist draft/publish/edit/delete/status workflows.
- Add storage/CDN uploads with MIME/size checks, image optimization, crop metadata, and cleanup.
- Validate Discord guild ownership and invite URLs server-side.
- Schedule safe guild/widget synchronization with rate limits and retry/backoff.

### 4. Votes and discovery ranking

- Persist six-hour vote windows atomically.
- Prevent duplicate/self-abuse with account, listing, IP/device-risk, and rate-limit signals.
- Define transparent ranking inputs for relevance, freshness, votes, safety, and featured placement.
- Never allow unlogged manual vote changes outside protected staff workflows.

### 5. Rewards and referral integrity

- Persist referral attribution once per user.
- Enforce qualification rules, 10-point daily application limit, ledgers, idempotency, reversals, and cooldowns.
- Detect self-referrals, multi-account abuse, suspicious devices/IPs, and burst patterns.
- Require staff reason + audit entry for balance adjustments or suspensions.

### 6. Moderation and trust

- Persist reports, review queues, evidence, notes, severity, assignees, escalations, and appeals.
- Add server-side authorization for every admin action.
- Require 2FA/re-authentication for destructive actions.
- Add moderation notifications, policy templates, and immutable audit logs.

### 7. Analytics and notifications

- Replace demo metrics with event ingestion for impressions, page views, invite clicks, votes, referrals, and conversions.
- Keep Members Left and Removed Servers hidden/Coming Soon until reliable data exists.
- Add export jobs, time zones, bot filtering, and privacy retention.
- Connect inbox notifications and global announcements; add email only after consent/preferences.

### 8. Deployment and operations

- Configure Vercel project/environment variables and production callback URLs.
- Add Supabase production/staging projects if chosen.
- Add CI for typecheck, lint, tests, build, migration checks, and dependency/security review.
- Add monitoring, structured logs, error reporting, health checks, rate limits, WAF, and incident runbooks.
- Test accessibility, responsive layouts, performance, SEO, OpenGraph, and browser compatibility.

## Session workflow

1. Read `AGENTS.md`, `PROJECT_CONTEXT.md`, `DESIGN_SYSTEM.md`, `CURRENT_STATE.md`, this file, and `AI_WORKLOG.md`.
2. Check the Do not redo table before coding.
3. Make minimal scoped changes and preserve legacy compatibility identifiers.
4. Use HeroUI v3 patterns and read the installed Next.js guide before API changes.
5. Run `npx tsc --noEmit`; run `npm run build` for release/deployment work.
6. Update these docs and push to `git@github.com:Youssef-Hkimi/nb001.git` after major milestones.
