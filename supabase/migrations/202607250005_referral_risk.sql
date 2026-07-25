alter table public.referral_events
  add column receiver_fingerprint_hash text;

create index referral_events_fingerprint_idx
  on public.referral_events (receiver_fingerprint_hash, created_at desc)
  where receiver_fingerprint_hash is not null;
