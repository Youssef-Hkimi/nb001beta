create extension if not exists pgcrypto;
create schema if not exists extensions;
create extension if not exists citext with schema extensions;

create type public.app_role as enum ('user', 'moderator', 'admin', 'super_admin');
create type public.account_status as enum ('active', 'suspended', 'deleted');
create type public.listing_type as enum ('server', 'bot');
create type public.listing_status as enum (
  'draft',
  'pending_review',
  'live',
  'paused',
  'suspended',
  'rejected',
  'deleted'
);
create type public.listing_visibility as enum ('public', 'unlisted', 'private');
create type public.widget_status as enum ('unverified', 'verified', 'disabled', 'missing_channel');
create type public.report_status as enum ('open', 'triaged', 'investigating', 'resolved', 'dismissed');
create type public.report_severity as enum ('low', 'medium', 'high', 'urgent');
create type public.referral_status as enum ('pending', 'qualified', 'rejected', 'reversed');

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  username extensions.citext not null,
  display_name text not null,
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 240),
  role public.app_role not null default 'user',
  status public.account_status not null default 'active',
  suspended_until timestamptz,
  notification_preferences jsonb not null default
    '{"listingUpdates":true,"voteMilestones":true,"announcements":true,"inbox":true}'::jsonb,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_username_key on public.profiles (lower(username::text));
create index profiles_role_status_idx on public.profiles (role, status);

create table public.discord_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  discord_user_id text not null unique check (discord_user_id ~ '^[0-9]{15,22}$'),
  discord_username text not null,
  discord_global_name text,
  discord_avatar_hash text,
  guilds_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);

create index sessions_user_active_idx on public.sessions (user_id, expires_at)
where revoked_at is null;

create table public.managed_guilds (
  user_id uuid not null references public.profiles(id) on delete cascade,
  discord_guild_id text not null check (discord_guild_id ~ '^[0-9]{15,22}$'),
  name text not null,
  icon_hash text,
  member_count integer not null default 0 check (member_count >= 0),
  presence_count integer not null default 0 check (presence_count >= 0),
  owner boolean not null default false,
  permissions bigint not null default 0,
  synced_at timestamptz not null default now(),
  primary key (user_id, discord_guild_id)
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  type public.listing_type not null,
  slug extensions.citext not null,
  discord_id text not null check (discord_id ~ '^[0-9]{15,22}$'),
  name text not null check (char_length(name) between 2 and 100),
  short_description text not null check (char_length(short_description) between 10 and 240),
  long_description text not null default '' check (char_length(long_description) <= 8000),
  category text not null,
  tags text[] not null default '{}',
  language text not null default 'English',
  region text not null default 'Global',
  invite_url text not null,
  support_url text,
  website_url text,
  github_url text,
  bot_prefix text,
  banner_color text not null default '#325578' check (banner_color ~ '^#[0-9A-Fa-f]{6}$'),
  status public.listing_status not null default 'draft',
  visibility public.listing_visibility not null default 'public',
  widget_status public.widget_status not null default 'unverified',
  widget_verified_at timestamptz,
  member_count bigint not null default 0 check (member_count >= 0),
  online_count bigint not null default 0 check (online_count >= 0),
  active_server_count bigint not null default 0 check (active_server_count >= 0),
  votes_count bigint not null default 0 check (votes_count >= 0),
  views_count bigint not null default 0 check (views_count >= 0),
  clicks_count bigint not null default 0 check (clicks_count >= 0),
  verified_badge boolean not null default false,
  safe_badge boolean not null default false,
  featured boolean not null default false,
  featured_rank integer check (featured_rank is null or featured_rank > 0),
  reputation_score numeric(5,2) not null default 0 check (reputation_score between 0 and 100),
  moderation_reason text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (type, slug),
  unique (type, discord_id),
  check (cardinality(tags) <= 6),
  check ((type = 'server' and bot_prefix is null) or type = 'bot')
);

create index listings_public_discovery_idx
  on public.listings (type, featured desc, votes_count desc, published_at desc)
  where status = 'live' and visibility = 'public' and deleted_at is null;
create index listings_owner_idx on public.listings (owner_id, status, updated_at desc);
create index listings_review_queue_idx on public.listings (status, created_at)
  where status = 'pending_review';
create index listings_search_idx on public.listings
  using gin (to_tsvector('simple', name || ' ' || short_description || ' ' || category));
create index listings_tags_idx on public.listings using gin (tags);

create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  kind text not null check (kind in ('icon', 'banner', 'gallery')),
  bucket text not null check (bucket in ('listing-icons', 'listing-banners', 'bot-gallery')),
  object_path text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  byte_size integer not null check (byte_size between 1 and 10485760),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  position integer not null default 0 check (position between 0 and 5),
  created_at timestamptz not null default now(),
  unique (bucket, object_path)
);

