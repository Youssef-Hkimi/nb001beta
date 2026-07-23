import mongoose from "mongoose";

const GUILD_ID_PATTERN = /^\d{17,20}$/;
const LIVE_CACHE_MS = 30_000;
const CACHE_TTL_MS = 10 * 60_000;
const RETRY_DELAYS_MS = [0, 800, 1_600];

const memoryCache = new Map();
let mongoConnectionPromise = null;

const widgetCacheSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    presenceCount: { type: Number, required: true, min: 0 },
    checkedAt: { type: Date, required: true },
    freshUntil: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { bufferCommands: false, versionKey: false },
);

widgetCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DiscordWidgetCache =
  mongoose.models.DiscordWidgetCache ||
  mongoose.model("DiscordWidgetCache", widgetCacheSchema);

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function connectMongo() {
  const mongoUri = process.env.MONGODB_URI?.trim();
  if (!mongoUri) return null;
  if (mongoose.connection.readyState === 1) return DiscordWidgetCache;

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 2_000,
      })
      .then(() => DiscordWidgetCache)
      .catch(() => {
        mongoConnectionPromise = null;
        return null;
      });
  }

  return mongoConnectionPromise;
}

function publicGuild(snapshot, source = "discord") {
  return {
    guildId: snapshot.guildId,
    name: snapshot.name,
    presenceCount: snapshot.presenceCount,
    checkedAt: new Date(snapshot.checkedAt).toISOString(),
    source,
    stale: source === "cache-stale",
  };
}

async function readCachedGuild(guildId, allowStale = false) {
  const now = Date.now();
  const memorySnapshot = memoryCache.get(guildId);

  if (memorySnapshot && new Date(memorySnapshot.expiresAt).getTime() > now) {
    const fresh = new Date(memorySnapshot.freshUntil).getTime() > now;
    if (fresh || allowStale) {
      return publicGuild(memorySnapshot, fresh ? "cache" : "cache-stale");
    }
  }

  const model = await connectMongo();
  if (!model) return null;

  try {
    const snapshot = await model.findOne({
      guildId,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!snapshot) return null;

    memoryCache.set(guildId, snapshot);
    const fresh = new Date(snapshot.freshUntil).getTime() > now;
    return fresh || allowStale
      ? publicGuild(snapshot, fresh ? "cache" : "cache-stale")
      : null;
  } catch {
    return null;
  }
}

async function cacheSuccessfulGuild(guild) {
  const checkedAt = new Date();
  const snapshot = {
    ...guild,
    checkedAt,
    freshUntil: new Date(checkedAt.getTime() + LIVE_CACHE_MS),
    expiresAt: new Date(checkedAt.getTime() + CACHE_TTL_MS),
  };

  memoryCache.set(guild.guildId, snapshot);
  const model = await connectMongo();
  if (!model) return snapshot;

  try {
    await model.findOneAndUpdate(
      { guildId: guild.guildId },
      { $set: snapshot },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch {
    // Mongo is a cache. A temporary cache failure must not block verification.
  }

  return snapshot;
}

async function requestDiscordWidget(guildId, { cacheBust = false } = {}) {
  let lastFailure = { error: "discord_unavailable", status: 502 };

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    if (RETRY_DELAYS_MS[attempt]) await wait(RETRY_DELAYS_MS[attempt]);

    let response;
    try {
      const widgetUrl = new URL(
        `https://discord.com/api/guilds/${guildId}/widget.json`,
      );
      if (cacheBust) widgetUrl.searchParams.set("t", String(Date.now()));

      response = await fetch(
        widgetUrl,
        {
          ...(cacheBust ? { cache: "no-store" } : {}),
          headers: {
            Accept: "application/json",
            ...(cacheBust
              ? { "Cache-Control": "no-cache", Pragma: "no-cache" }
              : {}),
            "User-Agent": "Nexbiy/0.1 (https://github.com/Youssef-Hkimi/NexusBeta)",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(8_000),
        },
      );
    } catch {
      lastFailure = { error: "discord_unavailable", status: 502 };
      continue;
    }

    const payload = await response.json().catch(() => null);

    if (response.ok) {
      if (
        typeof payload?.instant_invite !== "string" ||
        !payload.instant_invite.trim()
      ) {
        return { error: "widget_no_channel", status: 400 };
      }

      if (
        typeof payload?.name !== "string" ||
        typeof payload?.presence_count !== "number"
      ) {
        return { error: "invalid_widget_response", status: 502 };
      }

      return {
        guild: {
          guildId,
          name: payload.name,
          // Discord's public widget exposes live presences, not an exact offline count.
          presenceCount: Math.max(0, Math.floor(payload.presence_count)),
        },
      };
    }

    const discordErrorCode = Number(payload?.code);

    if (discordErrorCode === 10004) {
      return { error: "guild_not_found", status: 404 };
    }

    if (discordErrorCode === 50004) {
      lastFailure = { error: "widget_disabled", status: 403 };
      continue;
    }

    if (response.status === 429) {
      lastFailure = { error: "discord_rate_limited", status: 503 };
      continue;
    }

    lastFailure = { error: "discord_unavailable", status: 502 };
  }

  return lastFailure;
}

export async function verifyDiscordWidget(
  guildId,
  { forceRefresh = true, cacheBust = false } = {},
) {
  const normalizedGuildId = String(guildId ?? "").trim();
  if (!GUILD_ID_PATTERN.test(normalizedGuildId)) {
    return { ok: false, error: "invalid_guild_id", status: 400 };
  }

  if (!forceRefresh) {
    const cachedGuild = await readCachedGuild(normalizedGuildId);
    if (cachedGuild) return { ok: true, verified: true, guild: cachedGuild };
  }

  const discordResult = await requestDiscordWidget(normalizedGuildId, { cacheBust });
  if (discordResult.guild) {
    const snapshot = await cacheSuccessfulGuild(discordResult.guild);
    return {
      ok: true,
      verified: true,
      guild: publicGuild(snapshot),
    };
  }

  const cachedGuild =
    discordResult.error === "discord_unavailable" ||
    discordResult.error === "discord_rate_limited"
      ? await readCachedGuild(normalizedGuildId, true)
      : null;

  return {
    ok: false,
    error: discordResult.error,
    status: discordResult.status,
    ...(cachedGuild ? { cachedGuild } : {}),
  };
}
