import "server-only";

import {ApiError} from "@/lib/server/auth";

type DiscordApplication = {
  approximate_guild_count?: number | null;
};

export async function fetchDiscordApplicationServerCount(applicationId: string) {
  if (!/^\d{15,22}$/.test(applicationId)) {
    throw new ApiError(400, "invalid_discord_application_id");
  }

  const response = await fetch(
    `https://discord.com/api/v10/applications/${applicationId}/rpc`,
    {
      cache: "no-store",
      headers: {Accept: "application/json"},
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new ApiError(400, "discord_application_not_found");
  }

  const application = (await response.json()) as DiscordApplication;
  return Math.max(
    0,
    Math.floor(Number(application.approximate_guild_count) || 0),
  );
}
