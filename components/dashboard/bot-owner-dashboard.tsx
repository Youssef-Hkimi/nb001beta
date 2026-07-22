"use client";

import {
  AlertDialog,
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  Dropdown,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Switch,
  Table,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import {
  Clock,
  Code2,
  ExternalLink,
  Eye,
  GitBranch,
  Globe,
  Link as LinkIcon,
  MessagesSquare,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Server,
  Settings2,
  ShieldQuestion,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AnalyticsLineChart } from "@/components/dashboard/analytics-line-chart";
import { BotFeatureSelect } from "@/components/forms/bot-feature-select";
import { RichDescriptionEditor } from "@/components/forms/rich-description-editor";
import { TagMultiSelect } from "@/components/forms/tag-multi-select";
import { LinkButton } from "@/components/ui/link-button";
import { DEFAULT_BOT_FEATURE_IDS } from "@/lib/data/bot-features";
import { BOT_CATEGORIES, BOT_LISTING_TAGS } from "@/lib/data/categories";
import { BOT_DASHBOARD_LISTINGS } from "@/lib/data/dashboard-analytics";
import { formatCount, initials } from "@/lib/format";
import type { BotCommand, BotDashboardListing, ListingStatus } from "@/lib/types";

const METRICS = [
  { key: "listingViews", label: "Listing Views", icon: Eye, color: "text-[#629BF8]" },
  { key: "inviteClicks", label: "Invite Clicks", icon: MousePointerClick, color: "text-violet-400" },
  { key: "activeServers", label: "Active Servers", icon: Server, color: "text-[#82B0F9]" },
  { key: "votes", label: "Votes", icon: ThumbsUp, color: "text-accent" },
] as const;

const statusColor = (status: ListingStatus) => status === "Live" ? "success" as const : status.includes("Review") ? "warning" as const : "default" as const;

type BotEditorPanel = "all" | "details" | "commands" | "links" | "media";

type BotEditorDraft = {
  name: string;
  clientId: string;
  description: string;
  fullDescription: string;
  category: string;
  tags: string[];
  prefix: string;
  commands: BotCommand[];
  botFeatures: string[];
  premium: boolean;
  inviteUrl: string;
  supportUrl: string;
  websiteUrl: string;
  githubUrl: string;
  hasAvatar: boolean;
  hasBanner: boolean;
  galleryCount: number;
  visibility: string;
};

function draftFor(bot: BotDashboardListing): BotEditorDraft {
  return {
    name: bot.name,
    clientId: `1234567890${bot.id.replace(/\D/g, "").slice(0, 8) || "12345678"}`,
    description: bot.description,
    fullDescription: `${bot.description}\n\n## Features\n- Easy setup\n- Reliable commands\n- Community support`,
    category: bot.category,
    tags: [bot.category, "Utility"],
    prefix: bot.prefix,
    commands: [
      { id: "command-help", name: "/help", description: "Show available commands" },
      { id: "command-setup", name: "/setup", description: "Configure the bot" },
    ],
    botFeatures: [...DEFAULT_BOT_FEATURE_IDS],
    premium: false,
    inviteUrl: bot.listingHealth.inviteConnected ? `https://discord.com/oauth2/authorize?client_id=${bot.id}` : "",
    supportUrl: bot.listingHealth.supportConnected ? "https://discord.gg/support" : "",
    websiteUrl: bot.listingHealth.websiteConnected ? `https://${bot.id}.example.com` : "",
    githubUrl: bot.listingHealth.githubConnected ? `https://github.com/nexus/${bot.id}` : "",
    hasAvatar: Boolean(bot.avatar),
    hasBanner: true,
    galleryCount: 3,
    visibility: "Public",
  };
}

export function BotOwnerDashboard() {
  const [rows, setRows] = useState(BOT_DASHBOARD_LISTINGS);
  const [selectedId, setSelectedId] = useState(rows[0].id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editorPanel, setEditorPanel] = useState<BotEditorPanel | null>(null);
  const [editorDraft, setEditorDraft] = useState<BotEditorDraft | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<Record<string, BotEditorDraft>>(() =>
    Object.fromEntries(BOT_DASHBOARD_LISTINGS.map((item) => [item.id, draftFor(item)])),
  );
  const [deleteSelectorOpen, setDeleteSelectorOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const bot = useMemo(() => rows.find((item) => item.id === selectedId) ?? rows[0], [rows, selectedId]);

  function refreshProjects() {
    setRows(BOT_DASHBOARD_LISTINGS);
    setSelectedId(BOT_DASHBOARD_LISTINGS[0]?.id ?? "");
    setSavedDrafts(Object.fromEntries(BOT_DASHBOARD_LISTINGS.map((item) => [item.id, draftFor(item)])));
    setDeleteSelectorOpen(false);
    setSelectedForDelete(new Set());
    toast.success("Bot projects refreshed");
  }

  function openEditor(panel: BotEditorPanel, target = bot) {
    if (!target) return;
    setSelectedId(target.id);
    setEditorDraft(savedDrafts[target.id] ?? draftFor(target));
    setEditorPanel(panel);
  }

  function saveEditor() {
    if (!bot || !editorDraft) return;
    setSavedDrafts((current) => ({ ...current, [bot.id]: editorDraft }));
    setRows((current) => current.map((item) => item.id === bot.id ? {
      ...item,
      name: editorDraft.name.trim() || item.name,
      description: editorDraft.description.trim() || item.description,
      category: editorDraft.category,
      prefix: editorDraft.prefix.trim() || item.prefix,
      avatar: editorDraft.hasAvatar ? item.avatar : null,
      listingHealth: {
        ...item.listingHealth,
        inviteConnected: Boolean(editorDraft.inviteUrl.trim()),
        supportConnected: Boolean(editorDraft.supportUrl.trim()),
        websiteConnected: Boolean(editorDraft.websiteUrl.trim()),
        githubConnected: Boolean(editorDraft.githubUrl.trim()),
      },
    } : item));
    setEditorPanel(null);
    toast.success("Bot settings updated", { description: `${editorDraft.name} was saved successfully.` });
  }

  function toggleDeleteSelection(id: string) {
    setSelectedForDelete((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function deleteSelectedProjects() {
    const next = rows.filter((item) => !selectedForDelete.has(item.id));
    const count = rows.length - next.length;
    setRows(next);
    if (!next.some((item) => item.id === selectedId)) setSelectedId(next[0]?.id ?? "");
    setSelectedForDelete(new Set());
    setDeleteSelectorOpen(false);
    toast.success(`${count} bot ${count === 1 ? "project" : "projects"} deleted`);
  }

  const toggleStatus = (row: BotDashboardListing) => {
    const status: ListingStatus = row.status === "Paused" ? "Live" : "Paused";
    setRows((current) => current.map((item) => item.id === row.id ? {
      ...item,
      status,
      safetyStatus: item.safetyStatus === "PAUSED" ? (item.previousSafetyStatus ?? "SAFE") : "PAUSED",
      previousSafetyStatus: item.safetyStatus === "PAUSED" ? undefined : item.safetyStatus,
    } : item));
    toast.success(status === "Live" ? "Bot listing resumed" : "Bot listing paused");
  };
  const requestSingleDelete = (row: BotDashboardListing) => {
    setSelectedForDelete(new Set([row.id]));
    setDeleteConfirmOpen(true);
  };

  return (
    <div id="bots" className="scroll-mt-28 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight text-foreground">My Bots</h1><p className="mt-1 max-w-3xl text-muted">Manage your Discord bots, configure projects, and understand how people discover them.</p></div>
        <div className="flex items-center gap-2">
          <LinkButton href="/dashboard/new?type=bot"><span className="text-lg leading-none">+</span>Add Bot</LinkButton>
          <Button isIconOnly variant="secondary" aria-label="Refresh bot projects" onPress={refreshProjects}><RefreshCw className="size-4" /></Button>
          <Button isIconOnly variant="danger" aria-label="Select bot projects to delete" onPress={() => { setSelectedForDelete(new Set()); setDeleteSelectorOpen(true); }}><Trash2 className="size-4" /></Button>
        </div>
      </div>

      {!bot ? (
        <Card className="nexus-card p-8 text-center"><Card.Title>No bot projects</Card.Title><Card.Description className="mt-2">Add a bot or refresh the mock projects to continue.</Card.Description></Card>
      ) : (
        <>
      <BotSummary bot={bot} rows={rows} selectedId={selectedId} onSelect={setSelectedId} onPreview={() => setPreviewOpen(true)} onEdit={() => openEditor("all")} />
      <DeveloperControls onOpen={(panel) => openEditor(panel)} />

      <section className="space-y-4" aria-labelledby="bot-performance-heading">
        <div><h2 id="bot-performance-heading" className="text-xl font-bold text-foreground">Bot performance</h2><p className="mt-1 text-sm text-muted">Reliable discovery and server-growth analytics for {bot.name}.</p></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            const value = bot.analytics[metric.key];
            const change = bot.analytics.percentageChanges[metric.key];
            const display = formatCount(value);
            return <Card key={metric.key} className="nexus-card gap-2 p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted">{metric.label}</p><Icon className={`size-4 ${metric.color}`} /></div><p className="text-2xl font-bold tracking-tight text-foreground">{display}</p><p className={`text-xs font-medium ${change >= 0 ? "text-emerald-500" : "text-red-400"}`}>{change >= 0 ? "+" : ""}{change.toFixed(1)}% <span className="font-normal text-muted">vs previous 30 days</span></p></Card>;
          })}
        </div>
      </section>

      <AnalyticsLineChart
        title="Server growth"
        description="Track reported server additions over time. Removed-server tracking is coming soon."
        history={bot.analytics.history}
        series={[
          { key: "newServers", label: "New Servers", color: "#34D399" },
          { key: "removedServers", label: "Removed Servers", color: "#F87171", comingSoon: true },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="nexus-card gap-4"><Card.Header><Card.Title>Discovery</Card.Title><Card.Description>How people move from your Nexus listing to Discord.</Card.Description></Card.Header><Card.Content className="space-y-3"><FunnelRow label="Listing Views" value={bot.analytics.listingViews} /><FunnelRate label="View to Invite Click" value={(bot.analytics.inviteClicks / bot.analytics.listingViews) * 100} /><FunnelRow label="Invite Clicks" value={bot.analytics.inviteClicks} /></Card.Content></Card>
        <Card className="nexus-card gap-4"><Card.Header><Card.Title>Server growth</Card.Title><Card.Description>Net server movement during this period.</Card.Description></Card.Header><Card.Content className="space-y-3"><GrowthRow label="Active Servers" value={bot.analytics.activeServers} /><GrowthRow label="New Servers" value={bot.analytics.newServers} tone="positive" /><GrowthRow label="Removed Servers" value={bot.analytics.removedServers} comingSoon /><GrowthRow label="Net Growth" value={bot.analytics.newServers - bot.analytics.removedServers} tone="positive" /></Card.Content></Card>
      </div>

      <ListingHealth bot={bot} />
      <BotTable rows={rows} onPreview={(row) => { setSelectedId(row.id); setPreviewOpen(true); }} onEdit={(row) => openEditor("all", row)} onToggle={toggleStatus} onDelete={requestSingleDelete} />

      <Modal.Backdrop isOpen={previewOpen} onOpenChange={setPreviewOpen}><Modal.Container><Modal.Dialog className="sm:max-w-lg"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Preview · {bot.name}</Modal.Heading></Modal.Header><Modal.Body><p className="text-sm leading-relaxed text-muted">{bot.description}</p></Modal.Body><Modal.Footer><Button slot="close" variant="secondary">Close</Button><LinkButton href={bot.publicPath}>Open public page</LinkButton></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
      <BotEditorModal panel={editorPanel} draft={editorDraft} onPanelChange={setEditorPanel} onDraftChange={setEditorDraft} onClose={() => setEditorPanel(null)} onSave={saveEditor} />
      <Modal.Backdrop isOpen={deleteSelectorOpen} onOpenChange={setDeleteSelectorOpen}><Modal.Container><Modal.Dialog className="sm:max-w-lg"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Select bot projects</Modal.Heading></Modal.Header><Modal.Body className="space-y-2"><p className="mb-3 text-sm text-muted">Choose one or multiple projects to permanently delete.</p>{rows.map((row) => <Checkbox key={row.id} isSelected={selectedForDelete.has(row.id)} onChange={() => toggleDeleteSelection(row.id)}><Checkbox.Content className="w-full rounded-xl border border-border p-3"><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><BotAvatar bot={row} className="size-9" /><span className="min-w-0"><span className="block font-medium text-foreground">{row.name}</span><span className="block text-xs text-muted">{row.category} · {row.status}</span></span></Checkbox.Content></Checkbox>)}</Modal.Body><Modal.Footer><Button slot="close" variant="tertiary">Cancel</Button><Button variant="danger" isDisabled={!selectedForDelete.size} onPress={() => { setDeleteSelectorOpen(false); setDeleteConfirmOpen(true); }}><Trash2 className="size-4" />Continue</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
      <AlertDialog isOpen={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}><AlertDialog.Backdrop><AlertDialog.Container><AlertDialog.Dialog className="sm:max-w-[420px]"><AlertDialog.CloseTrigger /><AlertDialog.Header><AlertDialog.Icon status="danger" /><AlertDialog.Heading>Delete selected bot projects?</AlertDialog.Heading></AlertDialog.Header><AlertDialog.Body><p>This permanently removes {selectedForDelete.size} selected {selectedForDelete.size === 1 ? "project" : "projects"} from this mock dashboard. This action cannot be undone.</p></AlertDialog.Body><AlertDialog.Footer><Button slot="close" variant="tertiary">Cancel</Button><Button slot="close" variant="danger" onPress={deleteSelectedProjects}><Trash2 className="size-4" />Delete projects</Button></AlertDialog.Footer></AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop></AlertDialog>
        </>
      )}
    </div>
  );
}

function BotSummary({ bot, rows, selectedId, onSelect, onPreview, onEdit }: { bot: BotDashboardListing; rows: BotDashboardListing[]; selectedId: string; onSelect: (id: string) => void; onPreview: () => void; onEdit: () => void }) {
  return <Card className="nexus-card gap-0"><Card.Content className="p-4 sm:p-5"><div className="flex flex-col gap-5 xl:flex-row xl:items-center"><div className="flex min-w-0 flex-1 items-start gap-3.5"><BotAvatar bot={bot} className="size-14 sm:size-16" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-foreground">{bot.name}</h2><Chip size="sm" color="accent" variant="soft"><Chip.Label>BOT</Chip.Label></Chip><Chip size="sm" variant="soft" color={statusColor(bot.status)}><Chip.Label>{bot.status}</Chip.Label></Chip></div><p className="mt-0.5 text-xs font-medium text-muted">{bot.category} · Prefix {bot.prefix} · {formatCount(bot.analytics.activeServers)} active servers · Updated {bot.updated}</p><p className="mt-2 max-w-2xl text-sm text-muted">{bot.description}</p></div></div><div className="flex flex-col gap-3 xl:items-end"><Select className="w-full sm:w-56" selectedKey={selectedId} onSelectionChange={(key) => onSelect(String(key))}><Label>Selected bot</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{rows.map((item) => <ListBox.Item key={item.id} id={item.id} textValue={item.name}>{item.name}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select><div className="flex flex-wrap gap-2"><Button variant="secondary" onPress={onEdit}><Pencil className="size-4" />Edit</Button><Button variant="secondary" onPress={onPreview}><Eye className="size-4" />Preview</Button><LinkButton href={bot.publicPath} target="_blank" variant="secondary"><ExternalLink className="size-4" />Public page</LinkButton><Dropdown><Dropdown.Trigger aria-label={`More actions for ${bot.name}`} className="button button--ghost button--icon-only"><MoreHorizontal className="size-4" /></Dropdown.Trigger><Dropdown.Popover placement="bottom end"><Dropdown.Menu onAction={(key) => key === "pause" && toast.info("Bot listing paused")}><Dropdown.Item id="pause" textValue="Pause listing">Pause listing</Dropdown.Item></Dropdown.Menu></Dropdown.Popover></Dropdown></div></div></div></Card.Content></Card>;
}

function DeveloperControls({ onOpen }: { onOpen: (panel: BotEditorPanel) => void }) {
  const tools = [
    { label: "Listing details", description: "Name, descriptions, category, and tags", icon: Pencil, panel: "details" },
    { label: "Commands & features", description: "Commands, capabilities, and premium options", icon: Code2, panel: "commands" },
    { label: "Links & integrations", description: "Invite, support, website, and repository links", icon: LinkIcon, panel: "links" },
    { label: "Media & settings", description: "Avatar, banner, gallery, and visibility", icon: Settings2, panel: "media" },
  ];
  return (
    <section className="space-y-3" aria-labelledby="developer-controls-heading">
      <div><h2 id="developer-controls-heading" className="text-xl font-bold text-foreground">Developer controls</h2><p className="mt-1 text-sm text-muted">Configure the selected bot without mixing settings into analytics.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button key={tool.panel} variant="secondary" className="h-auto justify-start rounded-2xl p-4 text-left" onPress={() => onOpen(tool.panel as BotEditorPanel)}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="size-4" /></span>
              <span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{tool.label}</span><span className="mt-0.5 block whitespace-normal text-xs font-normal leading-relaxed text-muted">{tool.description}</span></span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}

function ListingHealth({ bot }: { bot: BotDashboardListing }) {
  const rows = [
    { label: "Listing Status", value: bot.status === "Live · Pending Review" ? "Live" : bot.status, icon: Radio, good: bot.status !== "Draft" },
    { label: "Review Status", value: bot.listingHealth.reviewStatus, icon: ShieldQuestion, good: bot.listingHealth.reviewStatus !== "Not Submitted" },
    { label: "Bot Invite Link", value: bot.listingHealth.inviteConnected ? "Active" : "Missing", icon: LinkIcon, good: bot.listingHealth.inviteConnected },
    { label: "Support Server", value: bot.listingHealth.supportConnected ? "Connected" : "Not Added", icon: MessagesSquare, good: bot.listingHealth.supportConnected },
    { label: "Website", value: bot.listingHealth.websiteConnected ? "Connected" : "Not Added", icon: Globe, good: bot.listingHealth.websiteConnected },
    { label: "GitHub Repository", value: bot.listingHealth.githubConnected ? "Connected" : "Not Added", icon: GitBranch, good: bot.listingHealth.githubConnected },
    { label: "Last Updated", value: bot.updated, icon: Clock, good: true },
  ];
  return <Card className="nexus-card gap-4"><Card.Header><Card.Title>Bot listing health</Card.Title><Card.Description>The condition of this Nexus listing, not bot uptime or hosting.</Card.Description></Card.Header><Card.Content className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rows.map((row) => { const Icon = row.icon; return <div key={row.label} className="flex items-center gap-3 rounded-xl border border-border p-3"><Icon className="size-4 shrink-0 text-muted" /><span className="min-w-0 flex-1 text-sm text-foreground">{row.label}</span><Chip size="sm" variant="soft" color={row.good ? "success" : "default"}><Chip.Label>{row.value}</Chip.Label></Chip></div>; })}</Card.Content></Card>;
}

function BotTable({ rows, onPreview, onEdit, onToggle, onDelete }: { rows: BotDashboardListing[]; onPreview: (row: BotDashboardListing) => void; onEdit: (row: BotDashboardListing) => void; onToggle: (row: BotDashboardListing) => void; onDelete: (row: BotDashboardListing) => void }) {
  return <section className="space-y-4" aria-labelledby="bot-listings-heading"><div><h2 id="bot-listings-heading" className="text-xl font-bold text-foreground">Bot listings</h2><p className="mt-1 text-sm text-muted">Manage your projects and open developer settings.</p></div><Table><Table.ScrollContainer><Table.Content aria-label="Bot listings" className="min-w-[980px]"><Table.Header><Table.Column isRowHeader>Bot</Table.Column><Table.Column>Status</Table.Column><Table.Column>Listing Views</Table.Column><Table.Column>Invite Clicks</Table.Column><Table.Column>Active Servers</Table.Column><Table.Column>Votes</Table.Column><Table.Column>Updated</Table.Column><Table.Column className="text-end">Actions</Table.Column></Table.Header><Table.Body>{rows.map((row) => <Table.Row key={row.id} id={row.id}><Table.Cell><div className="flex items-center gap-2.5"><BotAvatar bot={row} className="size-9" /><div><p className="font-medium">{row.name}</p><p className="text-xs text-muted">{row.category}</p></div></div></Table.Cell><Table.Cell><Chip size="sm" variant="soft" color={statusColor(row.status)}><Chip.Label>{row.status}</Chip.Label></Chip></Table.Cell><Table.Cell>{formatCount(row.analytics.listingViews)}</Table.Cell><Table.Cell>{formatCount(row.analytics.inviteClicks)}</Table.Cell><Table.Cell>{formatCount(row.analytics.activeServers)}</Table.Cell><Table.Cell>{formatCount(row.analytics.votes)}</Table.Cell><Table.Cell className="text-muted">{row.updated}</Table.Cell><Table.Cell><div className="flex justify-end gap-1"><Button isIconOnly size="sm" variant="ghost" aria-label={`Edit ${row.name}`} onPress={() => onEdit(row)}><Pencil className="size-4" /></Button><Button isIconOnly size="sm" variant="ghost" aria-label={`Preview ${row.name}`} onPress={() => onPreview(row)}><Eye className="size-4" /></Button><Dropdown><Dropdown.Trigger aria-label={`Actions for ${row.name}`} className="button button--ghost button--sm button--icon-only"><MoreHorizontal className="size-4" /></Dropdown.Trigger><Dropdown.Popover placement="bottom end"><Dropdown.Menu onAction={(key) => { if (key === "public") window.open(row.publicPath, "_blank", "noopener,noreferrer"); if (key === "toggle") onToggle(row); if (key === "delete") onDelete(row); }}><Dropdown.Item id="public" textValue="View public page"><ExternalLink className="size-4" />View public page</Dropdown.Item><Dropdown.Item id="toggle" textValue={row.status === "Paused" ? "Resume" : "Pause"}>{row.status === "Paused" ? "Resume" : "Pause"}</Dropdown.Item><Dropdown.Item id="delete" textValue="Delete" variant="danger">Delete</Dropdown.Item></Dropdown.Menu></Dropdown.Popover></Dropdown></div></Table.Cell></Table.Row>)}</Table.Body></Table.Content></Table.ScrollContainer></Table></section>;
}

const EDITOR_PANELS: Array<{ id: BotEditorPanel; label: string }> = [
  { id: "details", label: "Listing details" },
  { id: "commands", label: "Commands & features" },
  { id: "links", label: "Links & integrations" },
  { id: "media", label: "Media & settings" },
];

function BotEditorModal({ panel, draft, onPanelChange, onDraftChange, onClose, onSave }: { panel: BotEditorPanel | null; draft: BotEditorDraft | null; onPanelChange: (panel: BotEditorPanel) => void; onDraftChange: (draft: BotEditorDraft) => void; onClose: () => void; onSave: () => void }) {
  if (!draft) return null;
  const update = <K extends keyof BotEditorDraft>(key: K, value: BotEditorDraft[K]) => onDraftChange({ ...draft, [key]: value });
  const show = (section: BotEditorPanel) => panel === "all" || panel === section;

  function updateCommand(id: string, patch: Partial<BotCommand>) {
    update("commands", draft!.commands.map((command) => command.id === id ? { ...command, ...patch } : command));
  }

  return (
    <Modal.Backdrop isOpen={Boolean(panel)} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog className="max-h-[92vh] sm:max-w-4xl">
          <Modal.CloseTrigger />
          <Modal.Header><Modal.Heading>Edit {draft.name}</Modal.Heading></Modal.Header>
          <Modal.Body className="max-h-[72vh] space-y-6 overflow-y-auto">
            {panel !== "all" ? <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-default/50 p-2">
              {EDITOR_PANELS.map((item) => <Button key={item.id} className="min-h-10 whitespace-normal px-3 text-center text-xs sm:text-sm" variant={panel === item.id ? "primary" : "ghost"} onPress={() => onPanelChange(item.id)}>{item.label}</Button>)}
            </div> : <p className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-muted">All listing options are available below. Changes stay in this mock dashboard session.</p>}

            {show("details") ? <EditorSection title="Listing details" description="Core information, descriptions, discovery tags, and category.">
              <div className="grid gap-4 sm:grid-cols-2"><TextField isRequired value={draft.name} onChange={(value) => update("name", value)}><Label>Bot name</Label><Input placeholder="Bot name" /></TextField><TextField isRequired value={draft.clientId} onChange={(value) => update("clientId", value)}><Label>Bot client ID</Label><Input placeholder="Discord application ID" /></TextField></div>
              <div className="grid gap-4 sm:grid-cols-2"><TextField isRequired value={draft.prefix} onChange={(value) => update("prefix", value)}><Label>Bot prefix</Label><Input placeholder="/" /></TextField><Select selectedKey={draft.category} onSelectionChange={(key) => update("category", String(key))}><Label>Category</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{BOT_CATEGORIES.filter((category) => category !== "All").map((category) => <ListBox.Item key={category} id={category} textValue={category}>{category}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select></div>
              <TextField value={draft.description} onChange={(value) => update("description", value)}><Label>Short description</Label><TextArea rows={3} maxLength={180} className="resize-y" /></TextField>
              <div><p className="mb-2 text-sm font-medium text-foreground">Long description</p><RichDescriptionEditor value={draft.fullDescription} onChange={(value) => update("fullDescription", value)} /></div>
              <TagMultiSelect value={draft.tags} options={BOT_LISTING_TAGS} onChange={(value) => update("tags", value)} placeholder="Select up to 3 tags" />
            </EditorSection> : null}

            {show("commands") ? <EditorSection title="Commands & features" description="Configure commands, capabilities, and optional premium features.">
              <BotFeatureSelect value={draft.botFeatures} onChange={(value) => update("botFeatures", value)} />
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-foreground">Bot commands</p><Button size="sm" variant="secondary" onPress={() => update("commands", [...draft.commands, { id: `command-${Date.now()}`, name: "", description: "" }])}><Plus className="size-4" />Add command</Button></div>
              <div className="space-y-3">{draft.commands.map((command, index) => <div key={command.id} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1.5fr_auto]"><TextField value={command.name} onChange={(value) => updateCommand(command.id, { name: value })}><Label>Command {index + 1}</Label><Input placeholder="/help" /></TextField><TextField value={command.description} onChange={(value) => updateCommand(command.id, { description: value })}><Label>Description</Label><Input placeholder="Describe the command" /></TextField><div className="flex items-end"><Button isIconOnly variant="ghost" aria-label={`Remove command ${index + 1}`} isDisabled={draft.commands.length <= 2} onPress={() => update("commands", draft.commands.filter((item) => item.id !== command.id))}><Trash2 className="size-4" /></Button></div></div>)}</div>
              <div className="flex items-center justify-between rounded-2xl border border-border p-4"><div><p className="text-sm font-medium text-foreground">Premium features</p><p className="text-xs text-muted">Mark the bot as offering optional paid features.</p></div><Switch isSelected={draft.premium} onChange={(value) => update("premium", value)} aria-label="Premium features"><Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch.Content></Switch></div>
            </EditorSection> : null}

            {show("links") ? <EditorSection title="Links & integrations" description="Manage the invite and optional support, website, and repository links.">
              <div className="grid gap-4 sm:grid-cols-2"><TextField isRequired value={draft.inviteUrl} onChange={(value) => update("inviteUrl", value)}><Label>Bot invite URL</Label><Input placeholder="https://discord.com/oauth2/..." /></TextField><TextField value={draft.supportUrl} onChange={(value) => update("supportUrl", value)}><Label>Support server URL (Optional)</Label><Input placeholder="https://discord.gg/..." /></TextField><TextField value={draft.websiteUrl} onChange={(value) => update("websiteUrl", value)}><Label>Website URL (Optional)</Label><Input placeholder="https://" /></TextField><TextField value={draft.githubUrl} onChange={(value) => update("githubUrl", value)}><Label>GitHub repository (Optional)</Label><Input placeholder="https://github.com/..." /></TextField></div>
            </EditorSection> : null}

            {show("media") ? <EditorSection title="Media & settings" description="Update marketplace media and control listing visibility.">
              <div className="grid gap-3 sm:grid-cols-3"><MediaControl title="Bot avatar" detail={draft.hasAvatar ? "Avatar ready" : "No avatar"} onPress={() => update("hasAvatar", !draft.hasAvatar)} /><MediaControl title="Bot banner" detail={draft.hasBanner ? "Banner ready" : "No banner"} onPress={() => update("hasBanner", !draft.hasBanner)} /><MediaControl title="Gallery" detail={`${draft.galleryCount}/6 images`} onPress={() => update("galleryCount", draft.galleryCount >= 6 ? 0 : draft.galleryCount + 1)} /></div>
              <Select selectedKey={draft.visibility} onSelectionChange={(key) => update("visibility", String(key))}><Label>Listing visibility</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{["Public", "Unlisted", "Private"].map((value) => <ListBox.Item key={value} id={value} textValue={value}>{value}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select>
            </EditorSection> : null}
          </Modal.Body>
          <Modal.Footer><Button slot="close" variant="tertiary">Cancel</Button><Button onPress={onSave}><Save className="size-4" />Save changes</Button></Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function EditorSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-2xl border border-border p-4 sm:p-5"><div><h3 className="font-semibold text-foreground">{title}</h3><p className="mt-1 text-xs text-muted">{description}</p></div>{children}</section>;
}

function MediaControl({ title, detail, onPress }: { title: string; detail: string; onPress: () => void }) {
  return <Button variant="secondary" className="h-auto justify-start rounded-2xl p-4 text-left" onPress={onPress}><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Upload className="size-4" /></span><span><span className="block text-sm font-semibold text-foreground">{title}</span><span className="block text-xs font-normal text-muted">{detail}</span></span></Button>;
}

function BotAvatar({ bot, className }: { bot: BotDashboardListing; className: string }) { return <Avatar className={`shrink-0 rounded-xl ${className}`}>{bot.avatar ? <Avatar.Image src={bot.avatar} alt="" /> : null}<Avatar.Fallback className="rounded-xl bg-accent/15 text-sm font-bold text-accent">{initials(bot.name)}</Avatar.Fallback></Avatar>; }
function FunnelRow({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-between rounded-xl bg-default px-4 py-3"><span className="text-sm text-muted">{label}</span><span className="font-bold text-foreground">{formatCount(value)}</span></div>; }
function FunnelRate({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-center gap-2 text-xs text-muted"><TrendingUp className="size-3.5 text-accent" />{label}: <span className="font-semibold text-foreground">{value.toFixed(1)}%</span></div>; }
function GrowthRow({ label, value, tone, comingSoon = false }: { label: string; value: number; tone?: "positive" | "negative"; comingSoon?: boolean }) { return <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"><span className="flex flex-wrap items-center gap-2 text-sm text-muted">{label}{comingSoon ? <Chip size="sm" variant="soft"><Chip.Label>Coming Soon</Chip.Label></Chip> : null}</span><span className={`font-bold ${tone === "positive" ? "text-emerald-500" : tone === "negative" ? "text-red-400" : "text-foreground"}`}>{comingSoon ? "—" : <>{tone === "positive" ? "+" : tone === "negative" ? "−" : ""}{formatCount(value)}</>}</span></div>; }
