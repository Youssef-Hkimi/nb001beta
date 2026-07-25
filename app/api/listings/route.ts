import {NextRequest} from "next/server";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {verifyDiscordWidget} from "@/lib/server/discord-widget";
import {createListingSchema, createSlug} from "@/lib/server/listing-schema";
import {addPublicMediaUrls, importDiscordGuildIcon} from "@/lib/server/listing-media";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getSupabaseAdmin();
    const mine = request.nextUrl.searchParams.get("mine") === "1";
    const type = request.nextUrl.searchParams.get("type");
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit")) || 12, 1), 40);
    let query = db
      .from("listings")
      .select("*,listing_media(*)")
      .order("featured", {ascending: false})
      .order("votes_count", {ascending: false})
      .limit(limit);
    if (mine) {
      const session = await requireSession(request);
      query = query.eq("owner_id", session.userId).neq("status", "deleted");
    } else {
      query = query
        .eq("status", "live")
        .eq("visibility", "public")
        .is("deleted_at", null);
    }
    if (type === "server" || type === "bot") query = query.eq("type", type);
    const {data, error} = await query;
    if (error) throw error;
    return Response.json(
      {listings: (data || []).map((listing) => addPublicMediaUrls(listing))},
      {headers: {"Cache-Control": "no-store"}},
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    await enforceRateLimit(request, "create-listing", 6, 60 * 60, session.userId);
    const parsed = createListingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        {error: "invalid_listing", fields: parsed.error.flatten().fieldErrors},
        {status: 400},
      );
    }
    const input = parsed.data;
    const db = getSupabaseAdmin();
    let canonicalName = input.name;
    let inviteUrl = input.inviteUrl;
    let widgetStatus: "unverified" | "verified" | "disabled" = "unverified";
    let onlineCount = 0;
    let memberCount = 0;
    let managedIconHash: string | null = null;

    if (input.type === "server") {
      const {data: managed} = await db
        .from("managed_guilds")
        .select("name,icon_hash,member_count,presence_count")
        .eq("user_id", session.userId)
        .eq("discord_guild_id", input.discordId)
        .maybeSingle();
      if (!managed) throw new ApiError(403, "server_not_managed_by_user");
      memberCount = managed.member_count;
      managedIconHash = managed.icon_hash;

      const widget = await verifyDiscordWidget(input.discordId);
      if (widget.ok) {
        canonicalName = widget.guild.name;
        inviteUrl = widget.guild.instantInvite;
        onlineCount = widget.guild.presenceCount;
        widgetStatus = "verified";
      } else if (input.skipWidgetVerification && ["widget_disabled", "widget_no_channel"].includes(widget.error)) {
        onlineCount = memberCount;
        widgetStatus = "disabled";
      } else {
        return Response.json({error: widget.error}, {status: widget.status});
      }
    }

    const {data, error} = await db
      .from("listings")
      .insert({
        owner_id: session.userId,
        type: input.type,
        slug: createSlug(canonicalName),
        discord_id: input.discordId,
        name: canonicalName,
        short_description: input.shortDescription,
        long_description: input.longDescription,
        category: input.category,
        tags: input.tags,
        feature_ids: input.featureIds,
        language: input.language,
        region: input.region,
        invite_url: inviteUrl,
        support_url: input.supportUrl || null,
        website_url: input.websiteUrl || null,
        github_url: input.githubUrl || null,
        bot_prefix: input.type === "bot" ? input.botPrefix : null,
        bot_commands: input.type === "bot" ? input.botCommands : [],
        premium: input.type === "bot" ? input.premium : false,
        banner_color: input.bannerColor,
        status: "pending_review",
        widget_status: widgetStatus,
        widget_verified_at: widgetStatus === "verified" ? new Date().toISOString() : null,
        member_count: memberCount,
        online_count: onlineCount,
      })
      .select("*")
      .single();
    if (error?.code === "23505") throw new ApiError(409, "listing_already_exists");
    if (error) throw error;
    let importedIconUrl: string | null = null;
    if (input.type === "server" && managedIconHash) {
      try {
        importedIconUrl = await importDiscordGuildIcon({
          userId: session.userId,
          listingId: data.id,
          guildId: input.discordId,
          iconHash: managedIconHash,
        });
      } catch {
        // Listing creation must not fail if Discord's CDN is temporarily unavailable.
      }
    }
    return Response.json({listing: data, importedIconUrl}, {status: 201});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
