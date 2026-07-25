export type ActivityLevel = "high" | "medium" | "low";

export type ListingSafetyStatus = "PENDING_REVIEW" | "SAFE" | "PAUSED" | "SUSPENDED";

export type ListingSafetyFields = {
  safetyStatus: ListingSafetyStatus;
  /** Reputation badge awarded manually by Nexbiy staff; never implied by review status. */
  safeBadge?: boolean;
  reviewedAt?: string;
  pausedAt?: string;
  suspendedAt?: string;
  publicStatusReason?: string;
  previousSafetyStatus?: ListingSafetyStatus;
};

export type ServerListing = ListingSafetyFields & {
  id: string;
  name: string;
  description: string;
  members: number;
  online: number;
  category: string;
  tags: string[];
  verified: boolean;
  language: string;
  activity: ActivityLevel;
  bannerHue: string;
  communityFeatures: string[];
  featured?: boolean;
};

export type ServerOwner = {
  name: string;
  handle: string;
  verified: boolean;
};

export type ServerStats = {
  monthlyGrowth: number;
  joinClicks: number;
  likes: number;
};

export type ServerDetail = ServerListing & {
  slug: string;
  shortDescription: string;
  longDescription: string;
  createdAt: string;
  region: string;
  inviteStatus: string;
  activityLabel: string;
  inviteUrl: string;
  likes: number;
  isLiked: boolean;
  owner: ServerOwner;
  stats: ServerStats;
  similarServerIds: string[];
  trust: {
    inviteChecked: boolean;
    verifiedOwner: boolean;
    moderated: boolean;
    reportAvailable: boolean;
  };
};

export type BotListing = ListingSafetyFields & {
  id: string;
  slug: string;
  name: string;
  verified: boolean;
  status: ListingStatus;
  botBadge: "BOT";
  clientId: string;
  prefix: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  tags: string[];
  botFeatures: string[];
  commands: BotCommand[];
  servers: number;
  votes: number;
  monthlyGrowth: number;
  createdAt: string;
  developer: BotDeveloper;
  avatar: string | null;
  banner: string | null;
  galleryImages: string[];
  githubUrl: string;
  websiteUrl: string;
  supportServerUrl: string;
  inviteUrl: string;
  trustStatus: BotTrustStatus;
  rank?: number;
  bannerHue: string;
  premium?: boolean;
};

export type BotDeveloper = {
  name: string;
  handle: string;
  verified: boolean;
};

export type BotTrustStatus = {
  reviewed: boolean;
  followsDiscordTos: boolean;
  safeListing: boolean;
  reportAvailable: boolean;
};

export type ListingType = "server" | "bot";

/** Unified dashboard status labels (servers + bots). */
export type ListingStatus =
  | "Live"
  | "Draft"
  | "Paused"
  | "Under Review"
  | "Live · Pending Review"
  | "Suspended"
  | "Rejected";

export type BotCommand = {
  id: string;
  name: string;
  description: string;
  category?: string;
};

export type AuthUser = {
  username: string;
  displayName?: string;
  bio?: string;
  inboxNotifications?: boolean;
  notificationPreferences?: {
    listingUpdates?: boolean;
    likeMilestones?: boolean;
    announcements?: boolean;
  };
  socials?: {
    x?: string;
    github?: string;
    roblox?: string;
  };
  avatarUrl: string | null;
  discordId: string;
};

export type DiscordServerRole = "Owner" | "Admin" | "Manage Server";

export type DiscordServer = {
  id: string;
  name: string;
  members: number;
  online: number;
  role: DiscordServerRole;
  category: string;
  tags: string[];
  shortDescription: string;
  fullDescription: string;
  language: string;
  region: string;
  inviteUrl: string;
  bannerHue: string;
  verified: boolean;
  createdAt: string;
  iconUrl?: string | null;
};

export type DashboardListing = ListingSafetyFields & {
  id: string;
  name: string;
  type: ListingType;
  status: ListingStatus;
  views: number;
  clicks: number;
  updated: string;
  category: string;
  description: string;
  bannerHue: string;
};

export type AnalyticsRange = "7d" | "30d" | "90d";

export type ServerAnalytics = {
  listingId: string;
  listingViews: number;
  joinClicks: number;
  confirmedJoins: number;
  likes: number;
  linkCopies: number;
  favorites: number;
  conversionRate: number;
  reviewScore: number;
  percentageChanges: Record<
    | "listingViews"
    | "joinClicks"
    | "confirmedJoins"
    | "likes"
    | "linkCopies"
    | "favorites"
    | "conversionRate"
    | "reviewScore",
    number
  >;
  history: Record<
    AnalyticsRange,
    Array<{ date: string; listingViews: number; joinClicks: number; confirmedJoins: number }>
  >;
};

export type ServerDashboardListing = Omit<DashboardListing, "type" | "status"> & {
  type: "server";
  status: ListingStatus;
  publicPath: string;
  members: number;
  online: number;
  verified: boolean;
  inviteActive: boolean;
  inviteOutdated: boolean;
  inviteLastChecked: string;
  listingCompleteness: number;
  mediaComplete: boolean;
  analytics: ServerAnalytics;
};

export type BotAnalytics = {
  listingId: string;
  listingViews: number;
  inviteClicks: number;
  activeServers: number;
  newServers: number;
  removedServers: number;
  votes: number;
  conversionRate: number;
  percentageChanges: Record<
    | "listingViews"
    | "inviteClicks"
    | "activeServers"
    | "newServers"
    | "removedServers"
    | "votes"
    | "conversionRate",
    number
  >;
  history: Record<
    AnalyticsRange,
    Array<{ date: string; newServers: number; removedServers: number }>
  >;
};

export type BotDashboardListing = Omit<DashboardListing, "type"> & {
  type: "bot";
  publicPath: string;
  prefix: string;
  avatar: string | null;
  analytics: BotAnalytics;
  listingHealth: {
    reviewStatus: string;
    inviteConnected: boolean;
    supportConnected: boolean;
    websiteConnected: boolean;
    githubConnected: boolean;
  };
};

export type ActivityItem = {
  id: string;
  icon: "clicks" | "trending" | "votes" | "views" | "update";
  text: string;
  time: string;
};

export type ChartPoint = {
  label: string;
  views: number;
  clicks: number;
};
