create policy listing_drafts_no_browser_access
  on public.listing_drafts as restrictive
  for all to anon, authenticated
  using (false)
  with check (false);

create policy api_rate_limits_no_browser_access
  on public.api_rate_limits as restrictive
  for all to anon, authenticated
  using (false)
  with check (false);