create unique index listing_media_single_icon_idx on public.listing_media (listing_id)
where kind = 'icon';
create unique index listing_media_single_banner_idx on public.listing_media (listing_id)
where kind = 'banner';
create unique index listing_media_gallery_position_idx on public.listing_media (listing_id, position)
where kind = 'gallery';

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index votes_listing_recent_idx on public.votes (listing_id, created_at desc);
create index votes_user_recent_idx on public.votes (user_id, created_at desc);

create or replace function private.enforce_vote_cooldown()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(
    hashtextextended(new.listing_id::text || ':' || new.user_id::text, 0)
  );

  if exists (
    select 1
    from public.votes
    where listing_id = new.listing_id
      and user_id = new.user_id
      and created_at > new.created_at - interval '6 hours'
  ) then
    raise exception 'vote_cooldown_active' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger enforce_vote_cooldown_before_insert
before insert on public.votes
for each row execute function private.enforce_vote_cooldown();

create table public.analytics_events (
  id bigint generated always as identity primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (
    event_type in ('view', 'invite_click', 'link_copy', 'vote', 'widget_sync')
  ),
  visitor_hash text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index analytics_listing_time_idx on public.analytics_events
  (listing_id, occurred_at desc);
create index analytics_event_time_idx on public.analytics_events
  (event_type, occurred_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete restrict,
  listing_id uuid references public.listings(id) on delete set null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  category text not null check (char_length(category) between 2 and 80),
  description text not null check (char_length(description) between 10 and 2000),
  status public.report_status not null default 'open',
  severity public.report_severity not null default 'low',
  assigned_to uuid references public.profiles(id) on delete set null,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (listing_id is not null or reported_user_id is not null)
);

create index reports_queue_idx on public.reports (status, severity, created_at)
where status in ('open', 'triaged', 'investigating');
create index reports_reporter_recent_idx on public.reports (reporter_id, created_at desc);

create table public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  report_id uuid references public.reports(id) on delete set null,
  severity public.report_severity not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'escalated', 'closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  summary text not null check (char_length(summary) between 3 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.moderation_cases(id) on delete set null,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  target_user_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  action text not null check (action in (
    'notice', 'flag', 'pause_listing', 'resume_listing', 'suspend_listing',
    'reject_listing', 'verify_listing', 'safe_badge', 'feature_listing',
    'suspend_user', 'restore_user', 'freeze_listings', 'delete_listing', 'delete_user'
  )),
  reason text not null check (char_length(reason) between 3 and 2000),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index moderation_actions_target_idx on public.moderation_actions
  (target_user_id, created_at desc);
create index moderation_actions_listing_idx on public.moderation_actions
  (listing_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null check (char_length(title) between 1 and 140),
  body text not null check (char_length(body) between 1 and 2000),
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_inbox_idx on public.notifications (user_id, read_at, created_at desc);

create table public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  code extensions.citext not null unique check (code ~ '^[A-Za-z0-9_-]{3,32}$'),
  is_active boolean not null default true,
  suspended_at timestamptz,
  suspension_reason text,
  created_at timestamptz not null default now()
);

create table public.referral_events (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.referral_codes(id) on delete restrict,
  referrer_id uuid not null references public.profiles(id) on delete restrict,
  receiver_id uuid not null unique references public.profiles(id) on delete restrict,
  status public.referral_status not null default 'pending',
  risk_score numeric(5,2) not null default 0 check (risk_score between 0 and 100),
  risk_reasons text[] not null default '{}',
  qualified_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (referrer_id <> receiver_id)
);

create index referral_events_referrer_idx on public.referral_events (referrer_id, created_at desc);
create index referral_events_risk_idx on public.referral_events (status, risk_score desc);

create table public.growth_point_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  points integer not null check (points <> 0),
  reason text not null,
  referral_event_id uuid references public.referral_events(id) on delete set null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create index growth_point_ledger_user_idx on public.growth_point_ledger
  (user_id, created_at desc);

create table public.growth_point_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  listing_id uuid not null references public.listings(id) on delete restrict,
  points integer not null check (points between 1 and 10),
  allocation_day date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now()
);

create index growth_point_allocations_user_day_idx on public.growth_point_allocations
  (user_id, allocation_day);

