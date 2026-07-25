import {NextRequest, NextResponse} from "next/server";

import {
  createDiscordOAuthState,
  getDiscordOAuthConfig,
} from "@/lib/auth/discord-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const OAUTH_NONCE_COOKIE = "nexus_discord_oauth_nonce";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  let config: ReturnType<typeof getDiscordOAuthConfig>;
  try {
    config = getDiscordOAuthConfig();
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_not_configured", request.url));
  }

  const {state, nonce} = createDiscordOAuthState(
    safeNextPath(request.nextUrl.searchParams.get("next")),
  );
  const authorizeUrl = new URL("https://discord.com/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("scope", "identify guilds");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("prompt", "consent");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
    priority: "high",
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
