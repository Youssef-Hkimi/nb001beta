import { BOTS } from "@/lib/data/bots";
import type {
  AnalyticsRange,
  BotAnalytics,
  BotDashboardListing,
  ServerAnalytics,
  ServerDashboardListing,
} from "@/lib/types";

const RANGE_LABELS: Record<AnalyticsRange, string[]> = {
  "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "30d": ["Week 1", "Week 2", "Week 3", "Week 4", "Today"],
  "90d": ["Apr", "May", "Jun", "Jul", "Aug", "Today"],
};

const FACTORS = [0.68, 0.76, 0.72, 0.86, 0.92, 1, 0.95];

function buildServerHistory(views: number, clicks: number, joins: number) {
  return Object.fromEntries(
    Object.entries(RANGE_LABELS).map(([range, labels]) => [
      range,
      labels.map((date, index) => {
        const factor = FACTORS[index] ?? 1;
        return {
          date,
          listingViews: Math.round((views / labels.length) * factor),
          joinClicks: Math.round((clicks / labels.length) * factor),
          confirmedJoins: Math.round((joins / labels.length) * factor),
        };
      }),
    ]),
  ) as ServerAnalytics["history"];
}

function buildBotHistory(added: number, removed: number) {
  return Object.fromEntries(
    Object.entries(RANGE_LABELS).map(([range, labels]) => [
      range,
      labels.map((date, index) => {
        const factor = FACTORS[index] ?? 1;
        return {
          date,
          newServers: Math.round((added / labels.length) * factor),
          removedServers: Math.round((removed / labels.length) * factor),
        };
      }),
    ]),
  ) as BotAnalytics["history"];
}

function serverAnalytics(listingId: string, scale: number): ServerAnalytics {
  const listingViews = Math.round(124850 * scale);
  const joinClicks = Math.round(18240 * scale);
  const confirmedJoins = Math.round(12780 * scale);
  const likes = Math.round(42100 * scale);
  const linkCopies = Math.round(6800 * scale);
  const favorites = Math.round(9400 * scale);

  return {
    listingId,
    listingViews,
    joinClicks,
    confirmedJoins,
    likes,
    linkCopies,
    favorites,
    conversionRate: 14.6,
    reviewScore: scale < 0.6 ? 4.6 : 4.8,
    percentageChanges: {
      listingViews: 12.4,
      joinClicks: 8.1,
      confirmedJoins: 9.6,
      likes: 6.8,
      linkCopies: 4.2,
      favorites: 7.3,
      conversionRate: 1.2,
      reviewScore: 0.2,
    },
    history: buildServerHistory(listingViews, joinClicks, confirmedJoins),
  };
}

function botAnalytics(listingId: string, scale: number): BotAnalytics {
  const listingViews = Math.round(186420 * scale);
  const inviteClicks = Math.round(42850 * scale);
  const activeServers = Math.round(24740 * scale);
  const newServers = Math.round(2840 * scale);
  const removedServers = Math.round(420 * scale);
  const votes = Math.round(18360 * scale);

  return {
    listingId,
    listingViews,
    inviteClicks,
    activeServers,
    newServers,
    removedServers,
    votes,
    conversionRate: 23,
    percentageChanges: {
      listingViews: 14.2,
      inviteClicks: 11.8,
      activeServers: 8.7,
      newServers: 12.1,
      removedServers: -3.4,
      votes: 15.6,
      conversionRate: 1.4,
    },
    history: buildBotHistory(newServers, removedServers),
  };
}

export const SERVER_DASHBOARD_LISTINGS: ServerDashboardListing[] = [
  {
    id: "nexus-hub", name: "Nexbiy Hub", type: "server", status: "Live",
    views: 124850, clicks: 18240, updated: "1 day ago", category: "Social",
    description: "Official home for Nexbiy creators, server owners, and growing communities.",
    bannerHue: "220", publicPath: "/server/nexus-hub", members: 128400, online: 18420,
    verified: true, inviteActive: true, inviteOutdated: false, inviteLastChecked: "1 hour ago", listingCompleteness: 85, mediaComplete: true,
    safetyStatus: "SAFE",
    analytics: serverAnalytics("nexus-hub", 1),
  },
  {
    id: "lofi-girl", name: "Lofi Girl", type: "server", status: "Live",
    views: 98760, clicks: 14320, updated: "2 hours ago", category: "Music",
    description: "Chill beats, focused study rooms, and cozy late-night community spaces.",
    bannerHue: "280", publicPath: "/server/lofi-girl", members: 892000, online: 45200,
    verified: true, inviteActive: true, inviteOutdated: false, inviteLastChecked: "2 hours ago", listingCompleteness: 96, mediaComplete: true,
    safetyStatus: "SAFE",
    analytics: serverAnalytics("lofi-girl", 0.79),
  },
  {
    id: "reactflux", name: "ReactFlux", type: "server", status: "Live · Pending Review",
    views: 52440, clicks: 7260, updated: "Yesterday", category: "Tech",
    description: "A focused community for React, Next.js, and frontend engineering builders.",
    bannerHue: "195", publicPath: "/server/reactflux", members: 64200, online: 5100,
    verified: false, inviteActive: true, inviteOutdated: true, inviteLastChecked: "14 days ago", listingCompleteness: 72, mediaComplete: false,
    safetyStatus: "PENDING_REVIEW",
    analytics: serverAnalytics("reactflux", 0.42),
  },
  {
    id: "gaming-central", name: "Gaming Central", type: "server", status: "Paused",
    views: 77410, clicks: 11310, updated: "3 days ago", category: "Gaming",
    description: "Squads, tournaments, game nights, and friendly competitive communities.",
    bannerHue: "255", publicPath: "/server/gaming-central", members: 318600, online: 19740,
    verified: false, inviteActive: true, inviteOutdated: true, inviteLastChecked: "30 days ago", listingCompleteness: 64, mediaComplete: true,
    safetyStatus: "PAUSED", previousSafetyStatus: "SAFE",
    analytics: serverAnalytics("gaming-central", 0.62),
  },
];

