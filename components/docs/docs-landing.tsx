"use client";

import {Button, Card, Chip, cn} from "@heroui/react";
import {
  ArrowUpRight,
  BookOpen,
  Braces,
  Boxes,
  Check,
  CodeXml,
  Library,
  Network,
  Rocket,
  Sparkles,
  Webhook,
} from "lucide-react";
import {useState} from "react";

import {NexusFooter} from "@/components/layout/nexus-footer";
import {IconifyIcon} from "@/components/ui/iconify-icon";
import {TypingAnimation} from "@/registry/magicui/typing-animation";

const documentationCards = [
  {
    id: "overview",
    title: "Overview",
    description: "Understand the Nexbiy developer platform and its core concepts.",
    icon: BookOpen,
  },
  {
    id: "get-started",
    title: "Get started",
    description: "Prepare your listing and connect your first integration.",
    icon: Rocket,
  },
  {
    id: "api-reference",
    title: "API reference",
    description: "Explore endpoints, authentication, payloads, and responses.",
    icon: Braces,
  },
  {
    id: "webhooks",
    title: "Webhooks",
    description: "Receive listing and platform events as they happen.",
    icon: Webhook,
    comingSoon: true,
  },
];

const integrationPaths = [
  {
    id: "discord-js",
    title: "discord.js",
    description: "JavaScript and TypeScript bots",
    brandIcon: "simple-icons:discorddotjs" as const,
    connectionLabel: "Discord.js integration",
    command: "client.guilds.cache.size",
  },
  {
    id: "discord-py",
    title: "discord.py",
    description: "Python Discord bots",
    brandIcon: "simple-icons:python" as const,
    connectionLabel: "Discord.py integration",
    command: "len(bot.guilds)",
  },
  {
    id: "rest-api",
    title: "Other libraries",
    description: "Use the Nexbiy REST API directly",
    icon: Library,
    connectionLabel: "REST API integration",
    command: "POST /api/bot-stats",
  },
  {
    id: "sharded-bots",
    title: "Sharded bots",
    description: "Report reliable stats at scale",
    icon: Network,
    connectionLabel: "Sharded integration",
    command: "Aggregate shard totals",
  },
];

