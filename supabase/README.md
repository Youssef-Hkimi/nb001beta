# Nexbiy beta database

This directory is the source of truth for the Nexbiy beta Supabase schema.

- Project ref: `poktkgkwktooexvtlqhs`
- Region: `eu-west-1`
- Production data is never seeded from the mock demo.
- All public tables use Row Level Security.
- Browser clients receive only the publishable key.
- The Supabase secret key is server-only and must be stored in local/Vercel environment variables.
- Destructive admin operations require role checks, an explicit confirmation, a fresh MFA challenge, and an audit record.

Apply migrations in timestamp order. After every schema change, run both Supabase security and performance advisors.
