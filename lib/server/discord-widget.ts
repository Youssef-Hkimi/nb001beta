import "server-only";

const GUILD_ID = /^\d{15,22}$/;

export type WidgetResult =
  | {
      ok: true;
      guild: {
        id: string;
        name: string;
        presenceCount: number;
        instantInvite: string;
      };
    }
  | {
      ok: false;
      status: number;
      error:
        | "invalid_guild_id"
        | "guild_not_found"
        | "widget_disabled"
        | "widget_no_channel"
        | "discord_rate_limited"
        | "discord_unavailable";
    };

export async function verifyDiscordWidget(guildId: string): Promise<WidgetResult> {
  if (!GUILD_ID.test(guildId)) {
    return {ok: false, status: 400, error: "invalid_guild_id"};
  }

  const url = new URL(`https://discord.com/api/v10/guilds/${guildId}/widget.json`);
  url.searchParams.set("t", String(Date.now()));
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent": "Nexbiy-Beta/1.0",
      },
      signal: AbortSignal.timeout(8_000),
    });
    const payload = await response.json().catch(() => null);
    if (response.ok) {
      if (typeof payload?.instant_invite !== "string" || !payload.instant_invite.trim()) {
        return {ok: false, status: 400, error: "widget_no_channel"};
      }
      if (typeof payload?.name !== "string" || typeof payload?.presence_count !== "number") {
        return {ok: false, status: 502, error: "discord_unavailable"};
      }
      return {
        ok: true,
        guild: {
          id: guildId,
          name: payload.name,
          presenceCount: Math.max(0, Math.floor(payload.presence_count)),
          instantInvite: payload.instant_invite,
        },
      };
    }
    if (response.status === 429) {
      return {ok: false, status: 503, error: "discord_rate_limited"};
    }
    if (Number(payload?.code) === 10004) {
      return {ok: false, status: 404, error: "guild_not_found"};
    }
    if (Number(payload?.code) === 50004 || response.status === 403 || response.status === 404) {
      return {ok: false, status: 403, error: "widget_disabled"};
    }
    return {ok: false, status: 502, error: "discord_unavailable"};
  } catch {
    return {ok: false, status: 502, error: "discord_unavailable"};
  }
}
