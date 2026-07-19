import {NextRequest, NextResponse} from "next/server";

import {DISCORD_SESSION_COOKIE, getDiscordSession} from "@/lib/auth/discord-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getDiscordSession(request.cookies.get(DISCORD_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({authenticated: false}, {status: 401});
  }
  return NextResponse.json(
    {authenticated: true, user: session.user, guilds: session.guilds},
    {headers: {"Cache-Control": "no-store"}},
  );
}
