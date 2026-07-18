export const SERVER_CATEGORIES = [
  "All",
  "Gaming",
  "Anime",
  "Social",
  "Study",
  "Music",
  "Creator",
  "Roleplay",
  "Tech",
] as const;

export const EXPLORE_CATEGORIES = [
  "Gaming",
  "Anime",
  "Social",
  "Study",
  "Music",
  "Creator",
  "Roleplay",
  "Tech",
] as const;

export const BOT_CATEGORIES = [
  "All",
  "Moderation",
  "Music",
  "Economy",
  "Utility",
  "AI",
  "Fun",
  "Games",
  "Tickets",
  "Giveaways",
] as const;

export const TRENDING_TAGS = [
  "All",
  "Fun",
  "Chill",
  "Memes",
  "Community",
  "Anime",
  "Art",
  "Music",
  "Events",
  "Support",
] as const;

/** Tags available when creating a server listing (max 3). */
export const SERVER_LISTING_TAGS = [
  "Community",
  "Support",
  "Events",
  "Chill",
  "Fun",
  "Memes",
  "Anime",
  "Art",
  "Music",
  "Study",
  "Gaming",
  "Tech",
  "Creator",
  "Roleplay",
  "Friends",
  "Competitive",
] as const;

/** Tags available when creating a bot listing (max 3). */
export const BOT_LISTING_TAGS = [
  "AI",
  "Moderation",
  "Utility",
  "Music",
  "Economy",
  "Games",
  "Fun",
  "Support",
  "Tickets",
  "Giveaways",
  "Leveling",
  "Automod",
  "FAQ",
  "Security",
  "Memes",
  "Events",
] as const;

export const MAX_LISTING_TAGS = 3;

export const LANGUAGES = ["All", "English", "Spanish", "French", "German", "Japanese", "Portuguese"] as const;

export const SERVER_SIZES = ["All", "Small", "Medium", "Large", "Huge"] as const;

export const ACTIVITY_LEVELS = ["All", "High", "Medium", "Low"] as const;

export const SORT_OPTIONS = [
  { id: "trending", label: "Trending" },
  { id: "members", label: "Most members" },
  { id: "newest", label: "Newest" },
  { id: "votes", label: "Most liked" },
] as const;
