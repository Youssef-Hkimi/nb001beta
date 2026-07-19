"use client";

import { Avatar, Button, Card, Chip, toast } from "@heroui/react";
import { Bot, Eye, Server, ThumbsUp, TrendingUp } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";
import { ListingActionGuard, ListingStatusChip } from "@/components/listing/listing-safety";
import { getBotBannerUrl } from "@/lib/bot-visuals";
import { getBotFeatureOptions } from "@/lib/data/bot-features";
import { formatCount, initials } from "@/lib/format";
import type { BotListing } from "@/lib/types";

type BotCardModel = Pick<
  BotListing,
  | "id"
  | "slug"
  | "name"
  | "shortDescription"
  | "servers"
  | "votes"
  | "category"
  | "tags"
  | "botFeatures"
  | "verified"
  | "bannerHue"
  | "avatar"
  | "banner"
  | "rank"
  | "premium"
  | "safetyStatus"
> & { bannerColor?: string };

export function BotCard({ bot, isPreview = false }: { bot: BotCardModel; isPreview?: boolean }) {
  const features = getBotFeatureOptions(bot.botFeatures);

  return (
    <Card className="server-listing-card nexus-card hover-lift group overflow-hidden p-0">
      <div className="relative">
        <div className="server-listing-banner">
          {bot.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bot.banner} alt="" className="block h-28 w-full object-cover" />
          ) : bot.bannerColor ? (
            <div
              aria-hidden
              className="h-28 w-full"
              style={{
                background: `linear-gradient(135deg, ${bot.bannerColor}, color-mix(in srgb, ${bot.bannerColor} 72%, #111827))`,
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getBotBannerUrl(bot.slug, bot.bannerHue)}
              alt=""
              className="block h-28 w-full object-cover"
            />
          )}
        </div>
        <div className="absolute -bottom-7 left-4">
          <Avatar className="server-listing-icon size-14 border-2 border-background shadow-md">
            {bot.avatar ? <Avatar.Image src={bot.avatar} alt="" className="h-full w-full object-cover" /> : null}
            <Avatar.Fallback className="server-listing-icon bg-accent/20 text-sm font-bold text-accent">
              {initials(bot.name)}
            </Avatar.Fallback>
          </Avatar>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          {typeof bot.rank === "number" ? (
            <Chip size="sm" variant="soft" className="backdrop-blur-sm">
              <TrendingUp className="size-3.5" />
              <Chip.Label>#{bot.rank}</Chip.Label>
            </Chip>
          ) : null}
          {bot.verified ? (
            <Chip color="accent" size="sm" variant="soft" className="backdrop-blur-sm">
              <VerifiedBadgeIcon className="size-3.5 text-accent" />
              <Chip.Label>Verified</Chip.Label>
            </Chip>
          ) : null}
        </div>
      </div>

      <Card.Header className="mt-8 gap-1 px-4 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <Card.Title className="text-base">{bot.name}</Card.Title>
          <Chip size="sm" variant="soft" color="accent">
            <Bot className="size-3.5" />
            <Chip.Label>BOT</Chip.Label>
          </Chip>
          <ListingStatusChip status={bot.safetyStatus} />
        </div>
        <Card.Description className="line-clamp-2 text-sm leading-relaxed">
          {bot.shortDescription}
        </Card.Description>
      </Card.Header>

      <Card.Content className="space-y-3 px-4 pb-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Server className="size-3.5" />
            {formatCount(bot.servers)} servers
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="size-3.5" />
            {formatCount(bot.votes)} likes
          </span>
        </div>
        <div className="flex min-h-6 flex-wrap items-center gap-1.5 overflow-hidden">
          <Chip size="sm" variant="soft" color="accent"><Chip.Label>{bot.category}</Chip.Label></Chip>
          {features.slice(0, 2).map((feature) => (
            <Chip key={feature.id} size="sm" variant="soft"><Chip.Label>{feature.label}</Chip.Label></Chip>
          ))}
        </div>
      </Card.Content>

      <Card.Footer className="mt-auto flex-wrap items-center gap-2 px-4 pt-1 pb-4">
        <ListingActionGuard
          status={bot.safetyStatus}
          className="min-w-[7rem] flex-1"
          onPress={() => toast.success(`Invite ready for ${bot.name}`, { description: "Bot invite is mocked in this demo." })}
        >Invite</ListingActionGuard>
        {isPreview ? (
          <Button variant="secondary" onPress={() => toast.info("Bot page preview ready")}>
            <Eye className="size-4" />View
          </Button>
        ) : (
          <LinkButton variant="secondary" href={`/bots/${bot.slug}`}>
            <Eye className="size-4" />View
          </LinkButton>
        )}
        {isPreview ? (
          <Button variant="tertiary" onPress={() => toast.info("Likes are available on the public bot page")}>
            <ThumbsUp className="size-4" />Like
          </Button>
        ) : (
          <LinkButton variant="tertiary" href={`/bots/${bot.slug}`}>
            <ThumbsUp className="size-4" />Like
          </LinkButton>
        )}
      </Card.Footer>
    </Card>
  );
}

export function BotPreviewCard({
  name,
  description,
  category,
  tags,
  botFeatures,
  servers,
  votes,
  verified,
  avatar,
  banner,
  bannerHue = "215",
  bannerColor,
}: {
  name: string;
  description: string;
  category: string;
  tags: string[];
  botFeatures: string[];
  servers: number;
  votes: number;
  verified?: boolean;
  avatar?: string | null;
  banner?: string | null;
  bannerHue?: string;
  bannerColor?: string;
}) {
  const preview: BotCardModel = {
    id: "preview",
    slug: "preview",
    name: name || "Bot name",
    shortDescription: description || "Your short description will appear here.",
    servers: servers || 0,
    votes: votes || 0,
    category: category || "Utility",
    tags: tags.length ? tags : ["Feature"],
    botFeatures,
    verified: Boolean(verified),
    bannerHue,
    avatar: avatar ?? null,
    banner: banner ?? null,
    bannerColor,
    safetyStatus: "PENDING_REVIEW",
  };

  return <BotCard bot={preview} isPreview />;
}
