create or replace function public.upsert_discord_identity(
  p_discord_user_id text,
  p_discord_username text,
  p_display_name text,
  p_avatar_url text,
  p_avatar_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_user_id uuid;
  resolved_username text;
begin
  if p_discord_user_id !~ '^[0-9]{15,22}$' then
    raise exception 'invalid_discord_user_id' using errcode = '22023';
  end if;

  select user_id into resolved_user_id
  from public.discord_accounts
  where discord_user_id = p_discord_user_id;

  if resolved_user_id is null then
    resolved_username :=
      left(regexp_replace(lower(p_discord_username), '[^a-z0-9_]+', '-', 'g'), 24)
      || '-' || right(p_discord_user_id, 6);

    insert into public.profiles (username, display_name, avatar_url)
    values (
      resolved_username,
      coalesce(nullif(p_display_name, ''), p_discord_username),
      p_avatar_url
    )
    returning id into resolved_user_id;

    insert into public.discord_accounts (
      user_id,
      discord_user_id,
      discord_username,
      discord_global_name,
      discord_avatar_hash
    )
    values (
      resolved_user_id,
      p_discord_user_id,
      p_discord_username,
      nullif(p_display_name, ''),
      p_avatar_hash
    );
  else
    update public.profiles
    set
      display_name = coalesce(nullif(p_display_name, ''), p_discord_username),
      avatar_url = p_avatar_url,
      last_seen_at = now()
    where id = resolved_user_id;

    update public.discord_accounts
    set
      discord_username = p_discord_username,
      discord_global_name = nullif(p_display_name, ''),
      discord_avatar_hash = p_avatar_hash
    where user_id = resolved_user_id;
  end if;

  return resolved_user_id;
end;
$$;

revoke all on function public.upsert_discord_identity(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_discord_identity(text, text, text, text, text)
  to service_role;

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
      and status = 'live'
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
