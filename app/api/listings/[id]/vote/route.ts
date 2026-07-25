import {NextRequest} from "next/server";

import {apiErrorResponse, requireSession} from "@/lib/server/auth";
import {enforceRateLimit, getRequestFingerprint} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
  let userId: string | null = null;
  let listingId: string | null = null;
  try {
    const session = await requireSession(request);
    await enforceRateLimit(request, "cast-vote", 30, 60 * 60, session.userId);
    userId = session.userId;
    const {id} = await context.params;
    listingId = id;
    const fingerprint = getRequestFingerprint(request);
    const {data, error} = await getSupabaseAdmin().rpc("cast_listing_vote", {
      p_listing_id: id,
      p_user_id: session.userId,
      p_visitor_hash: fingerprint.ipHash,
    });
    if (error) throw error;
    return Response.json({vote: data?.[0]});
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("vote_cooldown_active") &&
      userId &&
      listingId
    ) {
      const {data: latest} = await getSupabaseAdmin()
        .from("votes")
        .select("created_at")
        .eq("user_id", userId)
        .eq("listing_id", listingId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
      const nextVoteAt = latest
        ? new Date(new Date(latest.created_at).getTime() + 6 * 60 * 60 * 1000).toISOString()
        : null;
      return Response.json({error: "vote_cooldown_active", nextVoteAt}, {status: 409});
    }
    return apiErrorResponse(error);
  }
}
