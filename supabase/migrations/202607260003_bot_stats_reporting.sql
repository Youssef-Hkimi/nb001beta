alter table public.listings
  alter column active_server_count drop not null,
  alter column active_server_count drop default;

alter table public.listings
  add column if not exists active_server_count_source text;

update public.listings
set
  active_server_count = null,
  active_server_count_updated_at = null,
  active_server_count_source = null
where type = 'bot'
  and coalesce(active_server_count, 0) = 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_active_server_count_source_check'
  ) then
    alter table public.listings
      add constraint listings_active_server_count_source_check
      check (active_server_count_source is null or active_server_count_source = 'owner_reported');
  end if;
end
$$;

create table if not exists public.bot_stats_credentials (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  token_hash text not null unique,
  token_prefix text not null,
  last_reported_at timestamptz,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create index if not exists bot_stats_credentials_last_reported_idx
  on public.bot_stats_credentials(last_reported_at);

alter table public.bot_stats_credentials enable row level security;
revoke all on table public.bot_stats_credentials from public, anon, authenticated;
grant all on table public.bot_stats_credentials to service_role;

create or replace function public.report_bot_server_count(
  p_token_hash text,
  p_server_count bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing_id uuid;
  v_last_reported_at timestamptz;
  v_updated_at timestamptz := now();
begin
  if p_server_count < 0 or p_server_count > 100000000 then
    raise exception 'invalid_server_count' using errcode = '22023';
  end if;

  select credentials.listing_id, credentials.last_reported_at
  into v_listing_id, v_last_reported_at
  from public.bot_stats_credentials as credentials
  join public.listings as listing on listing.id = credentials.listing_id
  where credentials.token_hash = p_token_hash
    and listing.type = 'bot'
    and listing.deleted_at is null
    and listing.status <> 'deleted'
  for update of credentials;

  if not found then
    raise exception 'invalid_stats_token' using errcode = 'P0001';
  end if;

  if v_last_reported_at is not null
     and v_last_reported_at > v_updated_at - interval '1 minute' then
    raise exception 'stats_rate_limited' using errcode = 'P0001';
  end if;

  update public.listings
  set
    active_server_count = p_server_count,
    active_server_count_updated_at = v_updated_at,
    active_server_count_source = 'owner_reported',
    updated_at = v_updated_at
  where id = v_listing_id;

  update public.bot_stats_credentials
  set last_reported_at = v_updated_at
  where listing_id = v_listing_id;

  return jsonb_build_object(
    'listingId', v_listing_id,
    'serverCount', p_server_count,
    'updatedAt', v_updated_at
  );
end;
$$;

revoke all on function public.report_bot_server_count(text, bigint)
  from public, anon, authenticated;
grant execute on function public.report_bot_server_count(text, bigint)
  to service_role;
