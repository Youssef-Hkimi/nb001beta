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
| Live review status separated from staff-awarded Safe reputation badge | listing status UI, public cards/details, `/admin` |
| Top-center toasts, stable close-only publish modal | providers and listing flow |
| HeroUI compound-component fixes | Switch/Checkbox/Dropdown/Tabs patterns |

## Next product work

### 1. Beta environment and first admin

- Rotate the Discord client secret exposed during development.
- Add `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SESSION_HASH_SECRET`, `ADMIN_MFA_ENCRYPTION_KEY`, and the rotated Discord values to local/Vercel environments.
- Add the final Vercel callback URL in the Discord Developer Portal.
- Set `SUPER_ADMIN_DISCORD_IDS` to the owner's Discord user ID, redeploy, then sign out and back in once to bootstrap the reviewed super-admin record.
- Complete the in-app authenticator setup before using protected actions.

### 2. Remaining live UI wiring

- Finish real bot gallery uploads and richer creator edit media management.
- Add notification inbox reads/mark-read and global announcement publishing UI.
- Replace the lower-priority rewards-risk, moderator-roster, support-ticket, and health presentation placeholders with dedicated live endpoints.

### 3. Launch operations

- Add CI for typecheck, lint, tests, build, migrations, and dependency review.
- Add monitoring, structured logs, error reporting, health checks, rate limits, WAF, and incident runbooks.
- Test accessibility, responsive layouts, performance, SEO, OpenGraph, and browser compatibility.

## Session workflow

1. Read `AGENTS.md`, `PROJECT_CONTEXT.md`, `DESIGN_SYSTEM.md`, `CURRENT_STATE.md`, this file, and `AI_WORKLOG.md`.
2. Check the Do not redo table before coding.
3. Make minimal scoped changes and preserve legacy compatibility identifiers.
4. Use HeroUI v3 patterns and read the installed Next.js guide before API changes.
5. Run `npx tsc --noEmit`; run `npm run build` for release/deployment work.
6. Update these docs and push only to `git@github.com:Youssef-Hkimi/nb001beta.git` after beta milestones.
