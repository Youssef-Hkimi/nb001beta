alter table public.listings
  add column if not exists feature_ids text[] not null default '{}',
  add column if not exists bot_commands jsonb not null default '[]'::jsonb,
  add column if not exists premium boolean not null default false;

alter table public.listings
  add constraint listings_feature_ids_limit check (cardinality(feature_ids) <= 24),
  add constraint listings_bot_commands_shape check (
    jsonb_typeof(bot_commands) = 'array' and jsonb_array_length(bot_commands) <= 100
  );
