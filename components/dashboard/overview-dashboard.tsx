"use client";

import {
  Accordion,
  Avatar,
  Button,
  Card,
  Chip,
  Label,
  ListBox,
  Pagination,
  SearchField,
  Select,
  Table,
  Tooltip,
  toast,
} from "@heroui/react";
import {
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  CircleCheckBig,
  CirclePlus,
  Copy,
  Edit3,
  Eye,
  ImagePlus,
  Layers3,
  MousePointer2,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Server,
  ThumbsUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { ListingStatusChip } from "@/components/listing/listing-safety";
import { LinkButton } from "@/components/ui/link-button";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";
import { formatCount, initials } from "@/lib/format";
import type {DashboardListing} from "@/lib/types";
import { useDashboardOverview } from "@/lib/use-dashboard-overview";

const LISTING_ORDER = ["nexus-hub", "lofi-girl", "reactflux", "helper-ai", "shield-mod", "minecraft", "ticket-tool", "economy-pro"];

const GETTING_STARTED_ITEMS = [
  { id: "notifications", title: "Set up notifications", subtitle: "Receive important listing and account updates", content: "Choose the updates you want Nexbiy to send about reviews, listing status, milestones, and account activity.", action: "Open settings", icon: Bell, href: "#settings" },
  { id: "listing", title: "Add a listing", subtitle: "Publish your first Discord server or bot", content: "Create a complete Nexbiy listing so people can discover your community or add your bot to their servers.", action: "Create listing", icon: CirclePlus, href: "/dashboard/new" },
  { id: "media", title: "Upload a banner and icon", subtitle: "Give your listing a recognizable identity", content: "Add a sharp banner and a clear icon to help your listing stand out across Nexbiy discovery pages.", action: "Manage listings", icon: ImagePlus, href: "#servers" },
  { id: "votes", title: "Get 10 votes on a listing", subtitle: "Reach your first community milestone", content: "Share your public listing and encourage genuine community members to support it with a vote.", action: "View listings", icon: ThumbsUp, href: "#servers" },
] as const;

export function OverviewDashboard({
  username,
  listings,
  loading = false,
  error = null,
}: {
  username: string;
  listings: DashboardListing[];
  loading?: boolean;
  error?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [chartRange, setChartRange] = useState("30d");
  const [tipsOpen, setTipsOpen] = useState(true);
  const [verificationListingVisible, setVerificationListingVisible] = useState(true);
  const overviewDays = Number(chartRange.replace("d", ""));
  const {data: overview, loading: overviewLoading, error: overviewError} = useDashboardOverview(overviewDays);
  const totals = overview?.totals;
  const period = overview?.period;
  const chartMax = Math.max(1, ...(overview?.series.map((point) => point.views) || [0]));
  const stats = [
    {label: "Total Views", value: formatCount(totals?.views || 0), delta: period?.deltas.views, detail: `vs previous ${overviewDays} days`, icon: Eye, tone: "border-blue-500/15 bg-blue-500/10 text-blue-500"},
    {label: "Invite Clicks", value: formatCount(totals?.inviteClicks || 0), delta: period?.deltas.clicks, detail: `vs previous ${overviewDays} days`, icon: MousePointer2, tone: "border-violet-500/15 bg-violet-500/10 text-violet-500"},
    {label: "Votes", value: formatCount(totals?.votes || 0), delta: undefined, detail: "all-time listing votes", icon: ThumbsUp, tone: "border-accent/15 bg-accent/10 text-accent"},
    {label: "Total Listings", value: String(totals?.listings || listings.length), delta: undefined, detail: `${totals?.live || 0} Live · ${totals?.drafts || 0} Drafts`, icon: Layers3, tone: "border-slate-500/15 bg-slate-500/10 text-slate-500"},
    {label: "Conversion Rate", value: `${totals?.conversionRate || 0}%`, delta: undefined, detail: "invite clicks from listing views", icon: ChartNoAxesCombined, tone: "border-blue-500/15 bg-blue-500/10 text-blue-500"},
  ];

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return listings.filter((row) => {
      const matchesSearch = !query || row.name.toLowerCase().includes(query) || row.category.toLowerCase().includes(query);
      const matchesType = typeFilter === "All" || row.type === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    }).sort((a, b) => LISTING_ORDER.indexOf(a.id) - LISTING_ORDER.indexOf(b.id));
  }, [listings, search, typeFilter]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div id="overview" className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, {username}</h1>
          <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s happening with your Nexbiy listings today.</p>
        </div>
        <Select className="w-full sm:w-36" selectedKey={chartRange} onSelectionChange={(key) => setChartRange(String(key))} aria-label="Overview date range">
          <Label className="sr-only">Overview date range</Label>
          <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
          <Select.Popover><ListBox><ListBox.Item id="7d" textValue="7 days">7 days<ListBox.ItemIndicator /></ListBox.Item><ListBox.Item id="30d" textValue="30 days">30 days<ListBox.ItemIndicator /></ListBox.Item><ListBox.Item id="90d" textValue="90 days">90 days<ListBox.ItemIndicator /></ListBox.Item></ListBox></Select.Popover>
        </Select>
      </header>

      <div className={`grid items-start gap-5 transition-[grid-template-columns] duration-500 ease-out ${tipsOpen ? "xl:grid-cols-[minmax(0,1fr)_280px]" : "xl:grid-cols-1"}`}>
        <main className="min-w-0 space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5" aria-label="Overview metrics">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} variant="default" className="gap-3 p-5">
                  <div className="flex items-start gap-3">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${stat.tone}`}><Icon className="size-5 stroke-[1.8]" /></span>
                    <div className="min-w-0"><p className="text-xs font-medium text-muted">{stat.label}</p><p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">{stat.value}</p></div>
                  </div>
                  <p className="text-[11px] text-muted">{typeof stat.delta === "number" ? <span className={`mr-1 font-semibold ${stat.delta < 0 ? "text-danger" : "text-emerald-500"}`}>{stat.delta < 0 ? "↓" : "↑"} {Math.abs(stat.delta)}%</span> : null}{stat.detail}</p>
                </Card>
              );
            })}
          </section>

          <Card variant="default" className="gap-4 p-5">
            <Card.Header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><Card.Title>Performance Overview</Card.Title><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {[
                  {label: "Views", value: period?.views || 0, delta: period?.deltas.views || 0},
                  {label: "Invite Clicks", value: period?.clicks || 0, delta: period?.deltas.clicks || 0},
                  {label: "Listing Interactions", value: period?.interactions || 0, delta: period?.deltas.interactions || 0},
                ].map((item) => <div key={item.label}><p className="text-[11px] text-muted"><span className="mr-1 inline-block size-2 rounded-full bg-accent" />{item.label}</p><p className="mt-1 text-lg font-bold text-foreground">{formatCount(item.value)} <span className={`text-[11px] font-semibold ${item.delta < 0 ? "text-danger" : "text-emerald-500"}`}>{item.delta < 0 ? "↓" : "↑"} {Math.abs(item.delta)}%</span></p></div>)}
              </div></div>
              <Select className="w-full sm:w-36" selectedKey={chartRange} onSelectionChange={(key) => setChartRange(String(key))} aria-label="Performance chart range"><Label className="sr-only">Chart date range</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox><ListBox.Item id="7d" textValue="Last 7 days">Last 7 days<ListBox.ItemIndicator /></ListBox.Item><ListBox.Item id="30d" textValue="Last 30 days">Last 30 days<ListBox.ItemIndicator /></ListBox.Item><ListBox.Item id="90d" textValue="Last 90 days">Last 90 days<ListBox.ItemIndicator /></ListBox.Item></ListBox></Select.Popover></Select>
            </Card.Header>
            <Card.Content>
              <div className="overflow-x-auto pb-1">
                <div className="relative h-48 min-w-[700px] border-b border-border pl-10">
                  {[0, 1, 2, 3, 4].map((line) => <span key={line} className="absolute right-0 left-10 border-t border-dashed border-border/80" style={{ top: `${line * 25}%` }} />)}
                  <div className="absolute inset-0 left-0 flex flex-col justify-between pb-4 text-[10px] text-muted"><span>{formatCount(chartMax)}</span><span>{formatCount(Math.round(chartMax * 0.75))}</span><span>{formatCount(Math.round(chartMax * 0.5))}</span><span>{formatCount(Math.round(chartMax * 0.25))}</span><span>0</span></div>
                  <div className="absolute inset-x-10 top-2 bottom-5 flex items-end gap-1.5">
                    {(overview?.series || []).map((point) => <Tooltip key={point.date}><Tooltip.Trigger className="flex h-full flex-1 items-end outline-none"><span className="w-full rounded-t-md bg-accent transition-opacity hover:opacity-80" style={{ height: `${Math.max(point.views ? 4 : 0, (point.views / chartMax) * 100)}%` }} /></Tooltip.Trigger><Tooltip.Content>{new Date(`${point.date}T00:00:00Z`).toLocaleDateString()}: {point.views.toLocaleString()} views</Tooltip.Content></Tooltip>)}
                  </div>
                  <div className="absolute right-10 bottom-0 left-10 flex justify-between text-[10px] text-muted">
                    {(overview?.series.length ? [overview.series[0], overview.series[Math.floor(overview.series.length / 2)], overview.series.at(-1)] : []).map((point) => <span key={point?.date}>{point ? new Date(`${point.date}T00:00:00Z`).toLocaleDateString(undefined, {month: "short", day: "numeric"}) : ""}</span>)}
                  </div>
                  {!overviewLoading && !overview?.series.some((point) => point.views) ? <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">No listing views recorded in this period yet.</p> : null}
                </div>
              </div>
              {overviewError ? <p className="mt-3 text-sm text-danger">Live analytics could not be loaded. Refresh and try again.</p> : null}
            </Card.Content>
          </Card>

          <Card variant="default" className="gap-3 p-5">
            <Card.Header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Card.Title>Your Listings</Card.Title>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <SearchField aria-label="Search listings" value={search} onChange={(value) => { setSearch(value); setPage(1); }} className="w-full sm:w-56"><SearchField.Group><SearchField.SearchIcon /><SearchField.Input placeholder="Search listings…" /><SearchField.ClearButton /></SearchField.Group></SearchField>
                <Select className="w-full sm:w-28" selectedKey={typeFilter} onSelectionChange={(key) => { setTypeFilter(String(key)); setPage(1); }} aria-label="Filter listings"><Label className="sr-only">Filter listings</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox><ListBox.Item id="All" textValue="All">All<ListBox.ItemIndicator /></ListBox.Item><ListBox.Item id="Server" textValue="Servers">Servers<ListBox.ItemIndicator /></ListBox.Item><ListBox.Item id="Bot" textValue="Bots">Bots<ListBox.ItemIndicator /></ListBox.Item></ListBox></Select.Popover></Select>
              </div>
            </Card.Header>
            <Card.Content>
              {loading ? <p className="py-4 text-sm text-muted">Loading your listings…</p> : null}
              {error ? <p className="py-4 text-sm text-danger">Listings could not be loaded. Refresh and try again.</p> : null}
              {visibleRows.length ? <><Table><Table.ScrollContainer><Table.Content aria-label="Overview listings" className="min-w-[820px]"><Table.Header><Table.Column isRowHeader>Listing</Table.Column><Table.Column>Type</Table.Column><Table.Column>Status</Table.Column><Table.Column>Views</Table.Column><Table.Column>Clicks</Table.Column><Table.Column>Updated</Table.Column><Table.Column className="w-32 text-end">Actions</Table.Column></Table.Header><Table.Body>{visibleRows.map((row) => {
                const publicFallback = `/${row.type === "server" ? "server" : "bots"}/${row.slug || row.id}`;
                const listingPath = row.status === "Live"
                  ? row.publicPath || publicFallback
                  : row.ownerPreviewPath || publicFallback;
                return <Table.Row key={row.id} id={row.id}><Table.Cell><div className="flex items-center gap-2.5"><ListingAvatar name={row.name} hue={row.bannerHue} iconUrl={row.iconUrl} /><span className="font-medium">{row.name}</span></div></Table.Cell><Table.Cell><Chip size="sm" variant="soft" color={row.type === "server" ? "accent" : "default"}><Chip.Label>{row.type === "server" ? "Server" : "Bot"}</Chip.Label></Chip></Table.Cell><Table.Cell><ListingStatusChip status={row.safetyStatus} /></Table.Cell><Table.Cell>{formatCount(row.views)}</Table.Cell><Table.Cell>{formatCount(row.clicks)}</Table.Cell><Table.Cell className="text-muted">{row.updated}</Table.Cell><Table.Cell><div className="flex min-w-[7.5rem] shrink-0 items-center justify-end gap-1"><ActionButton label={`Preview ${row.name}`} icon={Eye} onPress={() => window.open(listingPath, "_blank", "noopener,noreferrer")} /><ActionButton label={`Copy ${row.name} link`} icon={Copy} onPress={() => { void navigator.clipboard?.writeText(new URL(listingPath, window.location.origin).toString()); toast.success("Listing link copied"); }} /><ActionButton label={`Manage ${row.name}`} icon={Edit3} onPress={() => { window.location.hash = row.type === "server" ? "servers" : "bots"; }} /></div></Table.Cell></Table.Row>;
              })}</Table.Body></Table.Content></Table.ScrollContainer></Table><div className="mt-3 flex justify-center"><Pagination><Pagination.Content><Pagination.Item><Pagination.Previous isDisabled={page === 1} onPress={() => setPage(Math.max(1, page - 1))}><Pagination.PreviousIcon /></Pagination.Previous></Pagination.Item>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <Pagination.Item key={number}><Pagination.Link isActive={page === number} onPress={() => setPage(number)}>{number}</Pagination.Link></Pagination.Item>)}<Pagination.Item><Pagination.Next isDisabled={page === totalPages} onPress={() => setPage(Math.min(totalPages, page + 1))}><Pagination.NextIcon /></Pagination.Next></Pagination.Item></Pagination.Content></Pagination></div></> : <div className="py-10 text-center"><p className="font-semibold">No listings found</p><p className="mt-1 text-sm text-muted">Try a different search or filter.</p></div>}
            </Card.Content>
          </Card>

          <section className="space-y-3"><h2 className="text-base font-bold text-foreground">Quick Actions</h2><div className="grid items-stretch gap-3 lg:grid-cols-[240px_minmax(0,1fr)]">
            <QuickAction title="Create a Server Listing" description="Add your community and grow your members." label="Create Server" icon={Server} tone="bg-violet-500/8" href="/dashboard/new?type=server" />
            <VerificationQuickAction
              listing={listings[0]}
              listingVisible={verificationListingVisible}
              onCloseListing={() => setVerificationListingVisible(false)}
              onShowListing={() => setVerificationListingVisible(true)}
            />
          </div></section>
        </main>

        <aside className={`transition-[transform,opacity] duration-500 ease-out ${tipsOpen ? "xl:sticky xl:top-24" : "pointer-events-none fixed top-24 right-0 z-30 w-[280px] translate-x-[110%] opacity-0"}`} aria-hidden={!tipsOpen}>
          <GettingStartedAccordion
            onClose={() => setTipsOpen(false)}
            completion={overview?.onboarding}
          />
        </aside>
      </div>

      {!tipsOpen ? (
        <Button isIconOnly aria-label="Open Tips & Getting Started" variant="primary" className="fixed top-1/2 right-0 z-40 rounded-r-none shadow-lg" onPress={() => setTipsOpen(true)}>
          <PanelRightOpen className="size-5" />
        </Button>
      ) : null}
    </div>
  );
}

function GettingStartedAccordion({
  onClose,
  completion,
}: {
  onClose: () => void;
  completion?: Record<"notifications" | "listing" | "media" | "votes", boolean>;
}) {
  const completedCount = GETTING_STARTED_ITEMS.filter((item) => completion?.[item.id]).length;
  return (
    <Card variant="default" className="gap-4 p-4">
      <Card.Header className="flex items-center justify-between gap-3 px-1">
        <div><Card.Title>Tips &amp; Getting Started</Card.Title><Card.Description className="mt-1">Complete the basics for your Nexbiy workspace.</Card.Description></div>
        <div className="flex shrink-0 items-center gap-1"><Chip size="sm" variant="soft" color={completedCount === GETTING_STARTED_ITEMS.length ? "success" : "accent"}><Chip.Label>{completedCount}/{GETTING_STARTED_ITEMS.length}</Chip.Label></Chip><Button isIconOnly size="sm" variant="ghost" aria-label="Close Tips & Getting Started" onPress={onClose}><PanelRightClose className="size-4" /></Button></div>
      </Card.Header>
      <Card.Content>
        <Accordion className="w-full overflow-hidden rounded-2xl border border-border bg-surface/40" variant="surface" hideSeparator defaultExpandedKeys={["notifications"]}>
          {GETTING_STARTED_ITEMS.map((item) => {
            const isComplete = Boolean(completion?.[item.id]);
            const Icon = item.icon;
            return (
              <Accordion.Item key={item.id} id={item.id} className={`group/item relative border-b border-border last:border-b-0 ${isComplete ? "bg-emerald-500/5" : ""}`}>
                <Accordion.Heading>
                  <Accordion.Trigger className="group flex w-full items-center gap-3 px-3 py-4 text-left transition-colors hover:bg-default/50">
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border transition-[transform,background-color,color] duration-300 group-hover/item:-rotate-6 group-hover/item:scale-110 ${isComplete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-accent/20 bg-accent/8 text-accent"}`}><Icon className="size-6 stroke-[1.7]" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-5 text-foreground">{item.title}</span><span className="mt-0.5 block text-xs font-normal leading-5 text-muted">{item.subtitle}</span></span>
                    {isComplete ? <CircleCheckBig className="size-5 text-emerald-500" aria-label="Completed" /> : null}
                    <Accordion.Indicator className="text-muted/70"><ChevronDown className="size-4" /></Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="px-4 pb-4 text-xs leading-relaxed text-muted">
                    <p>{item.content}</p>
                    {isComplete ? <p className="mt-3 inline-flex items-center gap-1.5 font-semibold text-emerald-500"><CircleCheckBig className="size-4" />Completed</p> : <LinkButton href={item.href} size="sm" className="mt-3">{item.action}</LinkButton>}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
        {completedCount === GETTING_STARTED_ITEMS.length ? <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400"><CircleCheckBig className="size-5" /><p className="text-xs font-semibold">Getting started complete. Your workspace is ready.</p></div> : null}
      </Card.Content>
    </Card>
  );
}

