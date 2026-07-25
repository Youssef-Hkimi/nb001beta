import {NextRequest} from "next/server";

import {apiErrorResponse, requireStaff} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);
    const {data, error} = await getSupabaseAdmin()
      .from("listings")
      .select("*,owner:profiles!listings_owner_id_fkey(id,username,display_name,avatar_url),listing_media(*)")
      .eq("status", "pending_review")
      .is("deleted_at", null)
      .order("created_at")
      .limit(100);
    if (error) throw error;
    return Response.json({reviews: data});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
