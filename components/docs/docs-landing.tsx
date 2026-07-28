"use client";

import {Button, Card, Chip, SearchField, cn} from "@heroui/react";
import {
  AlertTriangle,
  BookOpen,
  Braces,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Gauge,
  KeyRound,
  Library,
  Network,
  Rocket,
  ShieldCheck,
  TerminalSquare,
  Webhook,
  Wrench,
} from "lucide-react";
import {useMemo, useState} from "react";

import {NexusFooter} from "@/components/layout/nexus-footer";
import {IconifyIcon} from "@/components/ui/iconify-icon";
import {LinkButton} from "@/components/ui/link-button";

const REPORTING_ENDPOINT = "https://nb001beta.vercel.app/api/bot-stats";

type IntegrationPath = "discord-js" | "discord-py" | "rest" | "sharded";

type NavigationItem = {
  id: string;
  label: string;
  icon: typeof BookOpen;
  path?: IntegrationPath;
  comingSoon?: boolean;
};

const navigationGroups: {label: string; items: NavigationItem[]}[] = [
  {
    label: "Start here",
    items: [
      {id: "overview", label: "Overview", icon: BookOpen},
      {id: "quickstart", label: "Quickstart", icon: Rocket},
      {id: "authentication", label: "Authentication", icon: KeyRound},
    ],
  },
  {
    label: "Integration guides",
    items: [
      {id: "integration-guide", label: "discord.js", icon: Code2, path: "discord-js"},
      {id: "integration-guide", label: "discord.py", icon: TerminalSquare, path: "discord-py"},
      {id: "integration-guide", label: "Other libraries", icon: Library, path: "rest"},
      {id: "integration-guide", label: "Sharded bots", icon: Network, path: "sharded"},
    ],
  },
  {
    label: "Reference",
    items: [
      {id: "api-reference", label: "API reference", icon: Braces},
      {id: "rate-limits", label: "Rate limits", icon: Gauge},
      {id: "troubleshooting", label: "Troubleshooting", icon: Wrench},
      {id: "security", label: "Security", icon: ShieldCheck},
      {id: "webhooks", label: "Webhooks", icon: Webhook, comingSoon: true},
    ],
  },
];

const integrationPaths: {
  id: IntegrationPath;
  title: string;
  description: string;
  language: string;
  brandIcon?: `${string}:${string}`;
  icon?: typeof Library;
  code: string;
}[] = [
  {
    id: "discord-js",
    title: "discord.js",
    description: "Report the number of guilds cached by your JavaScript or TypeScript bot.",
    language: "JavaScript",
    brandIcon: "simple-icons:discorddotjs",
    code: `const NEXBIY_ENDPOINT = "${REPORTING_ENDPOINT}";

async function reportNexbiyStats(client) {
  const response = await fetch(NEXBIY_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.NEXBIY_STATS_TOKEN}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serverCount: client.guilds.cache.size,
    }),
  });

  if (!response.ok) {
    throw new Error(\`Nexbiy report failed: \${response.status}\`);
  }
}

client.once("ready", async () => {
  await reportNexbiyStats(client);
  setInterval(() => void reportNexbiyStats(client), 6 * 60 * 60 * 1000);
});`,
  },
  {
    id: "discord-py",
    title: "discord.py",
    description: "Use a background task to keep your Python bot listing current.",
    language: "Python",
    brandIcon: "simple-icons:python",
    code: `import os
import aiohttp
from discord.ext import tasks

NEXBIY_ENDPOINT = "${REPORTING_ENDPOINT}"

@tasks.loop(hours=6)
async def report_nexbiy_stats():
    headers = {
        "Authorization": f"Bearer {os.environ['NEXBIY_STATS_TOKEN']}"
    }
    payload = {"serverCount": len(bot.guilds)}

    async with aiohttp.ClientSession() as session:
        async with session.post(
            NEXBIY_ENDPOINT,
            headers=headers,
            json=payload,
        ) as response:
            response.raise_for_status()

@bot.event
async def on_ready():
    if not report_nexbiy_stats.is_running():
        report_nexbiy_stats.start()`,
  },
  {
    id: "rest",
    title: "Other libraries",
    description: "Call the REST endpoint from any runtime that supports HTTPS.",
    language: "cURL",
    icon: Library,
    code: `curl -X POST "${REPORTING_ENDPOINT}" \\
  -H "Authorization: Bearer $NEXBIY_STATS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"serverCount": 1284}'`,
  },
  {
    id: "sharded",
    title: "Sharded bots",
    description: "Aggregate every shard before submitting one total to Nexbiy.",
    language: "JavaScript",
    icon: Network,
    code: `const shardCounts = await client.shard.fetchClientValues(
  "guilds.cache.size"
);

const serverCount = shardCounts.reduce(
  (total, count) => total + Number(count),
  0
);

await fetch("${REPORTING_ENDPOINT}", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.NEXBIY_STATS_TOKEN}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({serverCount}),
});`,
  },
];

