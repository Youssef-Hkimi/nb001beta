import type { AuthUser } from "@/lib/types";

/** Mock Discord user used until real OAuth is wired. */
export const MOCK_AUTH_USER: AuthUser = {
  username: "Alex",
  displayName: "Alex",
  bio: "Building welcoming Discord communities and useful bots.",
  inboxNotifications: true,
  socials: {
    x: "alexnexus",
    github: "alexnexus",
    roblox: "AlexNexus",
  },
  avatarUrl: null,
  discordId: "mock_discord_user_123",
};

export const AUTH_STORAGE_KEY = "nexus_mock_auth_user";