function ListingAvatar({ name, hue, iconUrl }: { name: string; hue: string; iconUrl?: string | null }) {
  return <Avatar className="size-8 rounded-lg">{iconUrl ? <Avatar.Image src={iconUrl} alt="" className="rounded-lg object-cover" /> : null}<Avatar.Fallback className="rounded-lg text-xs font-bold text-white" style={{ background: `linear-gradient(135deg,hsl(${hue} 72% 56%),hsl(${Number(hue) + 30} 70% 42%))` }}>{initials(name)}</Avatar.Fallback></Avatar>;
}

function ActionButton({ label, icon: Icon, onPress }: { label: string; icon: typeof Eye; onPress: () => void }) {
  return <Tooltip><Tooltip.Trigger aria-label={label} className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-default focus-visible:ring-2 focus-visible:ring-accent" onClick={onPress}><Icon className="size-4 shrink-0" /></Tooltip.Trigger><Tooltip.Content>{label}</Tooltip.Content></Tooltip>;
}

function QuickAction({ title, description, label, icon: Icon, tone, href }: { title: string; description: string; label: string; icon: typeof Server; tone: string; href: string }) {
  return <Card variant="default" className={`h-full gap-3 p-5 ${tone}`}><span className="flex size-10 items-center justify-center rounded-xl bg-white/70 text-accent dark:bg-white/8"><Icon className="size-5" /></span><div className="flex-1"><p className="text-sm font-semibold text-foreground">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted">{description}</p></div><LinkButton href={href} size="sm">{label}<Plus className="size-3.5" /></LinkButton></Card>;
}

