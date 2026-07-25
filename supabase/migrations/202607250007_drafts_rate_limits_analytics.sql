create table public.listing_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  type public.listing_type not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, type)
);

create trigger listing_drafts_set_updated_at
before update on public.listing_drafts
for each row execute function public.set_updated_at();

create table public.api_rate_limits (
  rate_key text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (rate_key, window_started_at)
);

create index api_rate_limits_cleanup_idx on public.api_rate_limits (window_started_at);

create or replace function public.consume_api_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or char_length(p_key) > 240 then
    return false;
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.api_rate_limits (rate_key, window_started_at, request_count)
  values (p_key, v_window, 1)
  on conflict (rate_key, window_started_at)
  do update set request_count = public.api_rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

create or replace function public.record_listing_event(
  p_listing_id uuid,
  p_actor_id uuid,
  p_event_type text,
  p_visitor_hash text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_type not in ('view', 'invite_click', 'link_copy') then
    raise exception 'invalid_analytics_event' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.listings
    where id = p_listing_id
      and status = 'live'
      and visibility = 'public'
      and deleted_at is null
  ) then
    raise exception 'listing_not_public' using errcode = 'P0002';
  end if;

  insert into public.analytics_events (
    listing_id,
    actor_id,
    event_type,
    visitor_hash,
    metadata
  )
  values (
    p_listing_id,
    p_actor_id,
    p_event_type,
    p_visitor_hash,
    coalesce(p_metadata, '{}'::jsonb)
  );

  update public.listings
  set
    views_count = views_count + case when p_event_type = 'view' then 1 else 0 end,
    clicks_count = clicks_count + case when p_event_type = 'invite_click' then 1 else 0 end
  where id = p_listing_id;
end;
$$;

alter table public.listing_drafts enable row level security;
alter table public.api_rate_limits enable row level security;

revoke all on public.listing_drafts, public.api_rate_limits from public, anon, authenticated;
grant all on public.listing_drafts, public.api_rate_limits to service_role;

revoke all on function public.consume_api_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer)
  to service_role;

revoke all on function public.record_listing_event(uuid, uuid, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_listing_event(uuid, uuid, text, text, jsonb)
  to service_role;
