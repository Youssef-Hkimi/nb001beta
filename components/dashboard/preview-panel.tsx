"use client";

import { Button } from "@heroui/react";
import { LayoutGrid, LayoutTemplate } from "lucide-react";

import { BotPreviewCard } from "@/components/cards/bot-card";
import { ListingStatusChip } from "@/components/listing/listing-safety";
import {
  BotPagePreview,
  type BotPagePreviewModel,
} from "@/components/dashboard/bot-page-preview";
import {
  ServerCardPreview,
  type ServerListingPreviewModel,
} from "@/components/dashboard/server-card-preview";
import {
  ServerPagePreview,
  type ServerPagePreviewModel,
} from "@/components/dashboard/server-page-preview";

export type PreviewMode = "listing" | "page";

type ServerPreviewPanelProps = {
  kind: "server";
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  listing: ServerListingPreviewModel;
  page: ServerPagePreviewModel;
};

type BotPreviewPanelProps = {
  kind: "bot";
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  listing: {
    name: string;
    shortDescription: string;
    category: string;
    tags: string[];
    servers: number | null;
    votes: number;
    verified: boolean;
    botFeatures: string[];
    avatarPreview: string | null;
    bannerPreview: string | null;
    bannerHue?: string;
    bannerColor?: string;
  };
  page: BotPagePreviewModel;
};

export type PreviewPanelProps = ServerPreviewPanelProps | BotPreviewPanelProps;

export function PreviewPanel(props: PreviewPanelProps) {
  return (
    <aside className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden">
      <div className="mb-4 shrink-0 space-y-3 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Live preview</h2>
          <p className="text-xs text-muted">
            {props.kind === "server"
              ? "See your server listing update as you edit."
              : "See your bot listing update as you edit."}
          </p>
        </div>

        <div className="flex w-full gap-1 rounded-xl border border-border bg-default/50 p-1">
          <Button
            size="sm"
            className="flex-1"
            variant={props.mode === "listing" ? "primary" : "ghost"}
            onPress={() => props.onModeChange("listing")}
          >
            <LayoutGrid className="size-3.5" />
            Listing Preview
          </Button>
          <Button
            size="sm"
            className="flex-1"
            variant={props.mode === "page" ? "primary" : "ghost"}
            onPress={() => props.onModeChange("page")}
          >
            <LayoutTemplate className="size-3.5" />
            Page Preview
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {props.kind === "server" ? (
          props.mode === "listing" ? (
            <ServerCardPreview model={props.listing} />
          ) : (
            <ServerPagePreview model={props.page} />
          )
        ) : props.mode === "listing" ? (
          <div className="space-y-3">
            <ListingStatusChip status="PENDING_REVIEW" livePrefix />
            <BotPreviewCard
              name={props.listing.name}
              description={props.listing.shortDescription}
              category={props.listing.category}
              tags={props.listing.tags}
              servers={props.listing.servers}
              votes={props.listing.votes}
              verified={props.listing.verified}
              botFeatures={props.listing.botFeatures}
              avatar={props.listing.avatarPreview}
              banner={props.listing.bannerPreview}
              bannerHue={props.listing.bannerHue}
              bannerColor={props.listing.bannerColor}
            />
          </div>
        ) : (
          <BotPagePreview model={props.page} />
        )}
      </div>
    </aside>
  );
}
