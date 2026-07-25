alter table public.profiles
  add column socials jsonb not null default
    '{"x":"","github":"","roblox":""}'::jsonb;
