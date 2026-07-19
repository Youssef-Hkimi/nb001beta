import {NextRequest, NextResponse} from "next/server";

import {
  deleteDiscordSession,
  DISCORD_SESSION_COOKIE,
} from "@/lib/auth/discord-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await deleteDiscordSession(request.cookies.get(DISCORD_SESSION_COOKIE)?.value);
  const response = NextResponse.json({ok: true});
  response.cookies.delete(DISCORD_SESSION_COOKIE);
  return response;
}
