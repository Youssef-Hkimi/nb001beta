import type { AuthUser } from "@/lib/types";

/** Mock Discord user used until real OAuth is wired. */
export const MOCK_AUTH_USER: AuthUser = {
  username: "Alex",
  displayName: "Alex",
  bio: "Building welcoming Discord communities and useful bots.",
  inboxNotifications: true,
  notificationPreferences: {
    listingUpdates: true,
    likeMilestones: true,
    announcements: true,
  },
  socials: {
    x: "alexnexbiy",
    github: "alexnexbiy",
    roblox: "AlexNexbiy",
  },
  avatarUrl: null,
  discordId: "mock_discord_user_123",
};

export const AUTH_STORAGE_KEY = "nexus_auth_user_preferences";