export function getMockServerListing(serverId: string) {
  return SERVER_DASHBOARD_LISTINGS.find((listing) => listing.id === serverId);
}

export function getMockServerAnalytics(serverId: string, range: AnalyticsRange) {
  const analytics = getMockServerListing(serverId)?.analytics;
  return analytics ? { ...analytics, selectedHistory: analytics.history[range] } : undefined;
}

export function getServerListingHealth(serverId: string) {
  const listing = getMockServerListing(serverId);
  if (!listing) return undefined;
  return {
    listingStatus: listing.status === "Live · Pending Review" ? "Live" : listing.status,
    pageStatus: listing.safetyStatus,
    inviteStatus: listing.inviteActive ? "Active" : "Inactive",
    completeness: listing.listingCompleteness,
    mediaStatus: listing.mediaComplete ? "Complete" : "Incomplete",
    updated: listing.updated,
  };
}

export function getServerGrowthSuggestions(serverId: string) {
  const listing = getMockServerListing(serverId);
  if (!listing) return [];
  return [
    !listing.mediaComplete
      ? { title: "Add complete server media", description: "A polished banner and icon make the listing easier to recognize.", importance: "High Impact" }
      : { title: "Refresh your banner", description: "Seasonal artwork can help your listing feel active.", importance: "Optional" },
    listing.listingCompleteness < 90
      ? { title: "Add community features", description: "More detail helps visitors understand what your server offers.", importance: "Recommended" }
      : { title: "Keep details current", description: "Review your tags and features as the community changes.", importance: "Recommended" },
    { title: "Share your listing link", description: "Promote your Nexbiy page in trusted community channels.", importance: "High Impact" },
    { title: "Keep the invite active", description: "Test the public invite whenever server permissions change.", importance: "Important" },
  ] as const;
}

const botAvatar = (id: string) => BOTS.find((bot) => bot.id === id)?.avatar ?? null;

export const BOT_DASHBOARD_LISTINGS: BotDashboardListing[] = [
  {
    id: "shield-mod", name: "Shield Mod", type: "bot", status: "Live · Pending Review",
    views: 186420, clicks: 42850, updated: "2 days ago", category: "Moderation",
    description: "Raid protection and trust scoring for safer Discord communities.",
    bannerHue: "0", publicPath: "/bots/shield-mod", prefix: "/", avatar: botAvatar("shield-mod"),
    safetyStatus: "PENDING_REVIEW",
    analytics: botAnalytics("shield-mod", 1),
    listingHealth: { reviewStatus: "Pending Review", inviteConnected: true, supportConnected: true, websiteConnected: true, githubConnected: false },
  },
  {
    id: "helper-ai", name: "Helper AI", type: "bot", status: "Live · Pending Review",
    views: 78300, clicks: 17420, updated: "4 days ago", category: "AI",
    description: "Smart onboarding and server-aware FAQ automation.",
    bannerHue: "185", publicPath: "/bots/helper-ai", prefix: "/", avatar: botAvatar("helper-ai"),
    safetyStatus: "PENDING_REVIEW",
    analytics: botAnalytics("helper-ai", 0.42),
    listingHealth: { reviewStatus: "Not Submitted", inviteConnected: true, supportConnected: true, websiteConnected: false, githubConnected: true },
  },
  {
    id: "economy-pro", name: "Economy Pro", type: "bot", status: "Suspended",
    views: 48470, clicks: 10820, updated: "1 week ago", category: "Economy",
    description: "Currency, shops, and community mini-games in one bot.",
    bannerHue: "45", publicPath: "/bots/economy-pro", prefix: "!", avatar: botAvatar("economy-pro"),
    safetyStatus: "SUSPENDED",
    analytics: botAnalytics("economy-pro", 0.26),
    listingHealth: { reviewStatus: "Not Submitted", inviteConnected: true, supportConnected: false, websiteConnected: true, githubConnected: false },
  },
];