export function DocsLanding() {
  const [activeDocumentation, setActiveDocumentation] = useState(
    documentationCards[0].id,
  );
  const [activePath, setActivePath] = useState(integrationPaths[0].id);
  const selectedPath =
    integrationPaths.find((path) => path.id === activePath) ??
    integrationPaths[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_16%_10%,rgba(98,155,248,0.22),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(130,176,249,0.16),transparent_30%)]"
      />

      <main className="relative mx-auto w-full max-w-[1180px] px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Chip className="mb-6" color="accent" variant="soft">
              <Chip.Label>Developer platform</Chip.Label>
            </Chip>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Nexbiy Developer Docs:{" "}
              <TypingAnimation
                className="inline-block min-w-[4.5ch] bg-gradient-to-r from-[#629BF8] to-[#82B0F9] bg-clip-text text-transparent"
                words={["API", "SDKs"]}
                typeSpeed={105}
                deleteSpeed={65}
                pauseDelay={1300}
                loop
              />
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Everything you need to connect Discord bots with Nexbiy—REST API
              references, bot-stat reporting, vote events, and community SDKs.
            </p>
          </div>

          <Card className="nexus-card-elevated relative overflow-hidden p-6 shadow-[0_24px_70px_-42px_rgba(98,155,248,0.75)] sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-accent/15 blur-3xl"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                    <CodeXml className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedPath.connectionLabel}
                    </p>
                    <p className="text-xs text-muted">Connection preview</p>
                  </div>
                </div>
                <Chip color="success" size="sm" variant="soft">
                  <Chip.Label>Ready</Chip.Label>
                </Chip>
              </div>

              <div
                aria-live="polite"
                className="mt-6 rounded-2xl bg-surface-2/85 p-4 font-mono text-sm shadow-inner"
              >
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="size-2 rounded-full bg-[#ff6b6b]" />
                  <span className="size-2 rounded-full bg-[#ffd166]" />
                  <span className="size-2 rounded-full bg-[#34d399]" />
                  <span className="ml-2">nexbiy-stats</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-background/70 px-4 py-3">
                  <span className="text-accent">{selectedPath.title}</span>
                  <span className="truncate text-foreground">
                    {selectedPath.command}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 text-sm text-muted">
                <Boxes className="size-4 text-accent" />
                Secure, cached server-count reporting
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-20" aria-labelledby="documentation-map">
          <div className="mb-7">
            <p className="flex items-center gap-2 text-sm font-medium text-accent">
              <Sparkles className="size-4" strokeWidth={1.8} />
              Documentation map
            </p>
            <h2
              id="documentation-map"
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Start with what you need
            </h2>
            <p className="mt-3 max-w-2xl text-muted">
              Select a topic to prepare your developer path.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {documentationCards.map((item) => {
              const Icon = item.icon;
              const isActive = activeDocumentation === item.id;

              return (
                <Button
                  key={item.title}
                  aria-pressed={isActive}
                  className={cn(
                    "group h-auto min-h-44 w-full justify-start whitespace-normal rounded-2xl border p-0 text-left transition-[transform,border-color,box-shadow,background-color] duration-300",
                    isActive
                      ? "border-accent/50 bg-accent/8 shadow-[0_18px_45px_-32px_rgba(98,155,248,0.9)]"
                      : "border-divider bg-surface-1/80 hover:-translate-y-1 hover:border-accent/35 hover:bg-surface-2/80 hover:shadow-lg",
                  )}
                  variant="tertiary"
                  onPress={() => setActiveDocumentation(item.id)}
                >
                  <span className="flex h-full w-full items-start justify-between gap-5 p-6">
                    <span className="block">
                      <span
                        className={cn(
                          "mb-5 flex size-11 items-center justify-center rounded-xl transition-colors duration-300",
                          isActive
                            ? "bg-accent text-white shadow-md"
                            : "bg-accent/10 text-accent group-hover:bg-accent/15",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.8} />
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-lg font-semibold text-foreground">
                        {item.title}
                        {item.comingSoon ? (
                          <Chip color="warning" size="sm" variant="soft">
                            <Chip.Label>Coming soon</Chip.Label>
                          </Chip>
                        ) : null}
                      </span>
                      <span className="mt-2 block max-w-md leading-6 text-muted">
                        {item.description}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                        isActive
                          ? "bg-accent text-white"
                          : "bg-surface-2 text-muted group-hover:bg-accent/10 group-hover:text-accent",
                      )}
                    >
                      {isActive ? (
                        <Check className="size-4" strokeWidth={2} />
                      ) : (
                        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      )}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="choose-path">
          <p className="text-sm font-medium text-accent">Integration guides</p>
          <h2
            id="choose-path"
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Choose your path
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Pick the library or architecture that matches your Discord bot.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {integrationPaths.map((path) => {
              const Icon = path.icon;
              const isActive = activePath === path.id;

              return (
                <Button
                  key={path.title}
                  aria-pressed={isActive}
                  className={cn(
                    "group h-auto min-h-40 w-full justify-start whitespace-normal rounded-2xl border p-0 text-left transition-[transform,border-color,box-shadow,background-color] duration-300",
                    isActive
                      ? "border-accent/50 bg-gradient-to-br from-accent/12 to-surface-1 shadow-[0_16px_40px_-30px_rgba(98,155,248,0.9)]"
                      : "border-divider bg-surface-1/80 hover:-translate-y-1 hover:border-accent/35 hover:bg-surface-2/80",
                  )}
                  variant="tertiary"
                  onPress={() => setActivePath(path.id)}
                >
                  <span className="flex h-full w-full flex-col p-5">
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-xl transition-colors duration-300",
                          isActive
                            ? "bg-accent text-white"
                            : "bg-surface-2 text-accent group-hover:bg-accent/10",
                        )}
                      >
                        {path.brandIcon ? (
                          <IconifyIcon
                            aria-hidden="true"
                            className="size-5"
                            icon={path.brandIcon}
                          />
                        ) : Icon ? (
                          <Icon className="size-5" strokeWidth={1.8} />
                        ) : null}
                      </span>
                      {isActive ? (
                        <span className="flex size-7 items-center justify-center rounded-full bg-accent/15 text-accent">
                          <Check className="size-3.5" strokeWidth={2.2} />
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-6 text-base font-semibold text-foreground">
                      {path.title}
                    </span>
                    <span className="mt-1.5 block leading-5 text-muted">
                      {path.description}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>

          <Card className="mt-5 overflow-hidden border-accent/20 bg-gradient-to-r from-accent/8 via-surface-1 to-[#82B0F9]/8 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                  <CodeXml className="size-5" strokeWidth={1.8} />
                </span>
                <div aria-live="polite">
                  <p className="text-sm text-muted">Selected developer path</p>
                  <p className="font-semibold">{selectedPath.title}</p>
                </div>
              </div>
              <p className="text-sm text-muted">
                Step-by-step setup will open here next.
              </p>
            </div>
          </Card>
        </section>
      </main>

      <NexusFooter />
    </div>
  );
}
