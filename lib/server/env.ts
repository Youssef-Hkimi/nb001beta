import "server-only";

import {z} from "zod";

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(20),
  SESSION_HASH_SECRET: z.string().min(32),
  ADMIN_MFA_ENCRYPTION_KEY: z.string().min(32),
});

let cached: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (cached) return cached;
  cached = serverEnvSchema.parse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SESSION_HASH_SECRET: process.env.SESSION_HASH_SECRET,
    ADMIN_MFA_ENCRYPTION_KEY: process.env.ADMIN_MFA_ENCRYPTION_KEY,
  });
  return cached;
}
