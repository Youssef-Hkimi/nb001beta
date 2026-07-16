import { SERVERS } from "@/lib/data/servers";
import type {
  ActivityLevel,
  ServerDetail,
  ServerListing,
} from "@/lib/types";

const activityLabel = (activity: ActivityLevel) => {
  if (activity === "high") return "Very Active";
  if (activity === "medium") return "Active";
  return "Calm";
};

function similarFor(server: ServerListing): string[] {
  return SERVERS.filter(
    (s) =>
      s.id !== server.id &&
      s.safetyStatus !== "PAUSED" && s.safetyStatus !== "SUSPENDED" &&
      (s.category === server.category || s.tags.some((t) => server.tags.includes(t))),
  )
    .slice(0, 3)
    .map((s) => s.id);
}

function buildDetail(server: ServerListing, overrides: Partial<ServerDetail> = {}): ServerDetail {
  const baseLikes = Math.round(server.members * 0.09);
  const base: ServerDetail = {
    ...server,
    slug: server.id,
    shortDescription: server.description,
    longDescription: `${server.name} is a vibrant Discord community for people who love ${server.category.toLowerCase()}. Join active channels, meet new friends, and take part in events that keep the community lively every week.`,
    createdAt: "March 2021",
    region: "Global",
    inviteStatus: "Active",
    activityLabel: activityLabel(server.activity),
    inviteUrl: `https://discord.gg/${server.id}`,
    likes: baseLikes,
    isLiked: false,
    owner: {
      name: `${server.name.split(" ")[0]} Admin`,
      handle: `@${server.id.replace(/-/g, "")}`,
      verified: server.verified,
    },
    stats: {
      monthlyGrowth: Math.max(4, Math.round((server.online / server.members) * 100)),
      joinClicks: Math.round(server.members * 0.12),
      likes: baseLikes,
    },
    similarServerIds: similarFor(server),
    trust: {
      inviteChecked: true,
      verifiedOwner: server.verified,
      moderated: true,
      reportAvailable: true,
    },
  };

  const merged: ServerDetail = {
    ...base,
    ...overrides,
    owner: { ...base.owner, ...overrides.owner },
    stats: { ...base.stats, ...overrides.stats },
    trust: { ...base.trust, ...overrides.trust },
    communityFeatures: overrides.communityFeatures ?? base.communityFeatures,
    similarServerIds: overrides.similarServerIds ?? base.similarServerIds,
  };

  // Keep top-level likes and stats.likes in sync
  const likes = overrides.likes ?? overrides.stats?.likes ?? merged.likes ?? baseLikes;
  merged.likes = likes;
  merged.stats = { ...merged.stats, likes };

  return merged;
}

const DETAIL_OVERRIDES: Record<string, Partial<ServerDetail>> = {
  "lofi-girl": {
    shortDescription:
      "The friendliest community on Discord. Listen to lo-fi, study, relax, and make new friends.",
    longDescription:
      "Lofi Girl is a chill Discord community built for studying, relaxing, listening to music, and meeting calm, friendly people. Join study rooms, share playlists, talk with others, and participate in cozy community events.",
    members: 142000,
    online: 18500,
    likes: 12400,
    createdAt: "March 2021",
    region: "Global",
    tags: ["Study", "Chill", "Lofi", "Community"],
    category: "Music",
    owner: {
      name: "Lofi Team",
      handle: "@lofigirl",
      verified: true,
    },
    stats: {
      monthlyGrowth: 13,
      joinClicks: 18400,
      likes: 12400,
    },
    similarServerIds: ["cozy-corner", "study-together", "anime-soul"],
  },
  "nexus-hub": {
    shortDescription: "Official Nexus community for creators, server owners, and bot builders.",
    longDescription:
      "Nexus Hub is the home base for Discord creators listing servers and bots on Nexus. Share feedback, get listing tips, meet other owners, and stay up to date on product updates and community growth strategies.",
    createdAt: "January 2023",
    likes: 8900,
    owner: {
      name: "Nexus Team",
      handle: "@nexus",
      verified: true,
    },
    stats: {
      monthlyGrowth: 18,
      joinClicks: 15400,
      likes: 8900,
    },
  },
  reactflux: {
    longDescription:
      "ReactFlux is a modern frontend community for React, Next.js, and TypeScript builders. Share what you are shipping, get code review, find collaborators, and stay sharp with real production discussions.",
    createdAt: "June 2022",
    likes: 6200,
  },
  minecraft: {
    longDescription:
      "Minecraft is a hub for builders, redstone engineers, and survival players. Find SMP groups, share screenshots, join events, and connect with players who love creative and competitive play.",
    createdAt: "August 2020",
    likes: 22100,
  },
  "anime-soul": {
    longDescription:
      "Anime Soul brings fans together for watch parties, seasonal recs, manga talk, and character discussions. Friendly channels, active staff, and weekly events make it easy to settle in.",
    createdAt: "April 2021",
    likes: 9800,
  },
};

export const SERVER_DETAILS: ServerDetail[] = SERVERS.map((server) =>
  buildDetail(server, DETAIL_OVERRIDES[server.id]),
);

export function getServerBySlug(slug: string): ServerDetail | undefined {
  return SERVER_DETAILS.find((s) => s.slug === slug || s.id === slug);
}

export function getSimilarServers(detail: ServerDetail): ServerListing[] {
  const ids = detail.similarServerIds;
  const found = ids
    .map((id) => SERVERS.find((s) => s.id === id))
    .filter((s): s is ServerListing => Boolean(s));

  if (found.length >= 3) return found.slice(0, 3);

  const extras = SERVERS.filter(
    (s) => s.id !== detail.id && !found.some((f) => f.id === s.id),
  ).slice(0, 3 - found.length);

  return [...found, ...extras];
}
