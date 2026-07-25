import {createHmac, randomBytes, timingSafeEqual} from "node:crypto";

import type {AuthUser, DiscordServer, DiscordServerRole} from "@/lib/types";

type DiscordUserResponse = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

type DiscordGuildResponse = {
  id: string;
  name: string;
  icon?: string | null;
  owner?: boolean;
  permissions?: string;
  approximate_member_count?: number;
  approximate_presence_count?: number;
};

export function getDiscordOAuthConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Discord OAuth environment variables are missing.");
  }
  return {clientId, clientSecret, redirectUri};
}

function safeNextPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export function createDiscordOAuthState(nextPath: string) {
  const {clientSecret} = getDiscordOAuthConfig();
  const nonce = randomBytes(20).toString("hex");
  const payload = Buffer.from(JSON.stringify({
    nonce,
    nextPath: safeNextPath(nextPath),
    createdAt: Date.now(),
  })).toString("base64url");
  const signature = createHmac("sha256", clientSecret).update(payload).digest("base64url");
  return {state: `${payload}.${signature}`, nonce};
}

export function verifyDiscordOAuthState(value: string | null) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const {clientSecret} = getDiscordOAuthConfig();
  const expected = createHmac("sha256", clientSecret).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      nonce?: unknown;
      nextPath?: unknown;
      createdAt?: unknown;
    };
    if (
      typeof parsed.nonce !== "string"
      || typeof parsed.createdAt !== "number"
      || Date.now() - parsed.createdAt > 10 * 60 * 1000
    ) {
      return null;
    }
    return {nextPath: safeNextPath(parsed.nextPath), nonce: parsed.nonce};
  } catch {
    return null;
  }
}

export function toAuthUser(user: DiscordUserResponse): AuthUser {
  const extension = user.avatar?.startsWith("a_") ? "gif" : "png";
  return {
    discordId: user.id,
    username: user.username,
    displayName: user.global_name || user.username,
    avatarUrl: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`
      : null,
    inboxNotifications: true,
    notificationPreferences: {
      listingUpdates: true,
      likeMilestones: true,
      announcements: true,
    },
  };
}

export function toManagedServer(guild: DiscordGuildResponse): DiscordServer | null {
  const permissions = BigInt(guild.permissions || "0");
  const administratorPermission = BigInt(8);
  const manageGuildPermission = BigInt(32);
  const isAdministrator = (permissions & administratorPermission) === administratorPermission;
  const canManage = guild.owner || isAdministrator || (permissions & manageGuildPermission) === manageGuildPermission;
  if (!canManage) return null;

  const role: DiscordServerRole = guild.owner
    ? "Owner"
    : isAdministrator
      ? "Admin"
      : "Manage Server";
  const iconExtension = guild.icon?.startsWith("a_") ? "gif" : "png";
  const createdAt = new Date(
    Number((BigInt(guild.id) >> BigInt(22)) + BigInt("1420070400000")),
  );

  return {
    id: guild.id,
    name: guild.name,
    members: guild.approximate_member_count ?? 0,
    online: guild.approximate_presence_count ?? 0,
    role,
    category: "Community",
    tags: ["Community"],
    shortDescription: `${guild.name} community on Discord.`,
    fullDescription: `Tell people what makes ${guild.name} a community worth joining.`,
    language: "English",
    region: "Global",
    inviteUrl: "",
    bannerHue: String(Number(BigInt(guild.id) % BigInt(360))),
    verified: false,
    createdAt: createdAt.toLocaleDateString("en", {month: "long", year: "numeric"}),
    iconUrl: guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${iconExtension}?size=128`
      : null,
  };
}

export type {DiscordGuildResponse, DiscordUserResponse};
