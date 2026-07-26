alter table public.listings
  add column if not exists active_server_count_updated_at timestamptz;

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
      and status in ('live', 'pending_review')
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
    views_count = public.listings.views_count
      + case when p_event_type = 'view' then 1 else 0 end,
    clicks_count = public.listings.clicks_count
      + case when p_event_type = 'invite_click' then 1 else 0 end
  where id = p_listing_id;
end;
$$;

revoke all on function public.record_listing_event(uuid, uuid, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_listing_event(uuid, uuid, text, text, jsonb)
  to service_role;
