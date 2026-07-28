"use client";

import { Avatar, Button, Card, Chip, Separator } from "@heroui/react";
import {
  Bot,
  ExternalLink,
  GitBranch,
  Hash,
  MessageCircle,
  Server,
  TerminalSquare,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

import { FormattedDescription } from "@/components/forms/rich-description-editor";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";
import { getBotBannerUrl } from "@/lib/bot-visuals";
import { getBotFeatureOptions } from "@/lib/data/bot-features";
import { formatCount, initials } from "@/lib/format";
import type { BotCommand } from "@/lib/types";

export type BotPagePreviewModel = {
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  tags: string[];
  clientId: string;
  prefix: string;
  inviteUrl: string;
  supportUrl: string;
  websiteUrl: string;
  githubUrl: string;
  commands: BotCommand[];
  botFeatures: string[];
  verified: boolean;
  servers: number | null;
  votes: number;
  monthlyGrowth: number;
  createdAt: string;
  developerName: string;
  avatarPreview: string | null;
  bannerPreview: string | null;
  galleryImages: string[];
  bannerHue?: string;
  bannerColor?: string;
  statusLabel?: string;
};

export function BotPagePreview({ model }: { model: BotPagePreviewModel }) {
  const name = model.name || "Bot name";
  const commands = model.commands.filter((command) => command.name.trim() || command.description.trim());
  const features = getBotFeatureOptions(model.botFeatures);
  const fallbackBanner = getBotBannerUrl("preview", model.bannerHue ?? "215");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[var(--page-bg)]">
      <div className="relative">
        <div className="hero-image-wrapper h-32 overflow-hidden">
          {model.bannerPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={model.bannerPreview} alt="" className="h-full w-full object-cover" />
          ) : model.bannerColor ? (
            <div
              aria-hidden
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${model.bannerColor}, color-mix(in srgb, ${model.bannerColor} 68%, #111827))`,
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fallbackBanner} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="absolute -bottom-7 left-4 z-10">
          <Avatar className="size-16 rounded-2xl border-2 border-background shadow-md">
            {model.avatarPreview ? <Avatar.Image src={model.avatarPreview} alt="" className="object-cover" /> : null}
            <Avatar.Fallback className="rounded-2xl bg-accent/20 text-sm font-bold text-accent">{initials(name)}</Avatar.Fallback>
          </Avatar>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-10 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <Chip size="sm" variant="soft" color="accent"><Bot className="size-3.5" /><Chip.Label>BOT</Chip.Label></Chip>
            {model.verified ? <Chip size="sm" variant="soft" color="accent"><VerifiedBadgeIcon className="size-3.5 text-accent" /><Chip.Label>Verified</Chip.Label></Chip> : null}
            {model.statusLabel ? <Chip size="sm" variant="soft" color="warning"><Chip.Label>{model.statusLabel}</Chip.Label></Chip> : null}
          </div>
          <p className="mt-1 text-sm text-muted">{model.shortDescription || "Short description appears here."}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><Hash className="size-3.5" />ID: {model.clientId || "—"}</span>
          <span className="inline-flex items-center gap-1"><TerminalSquare className="size-3.5" />Prefix {model.prefix || "/"}</span>
          {model.servers != null ? (
            <span className="inline-flex items-center gap-1"><Server className="size-3.5" />{formatCount(model.servers)} servers</span>
          ) : null}
          <span className="inline-flex items-center gap-1"><ThumbsUp className="size-3.5" />{formatCount(model.votes)} votes</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm">Invite Bot</Button>
          <Button size="sm" variant="secondary"><ThumbsUp className="size-3.5" />Vote</Button>
          {model.supportUrl ? <Button size="sm" variant="secondary"><MessageCircle className="size-3.5" />Support</Button> : null}
        </div>

        <Card className="nexus-card gap-2 p-3">
          <p className="text-xs font-semibold text-foreground">About this bot</p>
          <FormattedDescription value={model.fullDescription || "Long description with formatting will preview here."} />
        </Card>

        <Card className="nexus-card gap-3 p-3">
          <div><p className="text-xs font-semibold text-foreground">Bot Features</p><p className="mt-0.5 text-[10px] text-muted">Features &amp; capabilities</p></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="flex-row items-start gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon className="size-3.5" /></span>
                  <span><span className="block text-xs font-semibold text-foreground">{feature.label}</span><span className="mt-0.5 block text-[10px] leading-relaxed text-muted">{feature.description}</span></span>
                </Card>
              );
            })}
          </div>
        </Card>

        <Card className="nexus-card gap-3 p-3">
          <p className="text-xs font-semibold text-foreground">Commands</p>
          {commands.length ? commands.slice(0, 4).map((command) => (
            <div key={command.id} className="rounded-xl border border-border bg-default/30 px-3 py-2">
              <p className="font-mono text-xs font-semibold text-accent">{command.name || "/command"}</p>
              <p className="mt-0.5 text-[10px] text-muted">{command.description || "Command description"}</p>
            </div>
          )) : <p className="text-xs text-muted">Add at least two commands to preview them here.</p>}
        </Card>

        <Card className="nexus-card gap-3 p-3">
          <p className="text-xs font-semibold text-foreground">Bot Stats</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ...(model.servers != null
                ? [{ label: "Servers", value: formatCount(model.servers), icon: Server }]
                : []),
              { label: "Votes", value: formatCount(model.votes), icon: ThumbsUp },
              { label: "Growth", value: `+${model.monthlyGrowth}%`, icon: TrendingUp },
              { label: "Commands", value: String(commands.length), icon: TerminalSquare },
            ].map((stat) => {
              const Icon = stat.icon;
              return <div key={stat.label} className="rounded-lg bg-default/50 p-2"><p className="flex items-center gap-1 text-[10px] text-muted"><Icon className="size-3" />{stat.label}</p><p className="mt-1 text-sm font-bold text-foreground">{stat.value}</p></div>;
            })}
          </div>
          <Separator />
          <p className="text-[10px] text-muted">Created <span className="font-medium text-foreground">{model.createdAt || "—"}</span></p>
          {model.developerName ? <p className="text-[10px] text-muted">Developer <span className="font-medium text-foreground">{model.developerName}</span></p> : null}
        </Card>

        <Card className="nexus-card gap-3 p-3">
          <p className="text-xs font-semibold text-foreground">Preview Gallery</p>
          <div className="grid grid-cols-2 gap-2">
            {(model.galleryImages.length ? model.galleryImages : [null, null]).slice(0, 4).map((image, index) =>
              image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={image} src={image} alt={`Gallery preview ${index + 1}`} className="aspect-video rounded-lg border border-border object-cover" />
              ) : <div key={index} className="aspect-video rounded-lg border border-dashed border-border bg-default/40" />,
            )}
          </div>
        </Card>

        {model.githubUrl || model.websiteUrl ? (
          <div className="flex flex-wrap gap-2">
            {model.githubUrl ? <Chip size="sm" variant="soft"><GitBranch className="size-3.5" /><Chip.Label>GitHub</Chip.Label></Chip> : null}
            {model.websiteUrl ? <Chip size="sm" variant="soft"><ExternalLink className="size-3.5" /><Chip.Label>Website</Chip.Label></Chip> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
