<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nexbiy agent instructions

You are working on **Nexbiy**, a Discord server/bot discovery and creator-rewards demo.

## Read these first (in order)

1. `PROJECT_CONTEXT.md` — product vision and routes  
2. `DESIGN_SYSTEM.md` — colors, HeroUI rules, banner/card rules  
3. `CURRENT_STATE.md` — what already exists  
4. `TODO_NEXT.md` — real next work + **do-not-redo** completed items  
5. `AI_WORKLOG.md` — past failures and permanent fixes  

## Non-negotiables

- **HeroUI v3** components for UI; `lucide-react` for general UI icons; Iconify only for branded/platform icons; **no emoji UI icons**
- Soft dark mode (`#2D2E33` / `#323339`), brand `#629BF8` / `#82B0F9`
- Mock data by default. The only live test integrations currently in scope are Discord OAuth and Discord widget verification.
- Minimal scoped changes — do not rebuild the whole site
- Server detail: **no** reviews, gallery, rules, FAQ, Community Highlights, or Contact Owner
- The public engagement term is **Vote**, using the existing thumbs-up icon. Do not reintroduce Like or Save wording.
- Verified badges are awarded by Nexbiy, never selected by listing owners.
- Banners stay sharp with a small, smooth, theme-aware bottom fade. Never add blur or a foggy middle band.
- Checkboxes/Switches: Control **inside** Content
- Never nest `Button` inside `Dropdown.Trigger`
- Avoid `Tabs.Indicator` (SharedElement crash) unless transition provider is configured
- Use `LinkButton` for navigation-as-button
- Events and update toasts appear at **top center**
- Destructive admin actions require an explicit confirmation; production versions also require RBAC and 2FA

## Compatibility rules

- The public brand is **Nexbiy**.
- Legacy internal identifiers intentionally remain where renaming would break saved data or URLs: `nexus-*` CSS utilities, existing localStorage/cookie names, OAuth environment names, `/nexus-logo.jpg`, and the historical `nexus-hub` slug.
- Do not mechanically rename those compatibility identifiers without a migration.
- Before changing Next.js APIs, read the matching guide in `node_modules/next/dist/docs/`.

## Commands

```bash
cd /Users/yobbiy/Documents/NexusEdits
npm run dev -- -p 3010
npx tsc --noEmit
npm run build
```

## Backup repository

- SSH remote: `git@github.com:Youssef-Hkimi/nb001.git`
- Local remote name: `nexbiy`
- The current working branch is backed up to `nexbiy/main`.