create table public.featured_placements (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  surface text not null check (surface in (
    'explore_server_row', 'top_bots', 'recommended_bots', 'search_boost'
  )),
  rank integer check (rank is null or rank > 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create unique index featured_active_rank_idx on public.featured_placements (surface, rank)
where ends_at is null and rank is not null;
create index featured_active_listing_idx on public.featured_placements
  (listing_id, starts_at, ends_at);

create table public.staff_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role public.app_role not null check (role in ('moderator', 'admin', 'super_admin')),
  permissions text[] not null default '{}',
  mfa_required boolean not null default true,
  mfa_secret_ciphertext text,
  mfa_enrolled_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_action_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  action_scope text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index admin_audit_actor_idx on public.admin_audit_log (actor_id, created_at desc);
create index admin_audit_target_idx on public.admin_audit_log
  (target_type, target_id, created_at desc);

create or replace function private.enforce_growth_point_allocation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  issued integer;
  spent integer;
  daily_spent integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text || new.allocation_day::text, 0));

  select coalesce(sum(points), 0)
    into issued
    from public.growth_point_ledger
   where user_id = new.user_id;

  select coalesce(sum(points), 0)
    into spent
    from public.growth_point_allocations
   where user_id = new.user_id;

  select coalesce(sum(points), 0)
    into daily_spent
    from public.growth_point_allocations
   where user_id = new.user_id
     and allocation_day = new.allocation_day;

  if new.points > issued - spent then
    raise exception 'insufficient_growth_points' using errcode = 'P0001';
  end if;

  if daily_spent + new.points > 10 then
    raise exception 'daily_growth_point_limit' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger enforce_growth_point_allocation_before_insert
before insert on public.growth_point_allocations
for each row execute function private.enforce_growth_point_allocation();

create or replace function private.award_qualified_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'qualified' and old.status is distinct from 'qualified' then
    if new.risk_score >= 70 then
      raise exception 'high_risk_referral_requires_review' using errcode = 'P0001';
    end if;

    insert into public.growth_point_ledger
      (user_id, points, reason, referral_event_id, idempotency_key)
    values
      (new.referrer_id, 10, 'Qualified referral reward', new.id, 'referrer:' || new.id::text),
      (new.receiver_id, 10, 'Referral welcome reward', new.id, 'receiver:' || new.id::text)
    on conflict (idempotency_key) do nothing;

    new.qualified_at = coalesce(new.qualified_at, now());
  end if;

  return new;
end;
$$;

create trigger award_qualified_referral_before_update
before update of status on public.referral_events
for each row execute function private.award_qualified_referral();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger discord_accounts_set_updated_at
before update on public.discord_accounts
for each row execute function public.set_updated_at();
create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();
create trigger moderation_cases_set_updated_at
before update on public.moderation_cases
for each row execute function public.set_updated_at();
create trigger referral_events_set_updated_at
before update on public.referral_events
for each row execute function public.set_updated_at();
create trigger staff_members_set_updated_at
before update on public.staff_members
for each row execute function public.set_updated_at();

create view public.growth_point_balances
with (security_invoker = true)
as
select
  p.id as user_id,
  coalesce(l.issued, 0)::bigint as issued_points,
  coalesce(a.spent, 0)::bigint as allocated_points,
  (coalesce(l.issued, 0) - coalesce(a.spent, 0))::bigint as available_points
from public.profiles p
left join (
  select user_id, sum(points) as issued
  from public.growth_point_ledger
  group by user_id
) l on l.user_id = p.id
left join (
  select user_id, sum(points) as spent
  from public.growth_point_allocations
  group by user_id
) a on a.user_id = p.id;

alter table public.profiles enable row level security;
alter table public.discord_accounts enable row level security;
alter table public.sessions enable row level security;
alter table public.managed_guilds enable row level security;
alter table public.listings enable row level security;
alter table public.listing_media enable row level security;
alter table public.votes enable row level security;
alter table public.analytics_events enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_cases enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.notifications enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_events enable row level security;
alter table public.growth_point_ledger enable row level security;
alter table public.growth_point_allocations enable row level security;
alter table public.featured_placements enable row level security;
alter table public.staff_members enable row level security;
alter table public.admin_action_challenges enable row level security;
alter table public.admin_audit_log enable row level security;

create policy profiles_public_read
on public.profiles
for select
to anon, authenticated
using (status = 'active');

create policy listings_public_read
on public.listings
for select
to anon, authenticated
using (
  status = 'live'
  and visibility = 'public'
  and deleted_at is null
);

create policy listing_media_public_read
on public.listing_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_media.listing_id
      and l.status = 'live'
      and l.visibility = 'public'
      and l.deleted_at is null
  )
);

create policy featured_placements_public_read
on public.featured_placements
for select
to anon, authenticated
using (
  starts_at <= now()
  and (ends_at is null or ends_at > now())
  and exists (
    select 1
    from public.listings l
    where l.id = featured_placements.listing_id
      and l.status = 'live'
      and l.visibility = 'public'
      and l.deleted_at is null
  )
);

revoke all on all tables in schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.profiles, public.listings, public.listing_media, public.featured_placements
  to anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on function public.set_updated_at() to service_role;
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-icons', 'listing-icons', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('listing-banners', 'listing-banners', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('bot-gallery', 'bot-gallery', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy listing_media_storage_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('listing-icons', 'listing-banners', 'bot-gallery'));
