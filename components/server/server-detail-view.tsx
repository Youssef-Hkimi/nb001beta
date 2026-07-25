"use client";

import {
  Avatar,
  Button,
  Card,
  Chip,
  Dropdown,
  Separator,
  toast,
} from "@heroui/react";
import {
  ArrowLeft,
  Calendar,
  Copy,
  Flag,
  Globe2,
  Link2,
  MoreHorizontal,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FormattedDescription } from "@/components/forms/rich-description-editor";
import { ListingVoteDialog, useListingVote } from "@/components/listing/listing-like";
import { ReportListingDialog } from "@/components/listing/report-listing-dialog";
import { LinkButton } from "@/components/ui/link-button";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";
import { ListingActionGuard, ListingSafeBadge, ListingStatusChip, TrustSafetyCard } from "@/components/listing/listing-safety";
import { getCommunityFeatureOptions } from "@/lib/data/community-features";
import { getSimilarServers } from "@/lib/data/server-details";
import { formatCount, initials } from "@/lib/format";
import { getServerBannerUrl } from "@/lib/server-banner";
import { getListingActionBlockReason } from "@/lib/listing-safety";
import {trackListingEvent} from "@/lib/listing-events";
import type { ServerDetail } from "@/lib/types";

export function ServerDetailView({ server }: { server: ServerDetail }) {
  const similar = useMemo(
    () => server.databaseId ? [] : getSimilarServers(server),
    [server],
  );
  const communityFeatures = useMemo(
    () => getCommunityFeatureOptions(server.communityFeatures),
    [server.communityFeatures],
  );
  const vote = useListingVote({
    listingKey: `server:${server.slug}`,
    listingId: server.databaseId,
    initialVotes: typeof server.likes === "number" ? server.likes : server.stats?.likes ?? 0,
  });
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    trackListingEvent(server.databaseId, "view");
  }, [server.databaseId]);

  const copyInvite = () => {
    trackListingEvent(server.databaseId, "link_copy");
    void navigator.clipboard?.writeText(server.inviteUrl).catch(() => undefined);
    toast.success("Invite copied", { description: server.inviteUrl });
  };

  const joinServer = () => {
    trackListingEvent(server.databaseId, "invite_click");
    window.open(server.inviteUrl, "_blank", "noopener,noreferrer");
  };

  const bannerUrl = useMemo(
    () => server.bannerUrl || getServerBannerUrl(server.slug, server.bannerHue),
    [server.bannerUrl, server.slug, server.bannerHue],
  );

  return (
    <div className="theme-surface min-h-screen pb-16">
      {/* Hero — cinematic banner + profile header */}
      <section className="relative">
        <div
          className="server-hero-banner hero-image-wrapper"
          role="img"
          aria-label={`${server.name} banner`}
          style={{ backgroundImage: `url("${bannerUrl}")` }}
        />

        <div className="server-hero-profile">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 pb-8 md:flex-row md:items-end md:justify-between md:px-6 lg:px-8">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="server-hero-avatar size-24 shrink-0 rounded-3xl border-4 border-background shadow-lg md:size-28">
                {server.iconUrl ? <Avatar.Image src={server.iconUrl} alt="" className="rounded-3xl object-cover" /> : null}
                <Avatar.Fallback
                  className="rounded-3xl text-xl font-bold text-white"
                  style={{
                    background: `linear-gradient(145deg, hsl(${server.bannerHue} 60% 48%), hsl(${(Number(server.bannerHue) + 35) % 360} 55% 38%))`,
                  }}
                >
                  {initials(server.name)}
                </Avatar.Fallback>
              </Avatar>

              <div className="min-w-0 space-y-2 pb-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {server.name}
                  </h1>
                  {server.verified ? (
                    <Chip color="accent" size="sm" variant="soft">
                      <VerifiedBadgeIcon className="size-3.5 text-accent" />
                      <Chip.Label>Verified</Chip.Label>
                    </Chip>
                  ) : null}
                  <Chip size="sm" variant="soft" color="accent">
                    <Chip.Label>{server.category}</Chip.Label>
                  </Chip>
                  <ListingStatusChip status={server.safetyStatus} />
                  {server.safeBadge ? <ListingSafeBadge /> : null}
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                  {server.shortDescription}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4 text-accent" />
                    {formatCount(server.members)} members
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    {formatCount(server.online)} online
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 className="size-4" />
                    {server.language}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {server.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      onClick={() => toast.info(`Tag: ${tag}`)}
                    >
                      <Chip
                        size="sm"
                        variant="soft"
                        className="cursor-pointer transition-colors duration-200 hover:bg-accent/15"
                      >
                        <Chip.Label>{tag}</Chip.Label>
                      </Chip>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end md:pb-1">
              <ListingActionGuard
                status={server.safetyStatus}
                variant={vote.isCoolingDown ? "primary" : "secondary"}
                className={
                  vote.isCoolingDown
                    ? "bg-[#629BF8] text-white transition-colors duration-200 hover:bg-[#629BF8]/90"
                    : "transition-colors duration-200"
                }
                onPress={vote.addVote}
              >
                <ThumbsUp className={`size-4 ${vote.isCoolingDown ? "fill-current" : ""}`} />
                Vote
                <span className="text-xs opacity-90">{formatCount(vote.voteCount)}</span>
              </ListingActionGuard>
              <ListingActionGuard status={server.safetyStatus} variant="secondary" onPress={copyInvite}>
                <Copy className="size-4" />
                Copy Invite
              </ListingActionGuard>
              <ListingActionGuard status={server.safetyStatus} onPress={joinServer}>
                <Link2 className="size-4" />
                Join Server
              </ListingActionGuard>
              <Dropdown>
                <Dropdown.Trigger
                  aria-label="More actions"
                  className="button button--ghost button--icon-only"
                >
                  <MoreHorizontal className="size-4" />
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu
                    onAction={(key) => {
                      if (key === "report") setReportOpen(true);
                      if (key === "copy" && !getListingActionBlockReason(server.safetyStatus)) copyInvite();
                    }}
                  >
                    <Dropdown.Item id="copy" textValue="Copy invite" isDisabled={Boolean(getListingActionBlockReason(server.safetyStatus))}>
                      <Copy className="size-4" />
                      Copy invite
                    </Dropdown.Item>
                    <Dropdown.Item id="report" textValue="Report server" variant="danger">
                      <Flag className="size-4" />
                      Report
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 xl:grid-cols-[minmax(0,1.7fr)_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <LinkButton href="/server" variant="ghost" className="w-fit">
            <ArrowLeft className="size-4" />
            Back to servers
          </LinkButton>

          {/* About — description only */}
          <Card className="nexus-card gap-4">
            <Card.Header>
              <Card.Title>About this server</Card.Title>
              <Card.Description>What makes {server.name} special</Card.Description>
            </Card.Header>
            <Card.Content>
              <FormattedDescription value={server.longDescription} />
            </Card.Content>
          </Card>

          {/* What you can do here */}
          <Card className="nexus-card gap-4">
            <Card.Header>
              <Card.Title>What you can do here</Card.Title>
              <Card.Description>Community features and spaces</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {communityFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.id}
                      className="hover-lift flex-row gap-3 rounded-2xl border border-border bg-surface/50 p-3 transition-[transform,border-color,background-color] duration-200"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted">
                          {feature.description}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Server Stats + Details */}
          <Card className="nexus-card-elevated gap-4">
            <Card.Header>
              <Card.Title className="text-base">Server Stats</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Members", value: formatCount(server.members) },
                  { label: "Online Now", value: formatCount(server.online) },
                  { label: "Monthly Growth", value: `+${server.stats.monthlyGrowth}%` },
                  { label: "Join Clicks", value: formatCount(server.stats.joinClicks) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-default/50 p-3">
                    <p className="text-xs text-muted">{stat.label}</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
                  Server Details
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 shrink-0 text-muted" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted">Created</p>
                      <p className="text-sm font-medium text-foreground">{server.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe2 className="size-4 shrink-0 text-muted" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted">Region</p>
                      <p className="text-sm font-medium text-foreground">{server.region}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="nexus-card-elevated gap-3">
            <Card.Header>
              <Card.Title className="text-base">Listed by</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <Avatar.Fallback className="bg-accent/15 font-semibold text-accent">
                    {initials(server.owner.name)}
                  </Avatar.Fallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">{server.owner.name}</p>
                    {server.owner.verified ? (
                      <VerifiedBadgeIcon className="size-4 text-accent" />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted">{server.owner.handle}</p>
                </div>
              </div>
            </Card.Content>
          </Card>

          <TrustSafetyCard status={server.safetyStatus} type="server" />

          <Card className="nexus-card-elevated gap-3">
            <Card.Header>
              <Card.Title className="text-base">Similar Servers</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-2">
              {similar.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors duration-200 hover:bg-default/60"
                >
                  <Avatar className="size-10 rounded-xl">
                    <Avatar.Fallback className="rounded-xl bg-accent/15 text-xs font-semibold text-accent">
                      {initials(item.name)}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted">{item.category}</p>
                  </div>
                  <LinkButton href={`/server/${item.id}`} size="sm" variant="tertiary">
                    View
                  </LinkButton>
                </div>
              ))}
            </Card.Content>
          </Card>

          <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#629BF8] to-[#82B0F9] p-0 text-white shadow-lg">
            <div className="space-y-3 p-5">
              <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">
                Ready to join?
              </p>
              <h3 className="text-xl font-bold leading-snug">Ready to join {server.name}?</h3>
              <p className="text-sm text-white/90">
                Jump in, pick your roles, and meet the community.
              </p>
              <div className="flex flex-col gap-2">
                <ListingActionGuard
                  status={server.safetyStatus}
                  className="w-full bg-white text-[#102033] hover:bg-white/90"
                  variant="secondary"
                  onPress={joinServer}
                >
                  Join Server
                </ListingActionGuard>
                <ListingActionGuard
                  status={server.safetyStatus}
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20"
                  variant="tertiary"
                  onPress={copyInvite}
                >
                  <Copy className="size-4" />
                  Copy Invite
                </ListingActionGuard>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <ListingVoteDialog
        listingName={server.name}
        mode={vote.dialogMode}
        open={vote.dialogOpen}
        remaining={vote.remaining}
        onOpenChange={vote.setDialogOpen}
      />

      <ReportListingDialog listingId={server.databaseId} listingName={server.name} isOpen={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
