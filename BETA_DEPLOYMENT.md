# Nexbiy beta deployment

## Required private environment values

Set these locally in `.env.local` and in Vercel for Preview and Production:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` — Supabase server secret; never a publishable/anon key
- `SESSION_HASH_SECRET` — independent random secret, at least 32 characters
- `ADMIN_MFA_ENCRYPTION_KEY` — separate random secret, at least 32 characters
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET` — rotate the previously exposed test secret before deployment
- `DISCORD_REDIRECT_URI`

Never prefix server secrets with `NEXT_PUBLIC_` and never commit `.env.local`.

## Owner actions required

1. Rotate the Discord client secret.
2. Copy the Supabase server secret from Project Settings → API Keys.
3. Add the eventual Vercel callback URL to Discord OAuth redirects.
4. Log in once through Discord.
5. Promote the reviewed account to `super_admin` and create its matching `staff_members` record.
6. Enroll TOTP before using destructive admin actions.

## Release checks

```bash
npx tsc --noEmit
npm audit --omit=dev
npm run build
```

The Supabase migrations in `supabase/migrations` are the source of truth. The mock backup repository is `nb001`; never push beta migrations or secrets there.
