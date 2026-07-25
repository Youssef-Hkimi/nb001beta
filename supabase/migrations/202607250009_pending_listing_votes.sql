create or replace function public.cast_listing_vote(
  p_listing_id uuid,
  p_user_id uuid,
  p_visitor_hash text
)
returns table (votes_count bigint, next_vote_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  vote_time timestamptz := now();
  updated_count bigint;
begin
  if not exists (
    select 1 from public.profiles
    where id = p_user_id and status = 'active'
  ) then
    raise exception 'account_not_active' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.listings
    where id = p_listing_id
      and status in ('live', 'pending_review')
      and visibility = 'public'
      and deleted_at is null
  ) then
    raise exception 'listing_not_available' using errcode = 'P0001';
  end if;

  insert into public.votes (listing_id, user_id, created_at)
  values (p_listing_id, p_user_id, vote_time);

  update public.listings
  set votes_count = votes_count + 1
  where id = p_listing_id
  returning public.listings.votes_count into updated_count;

  insert into public.analytics_events (
    listing_id, actor_id, event_type, visitor_hash
  ) values (
    p_listing_id, p_user_id, 'vote', p_visitor_hash
  );

  return query select updated_count, vote_time + interval '6 hours';
end;
$$;

revoke all on function public.cast_listing_vote(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.cast_listing_vote(uuid, uuid, text)
  to service_role;
