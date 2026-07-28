"use client";

import { Avatar, Card } from "@heroui/react";
import { ArrowUpRight, Bot, Plus } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";
import { formatCount, initials } from "@/lib/format";
import { usePublicBotListings } from "@/lib/use-public-listings";
import darkBanner from "@/darkbanner.webp";
import lightBanner from "@/lightbanner.webp";

export function ExploreSidebar() {
  const {listings, loading, error} = usePublicBotListings();
  const topBots = [...listings]
    .sort((a, b) => (b.servers ?? -1) - (a.servers ?? -1) || b.votes - a.votes)
    .slice(0, 5);

  return (
    <aside className="space-y-4">
      <Card className="nexus-card-elevated gap-3">
        <Card.Header>
          <Card.Title className="text-base">Top Bots</Card.Title>
          <Card.Description>Leading live bot listings</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-3">
          {loading ? (
            <p className="rounded-xl bg-default/40 px-3 py-4 text-center text-sm text-muted">
              Loading live bots…
            </p>
          ) : null}
          {!loading && error ? (
            <p className="rounded-xl bg-danger/10 px-3 py-4 text-center text-sm text-danger">
              Top bots are temporarily unavailable.
            </p>
          ) : null}
          {!loading && !error && topBots.length === 0 ? (
            <p className="rounded-xl bg-default/40 px-3 py-4 text-center text-sm text-muted">
              No public bots yet.
            </p>
          ) : null}
          {topBots.map((bot, index) => (
            <div
              key={bot.id}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors duration-200 hover:bg-default/70"
            >
              <span className="w-5 text-xs font-semibold text-muted">#{index + 1}</span>
              <Avatar className="size-9 rounded-xl">
                {bot.avatar ? (
                  <Avatar.Image alt="" className="rounded-xl object-cover" src={bot.avatar} />
                ) : null}
                <Avatar.Fallback className="rounded-xl bg-accent/15 text-xs font-semibold text-accent">
                  {initials(bot.name)}
                </Avatar.Fallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{bot.name}</p>
                {bot.servers != null ? (
                  <p className="text-xs text-muted">{formatCount(bot.servers)} servers</p>
                ) : null}
              </div>
              <Bot className="size-4 shrink-0 text-muted" />
            </div>
          ))}
        </Card.Content>
        <Card.Footer>
          <LinkButton variant="secondary" className="w-full" href="/bots">
            View all bots
            <ArrowUpRight className="size-4" />
          </LinkButton>
        </Card.Footer>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-[#2D2E33] p-0 text-white shadow-lg">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 dark:opacity-0"
          style={{ backgroundImage: `url(${lightBanner.src})` }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 dark:opacity-100"
          style={{ backgroundImage: `url(${darkBanner.src})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#102033]/85 via-[#102033]/68 to-[#2D2E33]/78" />
        <div className="relative z-10 space-y-3 p-5">
          <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">
            Grow on Nexbiy
          </p>
          <h3 className="text-xl font-bold leading-snug">Create. Connect. Grow.</h3>
          <p className="text-sm leading-relaxed text-white/90">
            Add your server or bot to Nexbiy and reach millions of Discord users.
          </p>
          <LinkButton
            className="mt-1 w-full bg-white text-[#102033] hover:bg-white/90"
            variant="secondary"
            href="/dashboard/new"
          >
            <Plus className="size-4" />
            Add Your Server or Bot
          </LinkButton>
        </div>
      </Card>
    </aside>
  );
}
