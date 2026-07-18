import { verifyDiscordWidget } from "@/server/discord-widget-service.mjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const guildId =
    typeof payload === "object" && payload !== null && "guildId" in payload
      ? String(payload.guildId).trim()
      : "";
  const forceRefresh =
    typeof payload === "object" && payload !== null && "forceRefresh" in payload
      ? payload.forceRefresh !== false
      : true;
  // This route is called only by the manual publish/verification action.
  const result = await verifyDiscordWidget(guildId, {
    forceRefresh,
    cacheBust: true,
  });

  if ("error" in result && result.error) {
    return Response.json(
      {
        error: result.error,
        ...(result.cachedGuild ? { cachedGuild: result.cachedGuild } : {}),
      },
      {
        status: result.status,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  return Response.json(
    { verified: result.verified, guild: result.guild },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
