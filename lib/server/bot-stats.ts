import "server-only";

import {createOpaqueToken, hashSensitiveValue} from "@/lib/server/security";

const BOT_STATS_TOKEN_PREFIX = "nbx_stats_";

export function createBotStatsCredential() {
  const token = `${BOT_STATS_TOKEN_PREFIX}${createOpaqueToken(32)}`;
  return {
    token,
    tokenHash: hashSensitiveValue(token),
    tokenPrefix: token.slice(0, 18),
  };
}

export function hashBotStatsToken(token: string) {
  return hashSensitiveValue(token);
}
