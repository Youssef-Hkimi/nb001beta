"use client";

import { Avatar, Button, Card, Chip } from "@heroui/react";
import { Eye, Users } from "lucide-react";

import { formatCount, initials } from "@/lib/format";
import { ListingStatusChip } from "@/components/listing/listing-safety";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";

export type ServerListingPreviewModel = {
  name: string;
  shortDescription: string;
  category: string;
  tags: string[];
  members: number;
  online: number;
  verified: boolean;
  bannerPreview?: string | null;
  iconPreview?: string | null;
  bannerHue?: string;
};

export function ServerCardPreview({ model }: { model: ServerListingPreviewModel }) {
  const hue = model.bannerHue ?? "220";

  return (
    <Card className="server-listing-card nexus-card hover-lift group w-full min-w-0 overflow-hidden p-0">
      <div className="relative">
        <div className="server-listing-banner">
          {model.bannerPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.bannerPreview}
              alt=""
              className="block h-32 w-full object-cover md:h-[8.5rem]"
            />
          ) : (
            <div
              aria-hidden
              className="h-32 w-full md:h-[8.5rem]"
              style={{
                background: `linear-gradient(135deg, hsl(${hue} 72% 58%) 0%, hsl(${hue} 65% 42%) 48%, hsl(${Number(hue) + 28} 70% 48%) 100%)`,
              }}
            />
          )}
        </div>
        <div className="absolute -bottom-7 left-4">
          <Avatar className="server-listing-icon size-14 border-2 border-background shadow-md">
            {model.iconPreview ? (
              <Avatar.Image src={model.iconPreview} alt="" className="h-full w-full object-cover" />
            ) : null}
            <Avatar.Fallback className="server-listing-icon bg-accent/20 text-sm font-bold text-accent">
              {initials(model.name || "SV")}
            </Avatar.Fallback>
          </Avatar>
        </div>
      </div>

      <Card.Header className="mt-8 gap-1 px-4 pt-0">
        <div className="flex items-center gap-2">
          <Card.Title className="text-base">{model.name || "Server name"}</Card.Title>
          {model.verified ? <VerifiedBadgeIcon className="size-4 text-accent" /> : null}
          <ListingStatusChip status="PENDING_REVIEW" livePrefix />
        </div>
        <Card.Description className="line-clamp-2 text-sm leading-relaxed">
          {model.shortDescription || "Your short description will appear here."}
        </Card.Description>
      </Card.Header>

      <Card.Content className="space-y-3 px-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {formatCount(model.members)} members
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {formatCount(model.online)} online
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip size="sm" variant="soft" color="accent">
            <Chip.Label>{model.category || "Category"}</Chip.Label>
          </Chip>
          {(model.tags.length ? model.tags : ["Tag"]).slice(0, 2).map((tag) => (
            <Chip key={tag} size="sm" variant="soft">
              <Chip.Label>{tag}</Chip.Label>
            </Chip>
          ))}
        </div>
      </Card.Content>

      <Card.Footer className="gap-2 px-4 pb-4">
        <Button className="min-w-[7.5rem] px-4">Join Server</Button>
        <Button variant="secondary">
          <Eye className="size-4" />
          View
        </Button>
      </Card.Footer>
    </Card>
  );
}
