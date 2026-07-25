import "server-only";

import type {ApiListing} from "@/lib/real-listings";
import {addPublicMediaUrls} from "@/lib/server/listing-media";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export async function getPublicListing(type: "server" | "bot", slug: string) {
  const {data, error} = await getSupabaseAdmin()
    .from("listings")
    .select("*,listing_media(*),profiles!listings_owner_id_fkey(username,display_name,avatar_url)")
    .eq("type", type)
    .eq("slug", slug)
    .eq("status", "live")
    .eq("visibility", "public")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data ? addPublicMediaUrls(data) as ApiListing : null;
}
