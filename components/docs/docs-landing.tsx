"use client";

import {Card, Chip} from "@heroui/react";
import {
  ArrowUpRight,
  BookOpen,
  Braces,
  Boxes,
  CodeXml,
  Library,
  Network,
  Rocket,
  Webhook,
} from "lucide-react";

import {NexusFooter} from "@/components/layout/nexus-footer";
import {IconifyIcon} from "@/components/ui/iconify-icon";
import {TypingAnimation} from "@/registry/magicui/typing-animation";

const documentationCards = [
  {
    title: "Overview",
    description: "Understand the Nexbiy developer platform and its core concepts.",
    icon: BookOpen,
  },
  {
    title: "Get started",
    description: "Prepare your listing and connect your first integration.",
    icon: Rocket,
  },
  {
    title: "API reference",
    description: "Explore endpoints, authentication, payloads, and responses.",
    icon: Braces,
  },
  {
    title: "Webhooks",
    description: "Receive listing and platform events as they happen.",
    icon: Webhook,
    comingSoon: true,
  },
];

const integrationPaths = [
  {
    title: "discord.js",
    description: "JavaScript and TypeScript bots",
    brandIcon: "simple-icons:discorddotjs" as const,
  },
  {
    title: "discord.py",
    description: "Python Discord bots",
    brandIcon: "simple-icons:python" as const,
  },
  {
    title: "Other libraries",
    description: "Use the Nexbiy REST API directly",
    icon: Library,
  },
  {
    title: "Sharded bots",
    description: "Report reliable stats at scale",
    icon: Network,
  },
];

export function DocsLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_18%_12%,rgba(98,155,248,0.18),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(130,176,249,0.12),transparent_28%)]"
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

          <Card className="nexus-card-elevated overflow-hidden p-0">
            <div className="border-b border-divider bg-surface-2/70 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CodeXml className="size-4 text-accent" />
                Nexbiy integration
              </div>
            </div>
            <div className="space-y-4 p-5 font-mono text-sm">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 px-4 py-3">
                <span className="text-muted">POST</span>
                <span className="truncate text-foreground">/api/bot-stats</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <Boxes className="size-4 text-accent" />
                Secure, cached server-count reporting
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-20" aria-labelledby="documentation-map">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Documentation map</p>
              <h2
                id="documentation-map"
                className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Recommended pages
              </h2>
            </div>
            <p className="hidden text-sm text-muted sm:block">
              Full guides will be added next.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {documentationCards.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="nexus-card group min-h-44 p-6 transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                >
                  <div className="flex h-full items-start justify-between gap-5">
                    <div>
                      <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Icon className="size-5" strokeWidth={1.8} />
                      </div>
                      <Card.Title className="flex items-center gap-2 text-lg">
                        {item.title}
                        {item.comingSoon ? (
                          <Chip color="warning" size="sm" variant="soft">
                            <Chip.Label>Coming soon</Chip.Label>
                          </Chip>
                        ) : null}
                      </Card.Title>
                      <Card.Description className="mt-2 max-w-md leading-6">
                        {item.description}
                      </Card.Description>
                    </div>
                    <ArrowUpRight className="size-5 text-muted transition group-hover:text-accent" />
                  </div>
                </Card>
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

              return (
                <Card
                  key={path.title}
                  className="nexus-card min-h-40 p-5 transition duration-200 hover:-translate-y-1 hover:border-accent/40"
                >
                  <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-surface-2 text-accent">
                    {path.brandIcon ? (
                      <IconifyIcon
                        aria-hidden="true"
                        className="size-5"
                        icon={path.brandIcon}
                      />
                    ) : Icon ? (
                      <Icon className="size-5" strokeWidth={1.8} />
                    ) : null}
                  </div>
                  <Card.Title className="text-base">{path.title}</Card.Title>
                  <Card.Description className="mt-1.5 leading-5">
                    {path.description}
                  </Card.Description>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <NexusFooter />
    </div>
  );
}