function VerificationQuickAction({
  listing,
  listingVisible,
  onCloseListing,
  onShowListing,
}: {
  listing?: DashboardListing;
  listingVisible: boolean;
  onCloseListing: () => void;
  onShowListing: () => void;
}) {
  if (!listing) return null;

  return (
    <div className="nexus-card relative min-h-64 overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_82%_8%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_38%)] p-5 sm:p-7">
      <div className="pointer-events-none absolute -bottom-20 -left-16 size-52 rounded-full bg-accent/8 blur-3xl" />
      <div className="relative z-10 max-w-xl md:max-w-[calc(100%-320px)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent"><VerifiedBadgeIcon className="size-5 text-accent" />Nexbiy Verification</div>
        <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Get your verification badge</h3>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">Build trust around your server or bot. Review the requirements, then check a listing&apos;s eligibility from its status dashboard.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <LinkButton href="/verification" target="_blank">Learn more</LinkButton>
          <LinkButton href="/dashboard?serverTab=status#servers" variant="secondary">Check eligibility</LinkButton>
        </div>
      </div>

      {listingVisible ? (
        <div className="verification-server-float relative z-20 mt-6 md:absolute md:top-3 md:right-5 md:mt-0 md:w-[300px]">
          <Card className="verification-server-card nexus-card group gap-0 p-4 shadow-lg shadow-black/10 backdrop-blur">
            <Button isIconOnly size="sm" variant="ghost" aria-label="Close current listing preview" className="absolute top-2 right-2 z-10" onPress={onCloseListing}><X className="size-4" /></Button>
            <div className="flex items-center gap-3 pr-7">
              <Avatar className="size-12 rounded-2xl">{listing.iconUrl ? <Avatar.Image src={listing.iconUrl} alt="" className="rounded-2xl object-cover" /> : null}<Avatar.Fallback className="rounded-2xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg,hsl(${listing.bannerHue} 72% 56%),hsl(${Number(listing.bannerHue) + 30} 70% 42%))` }}>{initials(listing.name)}</Avatar.Fallback></Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">{listing.name}<VerifiedBadgeIcon className="size-4 shrink-0 text-accent transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" /></p>
                <p className="mt-0.5 truncate text-xs text-muted">{listing.category} · {listing.type === "server" ? "Server listing" : "Bot listing"}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />Active now</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Button size="sm" variant="ghost" className="absolute top-4 right-4" onPress={onShowListing}>Show current listing</Button>
      )}
    </div>
  );
}
