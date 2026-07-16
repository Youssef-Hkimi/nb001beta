import type { LucideIcon } from "lucide-react";
import {
  Coins,
  DoorOpen,
  Gift,
  Music,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Ticket,
  TrendingUp,
  Workflow,
  Wrench,
} from "lucide-react";

export type BotFeatureOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const MAX_BOT_FEATURES = 6;

export const DEFAULT_BOT_FEATURE_IDS = [
  "moderation",
  "logging",
  "automations",
  "utility",
] as const;

export const BOT_FEATURE_OPTIONS: BotFeatureOption[] = [
  {
    id: "moderation",
    label: "Moderation",
    icon: ShieldCheck,
    description: "Manage rules, warnings, bans, and server safety.",
  },
  {
    id: "music",
    label: "Music",
    icon: Music,
    description: "Play music and audio inside voice channels.",
  },
  {
    id: "economy",
    label: "Economy",
    icon: Coins,
    description: "Add currency, rewards, shops, and leveling.",
  },
  {
    id: "tickets",
    label: "Tickets",
    icon: Ticket,
    description: "Create support tickets and private help channels.",
  },
  {
    id: "giveaways",
    label: "Giveaways",
    icon: Gift,
    description: "Run giveaways and reward community members.",
  },
  {
    id: "logging",
    label: "Logging",
    icon: ScrollText,
    description: "Track moderation, joins, leaves, edits, and deletes.",
  },
  {
    id: "automations",
    label: "Automations",
    icon: Workflow,
    description: "Automate server tasks and repeated actions.",
  },
  {
    id: "ai-tools",
    label: "AI Tools",
    icon: Sparkles,
    description: "Add AI-powered replies, tools, or smart actions.",
  },
  {
    id: "welcome-system",
    label: "Welcome System",
    icon: DoorOpen,
    description: "Welcome new members with messages and roles.",
  },
  {
    id: "custom-commands",
    label: "Custom Commands",
    icon: TerminalSquare,
    description: "Create custom commands for your community.",
  },
  {
    id: "leveling",
    label: "Leveling",
    icon: TrendingUp,
    description: "Reward active members with XP and ranks.",
  },
  {
    id: "utility",
    label: "Utility",
    icon: Wrench,
    description: "Useful tools for everyday server management.",
  },
];

export function getBotFeatureOptions(ids: readonly string[]) {
  const selected = ids
    .slice(0, MAX_BOT_FEATURES)
    .map((id) => BOT_FEATURE_OPTIONS.find((option) => option.id === id))
    .filter((option): option is BotFeatureOption => Boolean(option));

  if (selected.length > 0) return selected;

  return DEFAULT_BOT_FEATURE_IDS.map((id) =>
    BOT_FEATURE_OPTIONS.find((option) => option.id === id),
  ).filter((option): option is BotFeatureOption => Boolean(option));
}