const onThisPage = [
  ["overview", "Overview"],
  ["quickstart", "Quickstart"],
  ["authentication", "Authentication"],
  ["choose-path", "Choose your path"],
  ["integration-guide", "Integration guide"],
  ["api-reference", "API reference"],
  ["rate-limits", "Rate limits"],
  ["troubleshooting", "Troubleshooting"],
  ["security", "Security"],
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({behavior: "smooth", block: "start"});
  window.history.replaceState(null, "", `#${id}`);
}

function CopyButton({value, label = "Copy"}: {value: string; label?: string}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      aria-label={`Copy ${label}`}
      className="shrink-0"
      isIconOnly
      size="sm"
      variant="tertiary"
      onPress={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}

function CodeBlock({code, language}: {code: string; language: string}) {
  return (
    <div className="overflow-hidden rounded-xl border border-divider bg-[#17191f] text-[#eef2f8]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="text-xs font-medium text-white/60">{language}</span>
        <CopyButton value={code} label={`${language} example`} />
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SidebarNavigation({
  query,
  setActivePath,
}: {
  query: string;
  setActivePath: (path: IntegrationPath) => void;
}) {
  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return navigationGroups;
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(normalized)),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  if (!filteredGroups.length) {
    return <p className="rounded-xl bg-surface-2 p-3 text-sm text-muted">No documentation topics found.</p>;
  }

  return (
    <nav aria-label="Documentation navigation" className="space-y-6">
      {filteredGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={`${group.label}-${item.label}`}
                  className="h-10 w-full justify-start rounded-lg px-2 text-sm"
                  variant="tertiary"
                  onPress={() => {
                    if (item.path) setActivePath(item.path);
                    scrollToSection(item.id);
                  }}
                >
                  <Icon className="size-4 text-muted" strokeWidth={1.8} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.comingSoon ? (
                    <Chip size="sm" variant="soft">
                      <Chip.Label>Soon</Chip.Label>
                    </Chip>
                  ) : null}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-accent">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-3 max-w-3xl leading-7 text-muted">{children}</div>
    </div>
  );
}

export function DocsLanding() {
  const [query, setQuery] = useState("");
  const [activePath, setActivePath] = useState<IntegrationPath>("discord-js");
  const selectedPath =
    integrationPaths.find((path) => path.id === activePath) ?? integrationPaths[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-divider bg-surface-1">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-accent">
                <BookOpen className="size-4" />
                Nexbiy Developer Docs
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Bot Stats Reporting
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
                Connect your bot to Nexbiy, report its server count securely, and keep the
                public listing accurate without sharing a Discord bot token.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/dashboard#bots" variant="secondary">
                Open My Bots
              </LinkButton>
              <Button variant="primary" onPress={() => scrollToSection("quickstart")}>
                Start quickstart
                <Rocket className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[240px_minmax(0,820px)] lg:px-10 xl:grid-cols-[240px_minmax(0,820px)_190px]">
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <SearchField
              aria-label="Search documentation"
              className="mb-7 w-full"
              value={query}
              onChange={setQuery}
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search docs" />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <SidebarNavigation query={query} setActivePath={setActivePath} />
          </div>
        </aside>

        <article className="min-w-0">
          <div className="mb-8 lg:hidden">
            <SearchField
              aria-label="Search documentation"
              className="mb-5 w-full"
              value={query}
              onChange={setQuery}
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search docs" />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <Card className="p-4">
              <SidebarNavigation query={query} setActivePath={setActivePath} />
            </Card>
          </div>

          <section id="overview" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Overview" title="Reliable counts without sharing a bot token">
              <p>
                Bot Stats Reporting is Nexbiy&apos;s listing-specific reporting API. Your bot
                submits one integer—the number of Discord servers it is installed in—and Nexbiy
                stores the latest valid report for the public bot page.
              </p>
            </SectionHeading>
            <Card className="grid gap-5 p-5 sm:grid-cols-3">
              {[
                ["1", "Generate a token", "Create a private reporting token from your bot dashboard."],
                ["2", "Send the count", "Post your bot's current server count to the Nexbiy API."],
                ["3", "Stay current", "Report on startup and every six hours afterward."],
              ].map(([number, title, description]) => (
                <div key={number}>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent/12 text-sm font-semibold text-accent">
                    {number}
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </div>
              ))}
            </Card>
          </section>

          <section id="quickstart" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Quickstart" title="Connect a bot in five steps">
              <p>The first report normally takes less than a minute once your bot is running.</p>
            </SectionHeading>
            <ol className="space-y-5">
              {[
                ["Create a bot listing", "Add your Discord Bot ID and complete the required listing fields."],
                ["Open server count reporting", "From My Bots, select the bot and open its server-count reporting setup."],
                ["Generate a reporting token", "Copy the token when it is shown. For security, the full value is displayed once."],
                ["Save the token securely", "Add it to your bot host as NEXBIY_STATS_TOKEN. Never commit it to source control."],
                ["Send the first report", "Choose your library below, add the snippet, then restart your bot."],
              ].map(([title, description], index) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent/35 text-sm font-semibold text-accent">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 leading-6 text-muted">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <LinkButton className="mt-7" href="/dashboard#bots" variant="secondary">
              Open bot dashboard
            </LinkButton>
          </section>

          <section id="authentication" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Authentication" title="Use your reporting token as a Bearer token">
              <p>
                Every token belongs to one listing. It authorizes reporting only for that bot and
                cannot access your Discord account or bot.
              </p>
            </SectionHeading>
            <CodeBlock
              language="HTTP header"
              code={`Authorization: Bearer nbx_stats_your_reporting_token`}
            />
            <div className="mt-4 flex gap-3 rounded-xl bg-warning/10 p-4 text-sm leading-6">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              <p>
                Treat this token like a password. If it is exposed, rotate it from My Bots; the old
                token stops working immediately.
              </p>
            </div>
          </section>

          <section id="choose-path" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Choose your path" title="Use the example that matches your bot">
              <p>Each option submits the same validated payload to the same secure endpoint.</p>
            </SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              {integrationPaths.map((path) => {
                const Icon = path.icon;
                const isActive = activePath === path.id;
                return (
                  <Button
                    key={path.id}
                    aria-pressed={isActive}
                    className={cn(
                      "h-auto min-h-24 justify-start whitespace-normal rounded-xl border p-4 text-left",
                      isActive
                        ? "border-accent bg-accent/8"
                        : "border-divider bg-surface-1 hover:border-accent/40",
                    )}
                    variant="tertiary"
                    onPress={() => {
                      setActivePath(path.id);
                      scrollToSection("integration-guide");
                    }}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-accent">
                      {path.brandIcon ? (
                        <IconifyIcon className="size-5" icon={path.brandIcon} />
                      ) : Icon ? (
                        <Icon className="size-5" />
                      ) : null}
                    </span>
                    <span>
                      <span className="block font-semibold">{path.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-muted">
                        {path.description}
                      </span>
                    </span>
                  </Button>
                );
              })}
            </div>
          </section>

          <section id="integration-guide" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Integration guide" title={selectedPath.title}>
              <p>{selectedPath.description}</p>
            </SectionHeading>
            <CodeBlock code={selectedPath.code} language={selectedPath.language} />
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-success/10 p-4 text-sm leading-6">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              <p>
                After the first successful request, the bot dashboard shows a connected state and
                the public page displays the reported server count.
              </p>
            </div>
          </section>

          <section id="api-reference" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Reference" title="Report bot server count">
              <p>Submit the current total for the listing linked to your reporting token.</p>
            </SectionHeading>
            <div className="flex items-center gap-3 rounded-xl border border-divider bg-surface-1 p-3">
              <Chip color="success" variant="soft">
                <Chip.Label>POST</Chip.Label>
              </Chip>
              <code className="min-w-0 flex-1 truncate text-sm">{REPORTING_ENDPOINT}</code>
              <CopyButton value={REPORTING_ENDPOINT} label="endpoint" />
            </div>

            <h3 className="mt-8 text-lg font-semibold">Request body</h3>
            <CodeBlock language="JSON" code={`{\n  "serverCount": 1284\n}`} />

            <h3 className="mt-8 text-lg font-semibold">Successful response</h3>
            <CodeBlock
              language="JSON"
              code={`{\n  "listingId": "listing-uuid",\n  "serverCount": 1284,\n  "updatedAt": "2026-07-28T12:00:00.000Z"\n}`}
            />

            <h3 className="mt-8 text-lg font-semibold">Errors</h3>
            <div className="mt-3 overflow-x-auto rounded-xl border border-divider">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-surface-2 text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Error</th>
                    <th className="px-4 py-3 font-medium">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  <tr>
                    <td className="px-4 py-3">400</td>
                    <td className="px-4 py-3 font-mono">invalid_server_count</td>
                    <td className="px-4 py-3 text-muted">The value is missing, negative, or not an integer.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">401</td>
                    <td className="px-4 py-3 font-mono">invalid_stats_token</td>
                    <td className="px-4 py-3 text-muted">The reporting token is missing, invalid, or rotated.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">429</td>
                    <td className="px-4 py-3 font-mono">stats_rate_limited</td>
                    <td className="px-4 py-3 text-muted">The bot reported too frequently. Retry later.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="rate-limits" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Rate limits" title="Report only when the count can change">
              <p>
                A listing token accepts one stored report per minute. Nexbiy also applies a broader
                request limit to protect the endpoint.
              </p>
            </SectionHeading>
            <Card className="p-5">
              <h3 className="font-semibold">Recommended schedule</h3>
              <p className="mt-2 leading-7 text-muted">
                Report once when the bot becomes ready, then once every six hours. Avoid sending a
                request for every guild event.
              </p>
            </Card>
          </section>

          <section id="troubleshooting" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Troubleshooting" title="Common setup problems">
              <p>Use the response status and dashboard connection state to find the cause quickly.</p>
            </SectionHeading>
            <div className="space-y-3">
              {[
                ["Dashboard says Not connected", "Confirm the bot restarted after you added the environment variable and inspect the first request response."],
                ["The API returns 401", "Generate or rotate the listing token, then update NEXBIY_STATS_TOKEN on your bot host."],
                ["The API returns 429", "Remove event-level reports and use the recommended six-hour interval."],
                ["A sharded bot reports too few servers", "Aggregate the counts from every shard and send one combined total."],
              ].map(([title, description]) => (
                <Card key={title} className="p-5">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section id="security" className="scroll-mt-6 pb-16">
            <SectionHeading eyebrow="Security" title="Designed for the minimum required access">
              <p>Nexbiy does not need your Discord bot token to receive a server count.</p>
            </SectionHeading>
            <ul className="space-y-3">
              {[
                "Reporting tokens are scoped to one bot listing.",
                "The raw token is shown once; Nexbiy stores a secure hash.",
                "Rotating a token invalidates the previous token.",
                "Payloads are validated, rate-limited, and server-authorized.",
                "Only the latest accepted count and update time appear on the listing.",
              ].map((item) => (
                <li key={item} className="flex gap-3 leading-6">
                  <Check className="mt-1 size-4 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="webhooks" className="scroll-mt-6 pb-6">
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Webhook className="size-5 text-accent" />
                <h2 className="text-xl font-semibold">Webhooks</h2>
                <Chip color="warning" size="sm" variant="soft">
                  <Chip.Label>Coming soon</Chip.Label>
                </Chip>
              </div>
              <p className="mt-3 leading-7 text-muted">
                Webhook delivery is planned for listing and moderation events. It is not required
                for Bot Stats Reporting.
              </p>
            </Card>
          </section>
        </article>

        <aside className="hidden xl:block">
          <nav aria-label="On this page" className="sticky top-6">
            <p className="mb-3 text-sm font-semibold">On this page</p>
            <div className="space-y-1">
              {onThisPage.map(([id, label]) => (
                <Button
                  key={id}
                  className="h-9 w-full justify-start rounded-lg px-2 text-sm text-muted"
                  variant="tertiary"
                  onPress={() => scrollToSection(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </nav>
        </aside>
      </main>

      <NexusFooter />
    </div>
  );
}
