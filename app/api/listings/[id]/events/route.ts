import {NextRequest} from "next/server";
import {z} from "zod";

import {DISCORD_SESSION_COOKIE, getDiscordSession} from "@/lib/auth/discord-session";
import {apiErrorResponse, ApiError} from "@/lib/server/auth";
import {
  assertSameOrigin,
  enforceRateLimit,
  getRequestFingerprint,
} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const eventSchema = z.object({
  type: z.enum(["view", "invite_click", "link_copy"]),
});

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    try {
      assertSameOrigin(request);
    } catch {
      throw new ApiError(403, "cross_site_request_blocked");
    }
    const {id} = await context.params;
    if (!z.string().uuid().safeParse(id).success) throw new ApiError(400, "invalid_listing_id");
    const parsed = eventSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(400, "invalid_analytics_event");

    const fingerprint = getRequestFingerprint(request);
    await enforceRateLimit(request, `analytics:${id}`, 90, 60, fingerprint.ipHash);
    const session = await getDiscordSession(request.cookies.get(DISCORD_SESSION_COOKIE)?.value);
    const db = getSupabaseAdmin();
    const dedupeSeconds = parsed.data.type === "view" ? 1800 : 10;
    const cutoff = new Date(Date.now() - dedupeSeconds * 1000).toISOString();
    const {data: duplicate, error: duplicateError} = await db
      .from("analytics_events")
      .select("id")
      .eq("listing_id", id)
      .eq("event_type", parsed.data.type)
      .eq("visitor_hash", fingerprint.ipHash)
      .gte("occurred_at", cutoff)
      .limit(1);
    if (duplicateError) throw duplicateError;
    if (duplicate?.length) return Response.json({ok: true, deduplicated: true});

    const {error} = await db.rpc("record_listing_event", {
      p_listing_id: id,
      p_actor_id: session?.userId || null,
      p_event_type: parsed.data.type,
      p_visitor_hash: fingerprint.ipHash,
      p_metadata: {},
    });
    if (error) throw error;
    return Response.json({ok: true}, {status: 201});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
