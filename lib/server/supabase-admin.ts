import "server-only";

import {createClient, type SupabaseClient} from "@supabase/supabase-js";

import {getServerEnv} from "@/lib/server/env";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (client) return client;
  const env = getServerEnv();
  client = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return client;
}
