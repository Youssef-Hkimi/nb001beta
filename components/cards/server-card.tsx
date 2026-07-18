"use client";

import { Avatar, Button, Card, Chip, toast } from "@heroui/react";
import { Eye, Users } from "lucide-react";

import { ListingActionGuard, ListingStatusChip } from "@/components/listing/listing-safety";
import { GradientBanner } from "@/components/ui/gradient-banner";
import { LinkButton } from "@/components/ui/link-button";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";
import { formatCount, initials } from "@/lib/format";
import type { ServerListing } from "@/lib/types";

export function ServerCard({
  server,
  compact = false,
}: {
  server: ServerListing;
  compact?: boolean;
}) {
  return (
    <Card className="server-listing-card nexus-card hover-lift group w-full min-w-0 overflow-hidden p-0">
      <div className="relative">
        <div className="server-listing-banner">
          <GradientBanner hue={server.bannerHue} className="h-32 w-full md:h-[8.5rem]" />
        </div>
        <div className="absolute -bottom-7 left-4">
          <Avatar className="server-listing-icon size-14 border-2 border-background shadow-md">
            <Avatar.Fallback className="server-listing-icon bg-accent/20 text-sm font-bold text-accent">
              {initials(server.name)}
            </Avatar.Fallback>
          </Avatar>
        </div>
      </div>

      <Card.Header className="mt-8 gap-1 px-4 pt-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Card.Title className="min-w-0 max-w-full truncate text-base">{server.name}</Card.Title>
          {server.verified ? <VerifiedBadgeIcon className="size-4 text-accent" /> : null}
          <ListingStatusChip status={server.safetyStatus} />
        </div>
        <Card.Description className="line-clamp-2 text-sm leading-relaxed">
          {server.description}
        </Card.Description>
      </Card.Header>

      <Card.Content className="space-y-3 px-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {formatCount(server.members)} members
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {formatCount(server.online)} online
          </span>
        </div>

        <div className="flex min-w-0 flex-wrap gap-1.5 overflow-hidden">
          <Chip size="sm" variant="soft" color="accent" className="max-w-full">
            <Chip.Label className="max-w-[8rem] truncate">{server.category}</Chip.Label>
          </Chip>
          {server.tags.slice(0, compact ? 1 : 2).map((tag) => (
            <Chip key={tag} size="sm" variant="soft" className="max-w-full">
              <Chip.Label className="max-w-[8rem] truncate">{tag}</Chip.Label>
            </Chip>
          ))}
        </div>
      </Card.Content>

      <Card.Footer className="gap-2 px-4 pb-4">
        <ListingActionGuard
          status={server.safetyStatus}
          className="min-w-[7.5rem] px-4"
          onPress={() =>
            toast.success(`Opening invite for ${server.name}`, {
              description: "Invite flow is mocked in this demo.",
            })
          }
        >Join Server</ListingActionGuard>
        {server.id === "preview" ? (
          <Button variant="secondary" isDisabled>
            <Eye className="size-4" />
            View
          </Button>
        ) : (
          <LinkButton href={`/server/${server.id}`} variant="secondary">
            <Eye className="size-4" />
            View
          </LinkButton>
        )}
      </Card.Footer>
    </Card>
  );
}

export function ServerPreviewCard({
  name,
  description,
  category,
  tags,
  members,
  online,
  verified,
  bannerHue = "220",
}: {
  name: string;
  description: string;
  category: string;
  tags: string[];
  members: number;
  online: number;
  verified?: boolean;
  bannerHue?: string;
}) {
  const preview: ServerListing = {
    id: "preview",
    name: name || "Server name",
    description: description || "Your short description will appear here.",
    members: members || 0,
    online: online || 0,
    category: category || "Social",
    tags: tags.length ? tags : ["Tag"],
    verified: Boolean(verified),
    language: "English",
    activity: "medium",
    bannerHue,
    communityFeatures: [],
    safetyStatus: "PENDING_REVIEW",
  };

  return <ServerCard server={preview} />;
}
