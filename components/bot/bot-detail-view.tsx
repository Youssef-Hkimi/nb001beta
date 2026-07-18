"use client";
/* eslint-disable @next/next/no-img-element */

import { Avatar, Button, Card, Chip, Dropdown, Modal, toast } from "@heroui/react";
import {
  ArrowLeft, Bot as BotIcon, CalendarDays, Copy,
  ExternalLink, Flag, GitBranch, Globe2, Link2, MessageSquare, MoreHorizontal,
  Server, TerminalSquare, ThumbsUp, TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

import { FormattedDescription } from "@/components/forms/rich-description-editor";
import { ListingLikeDialog, useListingLike } from "@/components/listing/listing-like";
import { LinkButton } from "@/components/ui/link-button";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";
import { ListingActionGuard, ListingStatusChip, TrustSafetyCard } from "@/components/listing/listing-safety";
import { getBotBannerUrl } from "@/lib/bot-visuals";
import { getBotFeatureOptions } from "@/lib/data/bot-features";
import { getSimilarBots } from "@/lib/data/bots";
import { formatCount, initials } from "@/lib/format";
import { getListingActionBlockReason } from "@/lib/listing-safety";
import type { BotListing } from "@/lib/types";

export function BotDetailView({ bot }: { bot: BotListing }) {
  const like = useListingLike({ listingKey: `bot:${bot.slug}`, initialLikes: bot.votes });
  const [galleryImage, setGalleryImage] = useState<string | null>(null);
  const features = useMemo(() => getBotFeatureOptions(bot.botFeatures), [bot.botFeatures]);
  const similar = useMemo(() => getSimilarBots(bot), [bot]);
  const banner = bot.banner || getBotBannerUrl(bot.slug, bot.bannerHue);
  const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  const links = [
    bot.githubUrl ? { label: "GitHub Repository", url: bot.githubUrl, icon: GitBranch } : null,
    bot.websiteUrl ? { label: "Website", url: bot.websiteUrl, icon: Globe2 } : null,
    bot.supportServerUrl ? { label: "Support Server", url: bot.supportServerUrl, icon: MessageSquare } : null,
  ].filter((link): link is { label: string; url: string; icon: typeof GitBranch } => Boolean(link));

  return (
    <div className="theme-surface min-h-screen pb-16">
      <section className="relative">
        <div className="bot-hero-banner" role="img" aria-label={`${bot.name} banner`} style={{ backgroundImage: `url("${banner}")` }} />
        <div className="bot-hero-profile">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 pb-8 md:flex-row md:items-end md:justify-between md:px-6 lg:px-8">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="bot-hero-avatar size-24 shrink-0 rounded-3xl border-4 border-background shadow-lg md:size-28">
                {bot.avatar ? <Avatar.Image src={bot.avatar} alt="" /> : null}
                <Avatar.Fallback className="rounded-3xl bg-accent/20 text-xl font-bold text-accent">{initials(bot.name)}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0 space-y-2 pb-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{bot.name}</h1>
                  <Chip size="sm" color="accent" variant="soft"><BotIcon className="size-3.5" /><Chip.Label>{bot.botBadge}</Chip.Label></Chip>
                  {bot.verified ? <Chip size="sm" color="accent" variant="soft"><VerifiedBadgeIcon className="size-3.5 text-accent" /><Chip.Label>Verified</Chip.Label></Chip> : null}
                  <ListingStatusChip status={bot.safetyStatus} />
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted md:text-base">{bot.shortDescription}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                  <span className="inline-flex items-center gap-1.5"><Server className="size-4 text-accent" />{formatCount(bot.servers)} servers</span>
                  <span className="inline-flex items-center gap-1.5"><ThumbsUp className="size-4" />{formatCount(like.likeCount)} likes</span>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{bot.createdAt}</span>
                  <span className="inline-flex items-center gap-1.5 font-mono"><TerminalSquare className="size-4" />Prefix {bot.prefix}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end md:pb-1">
              <ListingActionGuard status={bot.safetyStatus} onPress={() => openExternal(bot.inviteUrl)}><Link2 className="size-4" />Invite Bot</ListingActionGuard>
              <ListingActionGuard status={bot.safetyStatus} variant={like.isCoolingDown ? "primary" : "secondary"} onPress={like.addLike}><ThumbsUp className={`size-4 ${like.isCoolingDown ? "fill-current" : ""}`} />Like</ListingActionGuard>
              {bot.supportServerUrl ? <ListingActionGuard status={bot.safetyStatus} variant="secondary" onPress={() => openExternal(bot.supportServerUrl)}><MessageSquare className="size-4" />Support Server</ListingActionGuard> : null}
              <Dropdown>
                <Dropdown.Trigger aria-label="More actions" className="button button--ghost button--icon-only"><MoreHorizontal className="size-4" /></Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu onAction={(key) => {
                    if (key === "copy" && !getListingActionBlockReason(bot.safetyStatus)) { void navigator.clipboard?.writeText(bot.inviteUrl); toast.success("Bot invite copied"); }
                    if (key === "report") toast.danger("Report submitted for review");
                  }}>
                    <Dropdown.Item id="copy" textValue="Copy bot invite" isDisabled={Boolean(getListingActionBlockReason(bot.safetyStatus))}><Copy className="size-4" />Copy bot invite</Dropdown.Item>
                    <Dropdown.Item id="report" textValue="Report bot" variant="danger"><Flag className="size-4" />Report bot</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,1.75fr)_340px] lg:px-8">
        <main className="min-w-0 space-y-6">
          <LinkButton href="/bots" variant="ghost" className="w-fit"><ArrowLeft className="size-4" />Back to bots</LinkButton>
          <Card className="nexus-card gap-4"><Card.Header><Card.Title>About this bot</Card.Title><Card.Description>What {bot.name} brings to Discord</Card.Description></Card.Header><Card.Content><FormattedDescription value={bot.longDescription} /></Card.Content></Card>

          <Card className="nexus-card gap-4">
            <Card.Header><Card.Title>Bot Features</Card.Title><Card.Description>Features &amp; capabilities</Card.Description></Card.Header>
            <Card.Content><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{features.map((feature) => {
              const Icon = feature.icon;
              return <Card key={feature.id} className="hover-lift flex-row gap-3 rounded-2xl border border-border bg-surface/50 p-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="size-4" /></span><span><span className="block text-sm font-semibold text-foreground">{feature.label}</span><span className="mt-0.5 block text-xs leading-relaxed text-muted">{feature.description}</span></span></Card>;
            })}</div></Card.Content>
          </Card>

          <Card className="nexus-card gap-4">
            <Card.Header><Card.Title>Commands</Card.Title><Card.Description>Popular commands added by the developer</Card.Description></Card.Header>
            <Card.Content className="space-y-2">{bot.commands.map((command) => <Card key={command.id} className="flex-row items-start gap-3 rounded-xl border border-border bg-default/25 p-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><TerminalSquare className="size-4" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><code className="font-mono text-sm font-semibold text-accent">{command.name}</code>{command.category ? <Chip size="sm" variant="soft"><Chip.Label>{command.category}</Chip.Label></Chip> : null}</span><span className="mt-1 block text-sm text-muted">{command.description}</span></span></Card>)}</Card.Content>
          </Card>

          <Card className="nexus-card gap-4">
            <Card.Header><Card.Title>Preview Gallery</Card.Title><Card.Description>Commands, setup, and dashboard screens</Card.Description></Card.Header>
            <Card.Content><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{bot.galleryImages.map((image, index) => <Button key={image} variant="ghost" className="group h-auto overflow-hidden rounded-2xl border border-border p-0" aria-label={`Open ${bot.name} preview ${index + 1}`} onPress={() => setGalleryImage(image)}><img src={image} alt={`${bot.name} preview ${index + 1}`} className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" /></Button>)}</div></Card.Content>
          </Card>

          <Card className="nexus-card gap-4"><Card.Header><Card.Title>Setup / Usage Notes</Card.Title><Card.Description>Quick start for server owners</Card.Description></Card.Header><Card.Content className="space-y-3 text-sm text-foreground/90"><p>Invite the bot with the permissions shown on Discord, then run <code className="rounded bg-default px-1.5 py-0.5 font-mono text-accent">/setup</code>.</p><p>Review role order and channel permissions before enabling moderation or automation features.</p></Card.Content></Card>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="nexus-card-elevated gap-4"><Card.Header><Card.Title className="text-base">Bot Stats</Card.Title></Card.Header><Card.Content className="space-y-3">{[
            { label: "Servers", value: formatCount(bot.servers), icon: Server }, { label: "Likes", value: formatCount(like.likeCount), icon: ThumbsUp }, { label: "Monthly Growth", value: `+${bot.monthlyGrowth}%`, icon: TrendingUp }, { label: "Commands", value: String(bot.commands.length), icon: TerminalSquare }, { label: "Created", value: bot.createdAt, icon: CalendarDays },
          ].map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-default/40 p-3"><Icon className="size-4 shrink-0 text-accent" /><span className="min-w-0 flex-1 text-xs text-muted">{stat.label}</span><span className="text-right text-sm font-semibold text-foreground">{stat.value}</span></div>; })}</Card.Content></Card>

          <Card className="nexus-card gap-4"><Card.Header><Card.Title className="text-base">Developer</Card.Title></Card.Header><Card.Content className="flex items-center gap-3"><Avatar className="size-11 rounded-xl"><Avatar.Fallback className="rounded-xl bg-accent/15 text-sm font-semibold text-accent">{initials(bot.developer.name)}</Avatar.Fallback></Avatar><span><span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">{bot.developer.name}{bot.developer.verified ? <VerifiedBadgeIcon className="size-3.5 text-accent" /> : null}</span><span className="block text-xs text-muted">{bot.developer.handle}</span></span></Card.Content></Card>

          {links.length ? <Card className="nexus-card gap-3"><Card.Header><Card.Title className="text-base">Links</Card.Title></Card.Header><Card.Content className="space-y-2">{links.map((link) => { const Icon = link.icon; return <ListingActionGuard status={bot.safetyStatus} key={link.label} variant="ghost" className="w-full justify-between" onPress={() => openExternal(link.url)}><span className="inline-flex items-center gap-2"><Icon className="size-4 text-accent" />{link.label}</span><ExternalLink className="size-3.5 text-muted" /></ListingActionGuard>; })}</Card.Content></Card> : null}

          <TrustSafetyCard status={bot.safetyStatus} type="bot" />

          <Card className="nexus-card gap-3"><Card.Header><Card.Title className="text-base">Similar Bots</Card.Title></Card.Header><Card.Content className="space-y-3">{similar.map((item) => <div key={item.id} className="flex items-center gap-3"><Avatar className="size-9 rounded-xl">{item.avatar ? <Avatar.Image src={item.avatar} alt="" /> : null}<Avatar.Fallback className="rounded-xl bg-accent/15 text-xs text-accent">{initials(item.name)}</Avatar.Fallback></Avatar><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-foreground">{item.name}</span><span className="block text-xs text-muted">{formatCount(item.servers)} servers</span></span><LinkButton href={`/bots/${item.slug}`} size="sm" variant="ghost">View</LinkButton></div>)}</Card.Content></Card>
        </aside>
      </div>

      <Modal.Backdrop isOpen={Boolean(galleryImage)} onOpenChange={(open) => !open && setGalleryImage(null)}>
        <Modal.Container><Modal.Dialog className="sm:max-w-4xl"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>{bot.name} preview</Modal.Heading></Modal.Header><Modal.Body>{galleryImage ? <img src={galleryImage} alt={`${bot.name} expanded preview`} className="w-full rounded-2xl border border-border" /> : null}</Modal.Body></Modal.Dialog></Modal.Container>
      </Modal.Backdrop>
      <ListingLikeDialog listingName={bot.name} mode={like.dialogMode} open={like.dialogOpen} remaining={like.remaining} onOpenChange={like.setDialogOpen} />
    </div>
  );
}
