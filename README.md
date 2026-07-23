# Nexbiy

Discord **server & bot discovery** demo — Next.js 16, TypeScript, Tailwind CSS v4, HeroUI v3.

## Docs for humans & AI

| File | Purpose |
|------|---------|
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | Product vision & routes |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | UI rules, colors, banner/card system |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | What’s built |
| [TODO_NEXT.md](./TODO_NEXT.md) | Next tasks (and completed-item lock) |
| [AI_WORKLOG.md](./AI_WORKLOG.md) | History of changes & bug fixes |
| [AGENTS.md](./AGENTS.md) | Agent rules |

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev -- -p 3010
```

Set `MONGODB_URI` in `.env.local` to enable shared Discord widget caching. Successful
widget checks are cached briefly; publishing and retrying always perform a fresh Discord check.

Open http://localhost:3010

## Main routes

- `/explore` — discovery landing  
- `/server` — server listings  
- `/server/[slug]` — server profile  
- `/bots` — bot listings  
- `/bots/[slug]` — bot profile
- `/login` — Discord login
- `/verification` — verification requirements
- `/rewards` — public referral rewards
- `/ref/[slug]` — referral receiver
- `/dashboard` — creator dashboard
- `/dashboard/new` — create listing  
- `/admin` — mock staff control center

## Backup

The project backup remote is `git@github.com:Youssef-Hkimi/nb001.git` (local remote name: `nexbiy`).
Root handoff documents are the durable project memory; update them before major backup pushes.
