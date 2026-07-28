import { NextRequest } from "next/server";

import { apiErrorResponse, ApiError, requireSession } from "@/lib/server/auth";
import { assertSameOrigin, enforceRateLimit } from "@/lib/server/security";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REMINDER_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const session = await requireSession(request);
    await enforceRateLimit(request, "bot-stats-reminder", 12, 86_400, session.userId);
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason;
    if (reason !== "skip" && reason !== "periodic") {
      throw new ApiError(400, "invalid_reminder_reason");
    }

    const db = getSupabaseAdmin();
    const { data: listing, error } = await db
      .from("listings")
      .select("id,name,active_server_count")
      .eq("id", id)
      .eq("owner_id", session.userId)
      .eq("type", "bot")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!listing) throw new ApiError(404, "bot_listing_not_found");

    const { data: credential, error: credentialError } = await db
      .from("bot_stats_credentials")
      .select("last_reported_at")
      .eq("listing_id", id)
      .maybeSingle();
    if (credentialError) throw credentialError;
    if (listing.active_server_count != null || credential?.last_reported_at) {
      return Response.json({ created: false, connected: true });
    }

    const actionUrl = `/docs?listing=${id}#quickstart`;
    const { data: latest, error: notificationError } = await db
      .from("notifications")
      .select("created_at")
      .eq("user_id", session.userId)
      .eq("type", "bot_stats_setup")
      .eq("action_url", actionUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (notificationError) throw notificationError;

    if (reason === "periodic" && !latest) {
      return Response.json({ created: false, connected: false });
    }
    if (
      latest
      && Date.now() - new Date(latest.created_at).getTime() < REMINDER_INTERVAL_MS
    ) {
      return Response.json({ created: false, connected: false });
    }

    const { error: insertError } = await db.from("notifications").insert({
      user_id: session.userId,
      type: "bot_stats_setup",
      title: "Connect server count reporting",
      body: `${listing.name} is listed without a server count. Open the Nexbiy setup guide to connect reporting.`,
      action_url: actionUrl,
    });
    if (insertError) throw insertError;

    return Response.json({ created: true, connected: false });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
