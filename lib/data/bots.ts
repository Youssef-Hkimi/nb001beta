import { getBotAvatarUrl, getBotBannerUrl, getBotGalleryImageUrl } from "@/lib/bot-visuals";
import type { BotCommand, BotListing, ListingSafetyStatus, ListingStatus } from "@/lib/types";

type BotSeed = {
  id: string;
  name: string;
  shortDescription: string;
  servers: number;
  votes: number;
  category: string;
  tags: string[];
  botFeatures: string[];
  verified: boolean;
  rank: number;
  bannerHue: string;
  primaryCommand: Omit<BotCommand, "id">;
  developer: string;
  monthlyGrowth: number;
  createdAt: string;
  premium?: boolean;
  status?: ListingStatus;
  safetyStatus?: ListingSafetyStatus;
  githubUrl?: string;
};

function createBot(seed: BotSeed): BotListing {
  const clientId = `1000000000000000${String(seed.rank).padStart(2, "0")}`;
  const safetyStatus = seed.safetyStatus ?? (seed.status === "Live · Pending Review" ? "PENDING_REVIEW" : "SAFE");
  const status = seed.status ?? (safetyStatus === "PAUSED" ? "Paused" : safetyStatus === "PENDING_REVIEW" ? "Live · Pending Review" : safetyStatus === "SUSPENDED" ? "Rejected" : "Live");
  const commands: BotCommand[] = [
    { id: "primary", ...seed.primaryCommand },
    { id: "setup", name: "/setup", description: "Configure the bot for your server.", category: "Setup" },
    { id: "help", name: "/help", description: "View all available commands.", category: "Utility" },
    { id: "status", name: "/status", description: "Check the bot and service status.", category: "Utility" },
  ];

  return {
    id: seed.id,
    slug: seed.id,
    name: seed.name,
    verified: seed.verified,
    status,
    safetyStatus,
    reviewedAt: safetyStatus === "SAFE" ? "2026-07-01" : undefined,
    pausedAt: safetyStatus === "PAUSED" ? "2026-07-10" : undefined,
    suspendedAt: safetyStatus === "SUSPENDED" ? "2026-07-11" : undefined,
    previousSafetyStatus: safetyStatus === "PAUSED" ? "SAFE" : undefined,
    publicStatusReason: safetyStatus === "SUSPENDED" ? "This bot listing is unavailable while Nexus reviews a policy concern." : undefined,
    botBadge: "BOT",
    clientId,
    prefix: "/",
    shortDescription: seed.shortDescription,
    longDescription: `## ${seed.name}\n\n${seed.shortDescription}\n\n**Built for busy Discord communities.** Use the guided setup to configure core features, then fine-tune behavior from the dashboard.\n\n- Fast setup and clear defaults\n- Reliable tools for active communities\n- Helpful commands with contextual responses\n\nRun \`/setup\` after inviting the bot to get started.`,
    category: seed.category,
    tags: seed.tags,
    botFeatures: seed.botFeatures.slice(0, 6),
    commands,
    servers: seed.servers,
    votes: seed.votes,
    monthlyGrowth: seed.monthlyGrowth,
    createdAt: seed.createdAt,
    developer: {
      name: seed.developer,
      handle: `@${seed.developer.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
      verified: seed.verified,
    },
    avatar: getBotAvatarUrl(seed.name, seed.bannerHue),
    banner: getBotBannerUrl(seed.id, seed.bannerHue),
    galleryImages: Array.from({ length: 4 }, (_, index) =>
      getBotGalleryImageUrl(seed.name, index, seed.bannerHue),
    ),
    githubUrl: seed.githubUrl ?? "",
    websiteUrl: `https://${seed.id.replace(/-bot$/, "")}.example.com`,
    supportServerUrl: `https://discord.gg/${seed.id}`,
    inviteUrl: `https://discord.com/oauth2/authorize?client_id=${clientId}`,
    trustStatus: {
      reviewed: safetyStatus === "SAFE",
      followsDiscordTos: safetyStatus === "SAFE",
      safeListing: safetyStatus === "SAFE",
      reportAvailable: true,
    },
    rank: seed.rank,
    bannerHue: seed.bannerHue,
    premium: seed.premium,
  };
}

export const BOTS: BotListing[] = [
  createBot({
    id: "dank-memer", name: "Dank Memer",
    shortDescription: "Currency, memes, and economy chaos that keeps communities coming back.",
    servers: 9800000, votes: 182400, category: "Fun", tags: ["Economy", "Memes", "Games"],
    botFeatures: ["economy", "giveaways", "leveling", "custom-commands", "utility"],
    verified: true, rank: 1, bannerHue: "25", developer: "Dank Labs", monthlyGrowth: 9, createdAt: "January 2017",
    primaryCommand: { name: "/balance", description: "Check your wallet and bank balance.", category: "Economy" },
  }),
  createBot({
    id: "probot", name: "ProBot",
    shortDescription: "Welcome messages, leveling, and moderation tools with a clean dashboard.",
    servers: 11200000, votes: 156200, category: "Utility", tags: ["Leveling", "Welcome", "Mod"],
    botFeatures: ["welcome-system", "leveling", "moderation", "logging", "automations", "utility"],
    verified: true, rank: 2, bannerHue: "215", developer: "ProBot Team", monthlyGrowth: 12, createdAt: "June 2018",
    primaryCommand: { name: "/welcome", description: "Configure welcome messages and roles.", category: "Welcome" },
    githubUrl: "https://github.com/probot/probot",
  }),
  createBot({
    id: "mee6", name: "MEE6",
    shortDescription: "Levels, music, and custom commands for servers that want growth on autopilot.",
    servers: 19500000, votes: 210500, category: "Utility", tags: ["Levels", "Music", "Custom"],
    botFeatures: ["leveling", "music", "custom-commands", "welcome-system", "moderation", "automations"],
    verified: true, rank: 3, bannerHue: "145", developer: "MEE6 Team", monthlyGrowth: 11, createdAt: "February 2016", premium: true,
    primaryCommand: { name: "/rank", description: "View your XP, level, and server rank.", category: "Leveling" },
  }),
  createBot({
    id: "dyno", name: "Dyno",
    shortDescription: "Reliable moderation, automod, and server utilities trusted by huge communities.",
    servers: 8400000, votes: 98400, category: "Moderation", tags: ["Automod", "Logs", "Utility"],
    botFeatures: ["moderation", "logging", "automations", "custom-commands", "welcome-system", "utility"],
    verified: true, rank: 4, bannerHue: "190", developer: "Dyno Team", monthlyGrowth: 8, createdAt: "August 2016",
    primaryCommand: { name: "/ban", description: "Ban a member from the server.", category: "Moderation" },
  }),
  createBot({
    id: "carl-bot", name: "Carl-bot",
    shortDescription: "Reaction roles, logging, and flexible automation without the clutter.",
    servers: 12100000, votes: 142800, category: "Moderation", tags: ["Roles", "Logging", "Automod"],
    botFeatures: ["moderation", "logging", "automations", "custom-commands", "welcome-system", "utility"],
    verified: true, rank: 5, bannerHue: "260", developer: "Carl Team", monthlyGrowth: 10, createdAt: "March 2018",
    primaryCommand: { name: "/reactionrole", description: "Create a reaction role menu.", category: "Roles" },
  }),
  createBot({
    id: "midjourney-bot", name: "Midjourney Bot",
    shortDescription: "Generate stunning AI imagery directly from Discord with collaborative prompts.",
    servers: 21000000, votes: 320100, category: "AI", tags: ["AI", "Art", "Images"],
    botFeatures: ["ai-tools", "custom-commands", "automations", "utility"],
    verified: true, rank: 6, bannerHue: "300", developer: "Midjourney", monthlyGrowth: 18, createdAt: "July 2022", premium: true,
    primaryCommand: { name: "/imagine", description: "Generate an image from a text prompt.", category: "AI" },
  }),
  createBot({
    id: "ticket-tool", name: "Ticket Tool",
    shortDescription: "Support tickets, staff routing, and transcripts for organized help desks.",
    servers: 4200000, votes: 61200, category: "Tickets", tags: ["Support", "Tickets", "Staff"],
    botFeatures: ["tickets", "logging", "automations", "custom-commands", "utility"],
    verified: true, rank: 7, bannerHue: "205", developer: "Ticket Tool", monthlyGrowth: 14, createdAt: "October 2019",
    primaryCommand: { name: "/ticket", description: "Open a private support ticket.", category: "Support" },
  }),
  createBot({
    id: "groovy", name: "Groovy",
    shortDescription: "High-quality music playback, queues, and playlists for hangout voice channels.",
    servers: 5600000, votes: 88400, category: "Music", tags: ["Music", "Queue", "DJ"],
    botFeatures: ["music", "custom-commands", "utility"],
    verified: true, rank: 8, bannerHue: "330", developer: "Groovy Labs", monthlyGrowth: 7, createdAt: "April 2017",
    primaryCommand: { name: "/play", description: "Play a track or add it to the queue.", category: "Music" },
  }),
  createBot({
    id: "giveaway-bot", name: "Giveaway Bot",
    shortDescription: "Run fair giveaways with requirements, multi-winners, and scheduled drops.",
    servers: 3100000, votes: 47800, category: "Giveaways", tags: ["Giveaways", "Events", "Engagement"],
    botFeatures: ["giveaways", "automations", "custom-commands", "utility"],
    verified: false, rank: 9, bannerHue: "45", developer: "Giveaway Studio", monthlyGrowth: 13, createdAt: "May 2020",
    primaryCommand: { name: "/giveaway", description: "Create and schedule a giveaway.", category: "Giveaways" },
  }),
  createBot({
    id: "helper-ai", name: "Helper AI",
    shortDescription: "Context-aware answers, FAQ automation, and smart onboarding for busy servers.",
    servers: 890000, votes: 39200, category: "AI", tags: ["AI", "Support", "FAQ"],
    botFeatures: ["ai-tools", "tickets", "automations", "welcome-system", "utility"],
    verified: true, rank: 10, bannerHue: "185", developer: "Nexus Labs", monthlyGrowth: 21, createdAt: "October 2022",
    primaryCommand: { name: "/ask", description: "Ask the assistant a server-aware question.", category: "AI" },
    safetyStatus: "PENDING_REVIEW", githubUrl: "https://github.com/nexus/helper-ai",
  }),
  createBot({
    id: "economy-pro", name: "Economy Pro",
    shortDescription: "Shops, jobs, gambling games, and leaderboards for thriving economies.",
    servers: 1450000, votes: 52100, category: "Economy", tags: ["Economy", "Shop", "Games"],
    botFeatures: ["economy", "leveling", "giveaways", "custom-commands", "utility"],
    verified: false, rank: 11, bannerHue: "95", developer: "Economy Pro", monthlyGrowth: 15, createdAt: "December 2020",
    primaryCommand: { name: "/shop", description: "Browse items available in the server shop.", category: "Economy" },
    safetyStatus: "SUSPENDED",
  }),
  createBot({
    id: "shield-mod", name: "Shield Mod",
    shortDescription: "Aggressive spam protection, raid mode, and trust scoring for safer servers.",
    servers: 2200000, votes: 67800, category: "Moderation", tags: ["Anti-raid", "Spam", "Security"],
    botFeatures: ["moderation", "logging", "automations", "welcome-system", "custom-commands", "utility"],
    verified: true, rank: 12, bannerHue: "0", developer: "Shield Security", monthlyGrowth: 12, createdAt: "October 2022",
    primaryCommand: { name: "/raidmode", description: "Enable emergency anti-raid protection.", category: "Moderation" },
    safetyStatus: "PENDING_REVIEW", githubUrl: "https://github.com/nexus/shield-mod",
  }),
];

export function getBotBySlug(slug: string) {
  return BOTS.find((bot) => bot.slug === slug || bot.id === slug);
}

export function getSimilarBots(bot: BotListing) {
  return BOTS.filter(
    (candidate) =>
      candidate.id !== bot.id &&
      candidate.safetyStatus !== "PAUSED" && candidate.safetyStatus !== "SUSPENDED" &&
      (candidate.category === bot.category || candidate.tags.some((tag) => bot.tags.includes(tag))),
  ).slice(0, 3);
}

export const TOP_BOTS = BOTS.filter((bot) => bot.safetyStatus !== "PAUSED" && bot.safetyStatus !== "SUSPENDED").slice(0, 5);
