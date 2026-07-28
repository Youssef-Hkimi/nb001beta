import type {
  AnalyticsRange,
  BotDashboardListing,
  BotListing,
  DashboardListing,
  ListingSafetyStatus,
  ListingStatus,
  ServerDashboardListing,
  ServerDetail,
  ServerListing,
} from "@/lib/types";

export type ApiListingMedia = {
  kind: "icon" | "banner" | "gallery";
  position: number;
  url: string;
};

export type ApiListing = {
  id: string;
  slug: string;
  type: "server" | "bot";
  discord_id: string;
  name: string;
  short_description: string;
  long_description: string;
  category: string;
  tags: string[];
  feature_ids: string[];
  language: string;
  region: string;
  invite_url: string;
  support_url: string | null;
  website_url: string | null;
  github_url: string | null;
  bot_prefix: string | null;
  bot_commands: Array<{name: string; description: string}>;
  premium: boolean;
  banner_color: string;
  status: "draft" | "pending_review" | "live" | "paused" | "suspended" | "rejected" | "deleted";
  widget_status: "unverified" | "verified" | "disabled";
  member_count: number;
  online_count: number;
  active_server_count: number | null;
  active_server_count_updated_at?: string | null;
  votes_count: number;
  views_count: number;
  clicks_count: number;
  verified_badge: boolean;
  safe_badge: boolean;
  featured: boolean;
  created_at: string;
  published_at: string | null;
  listing_media: ApiListingMedia[];
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

function media(listing: ApiListing, kind: ApiListingMedia["kind"]) {
  return listing.listing_media
    .filter((item) => item.kind === kind)
    .sort((a, b) => a.position - b.position);
}

function activity(listing: ApiListing): "high" | "medium" | "low" {
  if (!listing.member_count) return "low";
  const ratio = listing.online_count / listing.member_count;
  if (ratio >= 0.08) return "high";
  if (ratio >= 0.025) return "medium";
  return "low";
}

function dashboardStatus(status: ApiListing["status"]): ListingStatus {
  if (status === "live") return "Live";
  if (status === "draft") return "Draft";
  if (status === "paused") return "Paused";
  if (status === "pending_review") return "Live";
  if (status === "suspended") return "Suspended";
  if (status === "rejected") return "Rejected";
  return "Paused";
}

function safetyStatus(status: ApiListing["status"]): ListingSafetyStatus {
  if (status === "pending_review" || status === "draft") return "PENDING_REVIEW";
  if (status === "paused" || status === "rejected" || status === "deleted") return "PAUSED";
  if (status === "suspended") return "SUSPENDED";
  return "SAFE";
}

function updatedLabel(date: string) {
  const elapsed = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function emptyServerHistory() {
  const labels: Record<AnalyticsRange, string[]> = {
    "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "30d": ["Week 1", "Week 2", "Week 3", "Week 4", "Today"],
    "90d": ["Month 1", "Month 2", "Month 3", "Today"],
  };
  return Object.fromEntries(
    Object.entries(labels).map(([range, dates]) => [
      range,
      dates.map((date) => ({date, listingViews: 0, joinClicks: 0, confirmedJoins: 0})),
    ]),
  ) as ServerDashboardListing["analytics"]["history"];
}

function emptyBotHistory() {
  const labels: Record<AnalyticsRange, string[]> = {
    "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "30d": ["Week 1", "Week 2", "Week 3", "Week 4", "Today"],
    "90d": ["Month 1", "Month 2", "Month 3", "Today"],
  };
  return Object.fromEntries(
    Object.entries(labels).map(([range, dates]) => [
      range,
      dates.map((date) => ({date, newServers: 0, removedServers: 0})),
    ]),
  ) as BotDashboardListing["analytics"]["history"];
}

export function apiListingToServer(listing: ApiListing): ServerListing {
  return {
    databaseId: listing.id,
    id: listing.slug,
    name: listing.name,
    description: listing.short_description,
    members: Number(listing.member_count),
    online: Number(listing.online_count),
    category: listing.category,
    tags: listing.tags,
    verified: listing.verified_badge,
    language: listing.language,
    activity: activity(listing),
    bannerHue: "220",
    communityFeatures: listing.feature_ids,
    iconUrl: media(listing, "icon")[0]?.url || null,
    bannerUrl: media(listing, "banner")[0]?.url || null,
    inviteUrl: listing.invite_url,
    featured: listing.featured,
    safetyStatus: safetyStatus(listing.status),
    safeBadge: listing.safe_badge,
  };
}

export function apiListingToServerDetail(listing: ApiListing): ServerDetail {
  const server = apiListingToServer(listing);
  const displayName = listing.profiles?.display_name || listing.profiles?.username || "Nexbiy owner";
  return {
    databaseId: listing.id,
    ...server,
    slug: listing.slug,
    shortDescription: listing.short_description,
    longDescription: listing.long_description,
    createdAt: new Date(listing.created_at).toLocaleDateString("en", {
      month: "long",
      year: "numeric",
    }),
    region: listing.region,
    inviteStatus: listing.widget_status === "verified" ? "Verified" : "Active",
    activityLabel: activity(listing) === "high" ? "Very Active" : activity(listing) === "medium" ? "Active" : "Calm",
    inviteUrl: listing.invite_url,
    likes: Number(listing.votes_count),
    isLiked: false,
    owner: {
      name: displayName,
      handle: `@${listing.profiles?.username || "owner"}`,
      verified: listing.verified_badge,
      avatarUrl: listing.profiles?.avatar_url || null,
    },
    stats: {
      monthlyGrowth: 0,
      joinClicks: Number(listing.clicks_count),
      likes: Number(listing.votes_count),
    },
    similarServerIds: [],
    trust: {
      inviteChecked: listing.widget_status === "verified",
      verifiedOwner: listing.verified_badge,
      moderated: true,
      reportAvailable: true,
    },
  };
}

export function apiListingToBot(listing: ApiListing): BotListing {
  const avatar = media(listing, "icon")[0]?.url || null;
  const banner = media(listing, "banner")[0]?.url || null;
  const developerName = listing.profiles?.display_name || listing.profiles?.username || "Nexbiy developer";
  return {
    id: listing.slug,
    databaseId: listing.id,
    slug: listing.slug,
    name: listing.name,
    verified: listing.verified_badge,
    status: "Live",
    safetyStatus: safetyStatus(listing.status),
    safeBadge: listing.safe_badge,
    botBadge: "BOT",
    clientId: listing.discord_id,
    prefix: listing.bot_prefix || "/",
    shortDescription: listing.short_description,
    longDescription: listing.long_description,
    category: listing.category,
    tags: listing.tags,
    botFeatures: listing.feature_ids,
    commands: (listing.bot_commands || []).map((command, index) => ({
      id: `${listing.id}-${index}`,
      ...command,
    })),
    servers: listing.active_server_count == null ? null : Number(listing.active_server_count),
    votes: Number(listing.votes_count),
    monthlyGrowth: 0,
    createdAt: new Date(listing.created_at).toLocaleDateString("en", {
      month: "long",
      year: "numeric",
    }),
    developer: {
      name: developerName,
      handle: `@${listing.profiles?.username || "developer"}`,
      verified: listing.verified_badge,
      avatarUrl: listing.profiles?.avatar_url || null,
    },
    avatar,
    banner,
    galleryImages: media(listing, "gallery").map((item) => item.url),
    githubUrl: listing.github_url || "",
    websiteUrl: listing.website_url || "",
    supportServerUrl: listing.support_url || "",
    inviteUrl: listing.invite_url,
    trustStatus: {
      reviewed: true,
      followsDiscordTos: true,
      safeListing: listing.safe_badge,
      reportAvailable: true,
    },
    bannerHue: "220",
    premium: listing.premium,
  };
}

export function apiListingToDashboard(listing: ApiListing): DashboardListing {
  const iconUrl = media(listing, "icon")[0]?.url || null;
  const bannerUrl = media(listing, "banner")[0]?.url || null;
  return {
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    type: listing.type,
    status: dashboardStatus(listing.status),
    views: Number(listing.views_count),
    clicks: Number(listing.clicks_count),
    votes: Number(listing.votes_count),
    updated: updatedLabel(listing.created_at),
    category: listing.category,
    description: listing.short_description,
    bannerHue: "220",
    iconUrl,
    bannerUrl,
    publicPath: listing.type === "server" ? `/server/${listing.slug}` : `/bots/${listing.slug}`,
    ownerPreviewPath: `/dashboard/preview/${listing.id}`,
    mediaComplete: Boolean(iconUrl && bannerUrl),
    safetyStatus: safetyStatus(listing.status),
    safeBadge: listing.safe_badge,
  };
}

export function apiListingToServerDashboard(listing: ApiListing): ServerDashboardListing {
  const base = apiListingToDashboard(listing);
  return {
    ...base,
    type: "server",
    publicPath: `/server/${listing.slug}`,
    members: Number(listing.member_count),
    online: Number(listing.online_count),
    verified: listing.verified_badge,
    inviteActive: Boolean(listing.invite_url),
    inviteOutdated: listing.widget_status !== "verified",
    inviteLastChecked: listing.widget_status === "verified" ? "Verified" : "Setup pending",
    listingCompleteness: media(listing, "icon").length && media(listing, "banner").length ? 100 : 75,
    mediaComplete: Boolean(media(listing, "icon").length && media(listing, "banner").length),
    analytics: {
      listingId: listing.id,
      listingViews: Number(listing.views_count),
      joinClicks: Number(listing.clicks_count),
      confirmedJoins: 0,
      likes: Number(listing.votes_count),
      linkCopies: 0,
      favorites: 0,
      conversionRate: listing.views_count
        ? Number(((listing.clicks_count / listing.views_count) * 100).toFixed(1))
        : 0,
      reviewScore: 0,
      percentageChanges: {
        listingViews: 0,
        joinClicks: 0,
        confirmedJoins: 0,
        likes: 0,
        linkCopies: 0,
        favorites: 0,
        conversionRate: 0,
        reviewScore: 0,
      },
      history: emptyServerHistory(),
    },
  };
}

export function apiListingToBotDashboard(listing: ApiListing): BotDashboardListing {
  const base = apiListingToDashboard(listing);
  return {
    ...base,
    type: "bot",
    publicPath: `/bots/${listing.slug}`,
    prefix: listing.bot_prefix || "/",
    avatar: media(listing, "icon")[0]?.url || null,
    galleryImages: media(listing, "gallery").map((item) => item.url),
    analytics: {
      listingId: listing.id,
      listingViews: Number(listing.views_count),
      inviteClicks: Number(listing.clicks_count),
      activeServers: listing.active_server_count == null ? null : Number(listing.active_server_count),
      newServers: 0,
      removedServers: 0,
      votes: Number(listing.votes_count),
      conversionRate: listing.views_count
        ? Number(((listing.clicks_count / listing.views_count) * 100).toFixed(1))
        : 0,
      percentageChanges: {
        listingViews: 0,
        inviteClicks: 0,
        activeServers: 0,
        newServers: 0,
        removedServers: 0,
        votes: 0,
        conversionRate: 0,
      },
      history: emptyBotHistory(),
    },
    listingHealth: {
      reviewStatus: dashboardStatus(listing.status),
      inviteConnected: Boolean(listing.invite_url),
      supportConnected: Boolean(listing.support_url),
      websiteConnected: Boolean(listing.website_url),
      githubConnected: Boolean(listing.github_url),
    },
  };
}
