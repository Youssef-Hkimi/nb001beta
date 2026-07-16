import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  Gamepad2,
  Gift,
  GraduationCap,
  Handshake,
  Headphones,
  LifeBuoy,
  Mic,
  Newspaper,
  Palette,
  ShieldCheck,
  Smile,
  Store,
  Users,
} from "lucide-react";

export type CommunityFeatureOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const MAX_COMMUNITY_FEATURES = 4;

export const DEFAULT_COMMUNITY_FEATURE_IDS = [
  "study-rooms",
  "music-channels",
  "events",
  "friendly-staff",
] as const;

export const COMMUNITY_FEATURE_OPTIONS: CommunityFeatureOption[] = [
  {
    id: "giveaways",
    label: "Giveaways",
    icon: Gift,
    description: "Community prizes and reward drops.",
  },
  {
    id: "music-channels",
    label: "Music Channels",
    icon: Headphones,
    description: "Share playlists and stream chill tracks.",
  },
  {
    id: "voice-chats",
    label: "Voice Chats",
    icon: Mic,
    description: "Hang out with members in live voice rooms.",
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
    description: "Host weekly events and community hangouts.",
  },
  {
    id: "study-rooms",
    label: "Study Rooms",
    icon: BookOpen,
    description: "Focused spaces for studying and productivity.",
  },
  {
    id: "gaming-squads",
    label: "Gaming Squads",
    icon: Gamepad2,
    description: "Find teammates and play together.",
  },
  {
    id: "custom-roles",
    label: "Custom Roles",
    icon: ShieldCheck,
    description: "Let members pick roles and interests.",
  },
  {
    id: "friendly-staff",
    label: "Friendly Staff",
    icon: Users,
    description: "Helpful moderators and active staff.",
  },
  {
    id: "support-channels",
    label: "Support Channels",
    icon: LifeBuoy,
    description: "Get help from staff or community members.",
  },
  {
    id: "art-sharing",
    label: "Art Sharing",
    icon: Palette,
    description: "Share artwork, edits, and creative projects.",
  },
  {
    id: "memes",
    label: "Memes",
    icon: Smile,
    description: "Fun meme channels and casual humor.",
  },
  {
    id: "news-updates",
    label: "News & Updates",
    icon: Newspaper,
    description: "Stay updated with announcements and news.",
  },
  {
    id: "learning-resources",
    label: "Learning Resources",
    icon: GraduationCap,
    description: "Guides, resources, and helpful learning spaces.",
  },
  {
    id: "safe-moderation",
    label: "Safe Moderation",
    icon: ShieldCheck,
    description: "Clear moderation and safer community spaces.",
  },
  {
    id: "creator-collabs",
    label: "Creator Collabs",
    icon: Handshake,
    description: "Connect with creators and collaborate.",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: Store,
    description: "Trade, promote, or discover useful resources.",
  },
];

export function getCommunityFeatureOptions(ids: readonly string[]) {
  const selected = ids
    .slice(0, MAX_COMMUNITY_FEATURES)
    .map((id) => COMMUNITY_FEATURE_OPTIONS.find((option) => option.id === id))
    .filter((option): option is CommunityFeatureOption => Boolean(option));

  if (selected.length > 0) return selected;

  return DEFAULT_COMMUNITY_FEATURE_IDS.map((id) =>
    COMMUNITY_FEATURE_OPTIONS.find((option) => option.id === id),
  ).filter((option): option is CommunityFeatureOption => Boolean(option));
}
