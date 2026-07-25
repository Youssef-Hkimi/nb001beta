create or replace function public.hard_delete_owned_listing(
  p_listing_id uuid,
  p_owner_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_media jsonb;
begin
  if not exists (
    select 1
    from public.listings
    where id = p_listing_id
      and owner_id = p_owner_id
  ) then
    return jsonb_build_object('deleted', false, 'media', '[]'::jsonb);
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'bucket', bucket,
        'objectPath', object_path
      )
      order by created_at
    ),
    '[]'::jsonb
  )
  into v_media
  from public.listing_media
  where listing_id = p_listing_id;

  delete from public.growth_point_allocations
  where listing_id = p_listing_id;

  delete from public.listings
  where id = p_listing_id
    and owner_id = p_owner_id;

  return jsonb_build_object('deleted', true, 'media', v_media);
end;
$$;

revoke all on function public.hard_delete_owned_listing(uuid, uuid) from public;
revoke all on function public.hard_delete_owned_listing(uuid, uuid) from anon;
revoke all on function public.hard_delete_owned_listing(uuid, uuid) from authenticated;
grant execute on function public.hard_delete_owned_listing(uuid, uuid) to service_role;
