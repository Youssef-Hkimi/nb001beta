create schema if not exists extensions;
alter extension citext set schema extensions;
drop extension if exists btree_gist;

create index admin_action_challenges_user_idx
  on public.admin_action_challenges (user_id, expires_at desc);
create index analytics_events_actor_idx
  on public.analytics_events (actor_id, occurred_at desc);
create index featured_placements_creator_idx
  on public.featured_placements (created_by, created_at desc);
create index growth_point_allocations_listing_idx
  on public.growth_point_allocations (listing_id, created_at desc);
create index growth_point_ledger_referral_idx
  on public.growth_point_ledger (referral_event_id)
  where referral_event_id is not null;
create index moderation_actions_actor_idx
  on public.moderation_actions (actor_id, created_at desc);
create index moderation_actions_case_idx
  on public.moderation_actions (case_id, created_at desc)
  where case_id is not null;
create index moderation_cases_listing_idx
  on public.moderation_cases (listing_id, created_at desc)
  where listing_id is not null;
create index moderation_cases_user_idx
  on public.moderation_cases (user_id, created_at desc)
  where user_id is not null;
create index moderation_cases_report_idx
  on public.moderation_cases (report_id)
  where report_id is not null;
create index moderation_cases_assignee_idx
  on public.moderation_cases (assigned_to, status, created_at)
  where assigned_to is not null;
create index referral_events_code_idx
  on public.referral_events (code_id, created_at desc);
create index referral_events_reviewer_idx
  on public.referral_events (reviewed_by, updated_at desc)
  where reviewed_by is not null;
create index reports_listing_idx
  on public.reports (listing_id, created_at desc)
  where listing_id is not null;
create index reports_reported_user_idx
  on public.reports (reported_user_id, created_at desc)
  where reported_user_id is not null;
create index reports_assignee_idx
  on public.reports (assigned_to, status, created_at)
  where assigned_to is not null;
create index reports_resolver_idx
  on public.reports (resolved_by, resolved_at desc)
  where resolved_by is not null;
create index staff_members_creator_idx
  on public.staff_members (created_by, created_at desc)
  where created_by is not null;

create policy discord_accounts_no_browser_access
  on public.discord_accounts as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy sessions_no_browser_access
  on public.sessions as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy managed_guilds_no_browser_access
  on public.managed_guilds as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy votes_no_browser_access
  on public.votes as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy analytics_events_no_browser_access
  on public.analytics_events as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy reports_no_browser_access
  on public.reports as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy moderation_cases_no_browser_access
  on public.moderation_cases as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy moderation_actions_no_browser_access
  on public.moderation_actions as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy notifications_no_browser_access
  on public.notifications as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy referral_codes_no_browser_access
  on public.referral_codes as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy referral_events_no_browser_access
  on public.referral_events as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy growth_point_ledger_no_browser_access
  on public.growth_point_ledger as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy growth_point_allocations_no_browser_access
  on public.growth_point_allocations as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy staff_members_no_browser_access
  on public.staff_members as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy admin_action_challenges_no_browser_access
  on public.admin_action_challenges as restrictive for all to anon, authenticated
  using (false) with check (false);
create policy admin_audit_log_no_browser_access
  on public.admin_audit_log as restrictive for all to anon, authenticated
  using (false) with check (false);
