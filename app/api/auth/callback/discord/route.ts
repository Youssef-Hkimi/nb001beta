import {NextRequest, NextResponse} from "next/server";

import {
  getDiscordOAuthConfig,
  toManagedServer,
  verifyDiscordOAuthState,
  type DiscordGuildResponse,
  type DiscordUserResponse,
} from "@/lib/auth/discord-oauth";
import {
  createDiscordSession,
  DISCORD_SESSION_COOKIE,
  DISCORD_SESSION_MAX_AGE,
} from "@/lib/auth/discord-session";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";
import {secureEqual} from "@/lib/server/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const OAUTH_NONCE_COOKIE = "nexus_discord_oauth_nonce";

function errorRedirect(request: NextRequest, error: string) {
  const configuredCallback = process.env.DISCORD_REDIRECT_URI;
  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent(error)}`,
      configuredCallback || request.url,
    ),
  );
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthState = verifyDiscordOAuthState(state);
  const nonceCookie = request.cookies.get(OAUTH_NONCE_COOKIE)?.value;
  if (!code || !oauthState || !nonceCookie || !secureEqual(oauthState.nonce, nonceCookie)) {
    return errorRedirect(request, "invalid_oauth_state");
  }

  try {
    const config = getDiscordOAuthConfig();
    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
      }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return errorRedirect(request, "token_exchange_failed");

    const token = await tokenResponse.json() as {access_token?: string};
    if (!token.access_token) return errorRedirect(request, "token_exchange_failed");

    const authorization = {Authorization: `Bearer ${token.access_token}`};
    const [userResponse, guildsResponse] = await Promise.all([
      fetch("https://discord.com/api/v10/users/@me", {headers: authorization, cache: "no-store"}),
      fetch("https://discord.com/api/v10/users/@me/guilds?with_counts=true", {
        headers: authorization,
        cache: "no-store",
      }),
    ]);
    if (!userResponse.ok || !guildsResponse.ok) {
      return errorRedirect(request, "discord_profile_failed");
    }

    const discordUser = await userResponse.json() as DiscordUserResponse;
    const discordGuilds = await guildsResponse.json() as DiscordGuildResponse[];
    const guilds = discordGuilds
      .map(toManagedServer)
      .filter((guild): guild is NonNullable<typeof guild> => Boolean(guild));
    const avatarExtension = discordUser.avatar?.startsWith("a_") ? "gif" : "png";
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${avatarExtension}?size=256`
      : null;
    const db = getSupabaseAdmin();
    const {data: userId, error: identityError} = await db.rpc("upsert_discord_identity", {
      p_discord_user_id: discordUser.id,
      p_discord_username: discordUser.username,
      p_display_name: discordUser.global_name || discordUser.username,
      p_avatar_url: avatarUrl,
      p_avatar_hash: discordUser.avatar || null,
    });
    if (identityError || typeof userId !== "string") throw identityError || new Error("identity_failed");

    const guildRows = discordGuilds
      .filter((guild) => guilds.some((managed) => managed.id === guild.id))
      .map((guild) => ({
        user_id: userId,
        discord_guild_id: guild.id,
        name: guild.name,
        icon_hash: guild.icon || null,
        member_count: guild.approximate_member_count || 0,
        presence_count: guild.approximate_presence_count || 0,
        owner: Boolean(guild.owner),
        permissions: guild.permissions || "0",
        synced_at: new Date().toISOString(),
      }));
    if (guildRows.length > 0) {
      const {error: guildError} = await db
        .from("managed_guilds")
        .upsert(guildRows, {onConflict: "user_id,discord_guild_id"});
      if (guildError) throw guildError;
    }
    await db
      .from("discord_accounts")
      .update({guilds_synced_at: new Date().toISOString()})
      .eq("user_id", userId);

    const sessionId = await createDiscordSession(userId, request);
    // The custom local server binds to 0.0.0.0 internally, but Discord and the
    // browser use localhost. Build the post-login redirect from the configured
    // callback so the newly-set host cookie is available on the destination.
    const response = NextResponse.redirect(new URL(oauthState.nextPath, config.redirectUri));
    response.cookies.set(DISCORD_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: DISCORD_SESSION_MAX_AGE,
      priority: "high",
    });
    response.cookies.delete(OAUTH_NONCE_COOKIE);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return errorRedirect(request, "discord_oauth_failed");
  }
}
