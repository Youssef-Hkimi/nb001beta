import "server-only";

import type {AuthUser, DiscordServer} from "@/lib/types";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";
import {createOpaqueToken, getRequestFingerprint, hashSensitiveValue} from "@/lib/server/security";

export const DISCORD_SESSION_COOKIE = "nexus_discord_test_session_v2";
export const DISCORD_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type DiscordSession = {
  userId: string;
  user: AuthUser;
  guilds: DiscordServer[];
  expiresAt: number;
  role: "user" | "moderator" | "admin" | "super_admin";
};

export async function createDiscordSession(userId: string, request: Request) {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + DISCORD_SESSION_MAX_AGE * 1000);
  const fingerprint = getRequestFingerprint(request);
  const {error} = await getSupabaseAdmin().from("sessions").insert({
    user_id: userId,
    token_hash: hashSensitiveValue(token),
    expires_at: expiresAt.toISOString(),
    ip_hash: fingerprint.ipHash,
    user_agent_hash: fingerprint.userAgentHash,
  });
  if (error) throw error;
  return token;
}

export async function getDiscordSession(token: string | undefined): Promise<DiscordSession | null> {
  if (!token || token.length < 32) return null;
  const db = getSupabaseAdmin();
  const {data: session, error: sessionError} = await db
    .from("sessions")
    .select("id,user_id,expires_at,last_seen_at")
    .eq("token_hash", hashSensitiveValue(token))
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (sessionError || !session) return null;

  const [{data: profile}, {data: discord}, {data: guilds}] = await Promise.all([
    db.from("profiles")
      .select("id,username,display_name,avatar_url,bio,role,status,notification_preferences,socials")
      .eq("id", session.user_id)
      .maybeSingle(),
    db.from("discord_accounts")
      .select("discord_user_id")
      .eq("user_id", session.user_id)
      .maybeSingle(),
    db.from("managed_guilds")
      .select("discord_guild_id,name,icon_hash,member_count,presence_count,owner,permissions")
      .eq("user_id", session.user_id)
      .order("name"),
  ]);
  if (!profile || profile.status !== "active" || !discord) return null;

  const preferences = (profile.notification_preferences || {}) as Record<string, boolean>;
  const socials = (profile.socials || {}) as Record<string, string>;
  const user: AuthUser = {
    discordId: discord.discord_user_id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    inboxNotifications: preferences.inbox !== false,
    notificationPreferences: {
      listingUpdates: preferences.listingUpdates !== false,
      likeMilestones: preferences.voteMilestones !== false,
      announcements: preferences.announcements !== false,
    },
    socials: {
      x: socials.x || "",
      github: socials.github || "",
      roblox: socials.roblox || "",
    },
  };
  const managedGuilds: DiscordServer[] = (guilds || []).map((guild) => {
    const permissions = BigInt(guild.permissions || 0);
    const role = guild.owner
      ? "Owner"
      : (permissions & BigInt(8)) === BigInt(8)
        ? "Admin"
        : "Manage Server";
    const extension = guild.icon_hash?.startsWith("a_") ? "gif" : "png";
    return {
      id: guild.discord_guild_id,
      name: guild.name,
      members: guild.member_count,
      online: guild.presence_count,
      role,
      category: "Community",
      tags: ["Community"],
      shortDescription: `${guild.name} community on Discord.`,
      fullDescription: `Tell people what makes ${guild.name} a community worth joining.`,
      language: "English",
      region: "Global",
      inviteUrl: "",
      bannerHue: String(Number(BigInt(guild.discord_guild_id) % BigInt(360))),
      verified: false,
      createdAt: new Date(
        Number((BigInt(guild.discord_guild_id) >> BigInt(22)) + BigInt("1420070400000")),
      ).toLocaleDateString("en", {month: "long", year: "numeric"}),
      iconUrl: guild.icon_hash
        ? `https://cdn.discordapp.com/icons/${guild.discord_guild_id}/${guild.icon_hash}.${extension}?size=256`
        : null,
    };
  });

  if (Date.now() - new Date(session.last_seen_at).getTime() > 5 * 60 * 1000) {
    void db.from("sessions").update({last_seen_at: new Date().toISOString()}).eq("id", session.id);
  }
  return {
    userId: session.user_id,
    user,
    guilds: managedGuilds,
    expiresAt: new Date(session.expires_at).getTime(),
    role: profile.role,
  };
}

export async function deleteDiscordSession(token: string | undefined) {
  if (!token) return;
  await getSupabaseAdmin()
    .from("sessions")
    .update({revoked_at: new Date().toISOString()})
    .eq("token_hash", hashSensitiveValue(token));
}
