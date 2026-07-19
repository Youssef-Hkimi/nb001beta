import {NextRequest, NextResponse} from "next/server";

import {
  getDiscordOAuthConfig,
  toAuthUser,
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (!code || !oauthState) {
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
    const user = toAuthUser(discordUser);
    const guilds = discordGuilds
      .map(toManagedServer)
      .filter((guild): guild is NonNullable<typeof guild> => Boolean(guild));
    const sessionId = await createDiscordSession(user, guilds);
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
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return errorRedirect(request, "discord_oauth_failed");
  }
}
