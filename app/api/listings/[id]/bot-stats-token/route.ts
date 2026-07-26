import {NextRequest} from "next/server";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {createBotStatsCredential} from "@/lib/server/bot-stats";
import {assertSameOrigin, enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireOwnedBot(request: NextRequest, id: string) {
  const session = await requireSession(request);
  const db = getSupabaseAdmin();
  const {data, error} = await db
    .from("listings")
    .select("id,name,active_server_count,active_server_count_updated_at")
    .eq("id", id)
    .eq("owner_id", session.userId)
    .eq("type", "bot")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new ApiError(404, "bot_listing_not_found");
  return {db, listing: data, session};
}

export async function GET(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const {id} = await context.params;
    const {db, listing} = await requireOwnedBot(request, id);
    const {data, error} = await db
      .from("bot_stats_credentials")
      .select("token_prefix,last_reported_at,created_at,rotated_at")
      .eq("listing_id", listing.id)
      .maybeSingle();
    if (error) throw error;

    return Response.json({
      connected: Boolean(data?.last_reported_at),
      credentialCreated: Boolean(data),
      tokenPrefix: data?.token_prefix ?? null,
      lastReportedAt: data?.last_reported_at ?? null,
      serverCount: listing.active_server_count,
      serverCountUpdatedAt: listing.active_server_count_updated_at,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    assertSameOrigin(request);
    const {id} = await context.params;
    const {db, listing, session} = await requireOwnedBot(request, id);
    await enforceRateLimit(request, "bot-stats-token", 5, 24 * 60 * 60, session.userId);

    const credential = createBotStatsCredential();
    const {error} = await db.from("bot_stats_credentials").upsert({
      listing_id: listing.id,
      token_hash: credential.tokenHash,
      token_prefix: credential.tokenPrefix,
      last_reported_at: null,
      rotated_at: new Date().toISOString(),
    }, {onConflict: "listing_id"});
    if (error) throw error;

    return Response.json({
      token: credential.token,
      endpoint: "/api/bot-stats",
      message: "Copy this token now. Nexbiy stores only its secure hash.",
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
