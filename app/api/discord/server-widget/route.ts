import {NextRequest} from "next/server";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {verifyDiscordWidget} from "@/lib/server/discord-widget";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    await enforceRateLimit(request, "verify-widget", 12, 10 * 60, session.userId);
    const payload: unknown = await request.json();

    const guildId =
      typeof payload === "object" && payload !== null && "guildId" in payload
        ? String(payload.guildId).trim()
        : "";
    const db = getSupabaseAdmin();
    const {data: managedGuild} = await db
      .from("managed_guilds")
      .select("discord_guild_id")
      .eq("user_id", session.userId)
      .eq("discord_guild_id", guildId)
      .maybeSingle();
    if (!managedGuild) throw new ApiError(403, "server_not_managed_by_user");

    const result = await verifyDiscordWidget(guildId);
    if (!result.ok) {
      return Response.json(
        {error: result.error},
        {status: result.status, headers: {"Cache-Control": "no-store, max-age=0"}},
      );
    }

    await db
      .from("listings")
      .update({
        name: result.guild.name,
        invite_url: result.guild.instantInvite,
        online_count: result.guild.presenceCount,
        widget_status: "verified",
        widget_verified_at: new Date().toISOString(),
      })
      .eq("owner_id", session.userId)
      .eq("type", "server")
      .eq("discord_id", guildId)
      .neq("status", "deleted");

    return Response.json(
      {verified: true, guild: {guildId, name: result.guild.name, presenceCount: result.guild.presenceCount}},
      {headers: {"Cache-Control": "no-store, max-age=0"}},
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({error: "invalid_request"}, {status: 400});
    }
    return apiErrorResponse(error);
  }
}
