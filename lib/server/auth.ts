import "server-only";

import type {NextRequest} from "next/server";

import {
  DISCORD_SESSION_COOKIE,
  getDiscordSession,
  type DiscordSession,
} from "@/lib/auth/discord-session";
import {assertSameOrigin} from "@/lib/server/security";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message = code,
  ) {
    super(message);
  }
}

export async function requireSession(request: NextRequest): Promise<DiscordSession> {
  try {
    assertSameOrigin(request);
  } catch {
    throw new ApiError(403, "cross_site_request_blocked");
  }
  const session = await getDiscordSession(request.cookies.get(DISCORD_SESSION_COOKIE)?.value);
  if (!session) throw new ApiError(401, "authentication_required");
  return session;
}

export async function requireStaff(
  request: NextRequest,
  allowed: DiscordSession["role"][] = ["moderator", "admin", "super_admin"],
) {
  const session = await requireSession(request);
  if (!allowed.includes(session.role)) throw new ApiError(403, "insufficient_permissions");
  return session;
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({error: error.code}, {status: error.status});
  }
  if (error instanceof Error && error.message.includes("vote_cooldown_active")) {
    return Response.json({error: "vote_cooldown_active"}, {status: 409});
  }
  if (error instanceof Error && error.message.includes("rate_limit_exceeded")) {
    return Response.json({error: "rate_limit_exceeded"}, {status: 429});
  }
  console.error("API request failed", error);
  return Response.json({error: "internal_error"}, {status: 500});
}
