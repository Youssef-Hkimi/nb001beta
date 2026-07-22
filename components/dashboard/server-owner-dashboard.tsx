"use client";

import {
  Alert,
  AlertDialog,
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  CloseButton,
  Dropdown,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Switch,
  Tabs,
  TextField,
  toast,
} from "@heroui/react";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Eye,
  Link2,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Plus,
  Server,
  ShieldCheck,
  Trash2,
  TrendingUp,
  ThumbsUp,
  UserMinus,
} from "lucide-react";
import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";

import { AnalyticsLineChart } from "@/components/dashboard/analytics-line-chart";
import { CommunityFeatureSelect } from "@/components/forms/community-feature-select";
import { RichDescriptionEditor } from "@/components/forms/rich-description-editor";
import { TagMultiSelect } from "@/components/forms/tag-multi-select";
import { UploadBox } from "@/components/forms/upload-box";
import { ListingStatusChip } from "@/components/listing/listing-safety";
import { LinkButton } from "@/components/ui/link-button";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";
import { EXPLORE_CATEGORIES, LANGUAGES, SERVER_LISTING_TAGS } from "@/lib/data/categories";
import { DEFAULT_COMMUNITY_FEATURE_IDS } from "@/lib/data/community-features";
import { SERVER_DASHBOARD_LISTINGS } from "@/lib/data/dashboard-analytics";
import { formatCount, initials } from "@/lib/format";
import { LISTING_STATUS_CONFIG } from "@/lib/listing-safety";
import type { ListingStatus, ServerDashboardListing } from "@/lib/types";

const REGIONS = ["Global", "North America", "Europe", "Asia", "South America", "Oceania"] as const;
const ACTIVITY_LEVELS = ["Very Active", "Active", "Calm"] as const;
const VISIBILITY = ["Public", "Unlisted", "Private"] as const;

type EditableServerListing = ServerDashboardListing & {
  fullDescription?: string;
  tags?: string[];
  language?: string;
  region?: string;
  activity?: string;
  visibility?: string;
  featured?: boolean;
  communityFeatures?: string[];
  inviteUrl?: string;
  createdAt?: string;
  iconPreview?: string | null;
  bannerPreview?: string | null;
};

type ServerEditForm = {
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  tags: string[];
  language: string;
  region: string;
  inviteUrl: string;
  members: string;
  online: string;
  likes: string;
  joinClicks: string;
  createdAt: string;
  activity: string;
  visibility: string;
  featured: boolean;
  communityFeatures: string[];
  iconPreview: string | null;
  bannerPreview: string | null;
};

const ANALYTICS_METRICS = [
  { key: "listingViews", label: "Listing Views", icon: Eye },
  { key: "joinClicks", label: "Join Clicks", icon: MousePointerClick },
  { key: "confirmedJoins", label: "Members left", icon: UserMinus, comingSoon: true },
  { key: "likes", label: "Votes", icon: ThumbsUp },
  { key: "conversionRate", label: "Conversion Rate", icon: TrendingUp },
] as const;

const EMPTY_EDIT_FORM: ServerEditForm = {
  name: "",
  shortDescription: "",
  fullDescription: "",
  category: "Social",
  tags: [],
  language: "English",
  region: "Global",
  inviteUrl: "",
  members: "",
  online: "",
  likes: "",
  joinClicks: "",
  createdAt: "",
  activity: "Active",
  visibility: "Public",
  featured: false,
  communityFeatures: [],
  iconPreview: null,
  bannerPreview: null,
};

function listingStatusColor(status: ListingStatus) {
  if (status === "Live") return "success" as const;
  if (status.includes("Review")) return "warning" as const;
  if (status === "Suspended" || status === "Rejected") return "danger" as const;
  return "default" as const;
}

export function ServerOwnerDashboard() {
  const [servers, setServers] = useState<EditableServerListing[]>(SERVER_DASHBOARD_LISTINGS);
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsServerId, setAnalyticsServerId] = useState<string | null>(null);
  const [inviteServer, setInviteServer] = useState<ServerDashboardListing | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [editServer, setEditServer] = useState<EditableServerListing | null>(null);
  const [editForm, setEditForm] = useState<ServerEditForm>(EMPTY_EDIT_FORM);
  const [editExpanded, setEditExpanded] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [deletePickerOpen, setDeletePickerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());

  const analyticsServer = useMemo(
    () => servers.find((server) => server.id === analyticsServerId) ?? null,
    [servers, analyticsServerId],
  );

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("serverTab");
    if (requestedTab === "overview" || requestedTab === "analytics" || requestedTab === "status") {
      setActiveTab(requestedTab);
    }
  }, []);

  function copyLink(server: ServerDashboardListing) {
    void navigator.clipboard?.writeText(`${window.location.origin}${server.publicPath}`);
    toast.success("Listing link copied");
  }

  function toggleListing(server: ServerDashboardListing) {
    const resume = server.status === "Paused";
    setServers((current) => current.map((item) => item.id === server.id ? {
      ...item,
      status: resume ? "Live" : "Paused",
      safetyStatus: resume ? (item.previousSafetyStatus ?? "SAFE") : "PAUSED",
      previousSafetyStatus: resume ? undefined : item.safetyStatus,
      updated: "Just now",
    } : item));
    toast.success(resume ? "Server listing resumed" : "Server listing paused");
  }

  function openInviteEditor(server: ServerDashboardListing) {
    setInviteServer(server);
    setInviteUrl(`https://discord.gg/${server.id}`);
  }

  function saveInviteLink() {
    if (!inviteServer) return;
    setServers((current) => current.map((server) => server.id === inviteServer.id ? {
      ...server,
      inviteActive: true,
      inviteOutdated: false,
      inviteLastChecked: "Just now",
      updated: "Just now",
    } : server));
    toast.success("Invite link updated");
    setInviteServer(null);
  }

  function openEditServer(server: EditableServerListing) {
    setEditServer(server);
    setEditExpanded(false);
    setEditForm({
      name: server.name,
      shortDescription: server.description,
      fullDescription: server.fullDescription ?? server.description,
      category: server.category,
      tags: server.tags ?? [],
      language: server.language ?? "English",
      region: server.region ?? "Global",
      inviteUrl: server.inviteUrl ?? `https://discord.gg/${server.id}`,
      members: String(server.members),
      online: String(server.online),
      likes: String(server.analytics.likes),
      joinClicks: String(server.analytics.joinClicks),
      createdAt: server.createdAt ?? "2024",
      activity: server.activity ?? "Active",
      visibility: server.visibility ?? "Public",
      featured: server.featured ?? false,
      communityFeatures: server.communityFeatures ?? [...DEFAULT_COMMUNITY_FEATURE_IDS],
      iconPreview: server.iconPreview ?? null,
      bannerPreview: server.bannerPreview ?? null,
    });
  }

  function saveServerChanges() {
    if (!editServer) return;
    const name = editForm.name.trim();
    const shortDescription = editForm.shortDescription.trim();
    const category = editForm.category.trim();
    if (!name || !shortDescription || !editForm.fullDescription.trim() || !category || !editForm.inviteUrl.trim()) return;

    setServers((current) => current.map((server) => server.id === editServer.id
      ? {
          ...server,
          name,
          description: shortDescription,
          fullDescription: editForm.fullDescription.trim(),
          category,
          tags: editForm.tags,
          language: editForm.language,
          region: editForm.region,
          inviteUrl: editForm.inviteUrl.trim(),
          members: Number(editForm.members) || 0,
          online: Number(editForm.online) || 0,
          createdAt: editForm.createdAt,
          activity: editForm.activity,
          visibility: editForm.visibility,
          featured: editForm.featured,
          communityFeatures: editForm.communityFeatures,
          iconPreview: editForm.iconPreview,
          bannerPreview: editForm.bannerPreview,
          analytics: {
            ...server.analytics,
            likes: Number(editForm.likes) || 0,
            joinClicks: Number(editForm.joinClicks) || 0,
          },
          updated: "Just now",
        }
      : server));
    setEditServer(null);
    setShowUpdateSuccess(true);
  }

  function openDeletePicker() {
    setSelectedForDelete(new Set());
    setDeletePickerOpen(true);
  }

  function toggleDeleteSelection(serverId: string, selected: boolean) {
    setSelectedForDelete((current) => {
      const next = new Set(current);
      if (selected) next.add(serverId);
      else next.delete(serverId);
      return next;
    });
  }

  function deleteSelectedServers() {
    setServers((current) => current.filter((server) => !selectedForDelete.has(server.id)));
    if (analyticsServerId && selectedForDelete.has(analyticsServerId)) setAnalyticsServerId(null);
    const count = selectedForDelete.size;
    setSelectedForDelete(new Set());
    setDeleteConfirmOpen(false);
    toast.success(`${count} server ${count === 1 ? "project" : "projects"} deleted`);
  }

  const selectedDeleteServers = servers.filter((server) => selectedForDelete.has(server.id));

  return (
    <div id="servers" className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Servers</h1>
          <p className="mt-1 max-w-3xl text-muted">Manage your Discord server listings, analytics, and Nexus status.</p>
        </div>
        <LinkButton href="/dashboard/new?type=server"><Plus className="size-4" />Add Server</LinkButton>
      </header>

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))} className="server-dashboard-tabs w-full" variant="primary">
        <Tabs.ListContainer className="w-full max-w-2xl">
          <Tabs.List aria-label="Server dashboard sections">
            <Tabs.Tab id="overview">Overview</Tabs.Tab>
            <Tabs.Tab id="analytics">Analytics</Tabs.Tab>
            <Tabs.Tab id="status">Status</Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="overview" className="pt-2">
          <OverviewTab
            servers={servers}
            onCopy={copyLink}
            onDelete={openDeletePicker}
            onDismissUpdate={() => setShowUpdateSuccess(false)}
            onEdit={openEditServer}
            onInvite={openInviteEditor}
            onToggle={toggleListing}
            showUpdateSuccess={showUpdateSuccess}
          />
        </Tabs.Panel>

        <Tabs.Panel id="analytics" className="pt-2">
          <AnalyticsTab
            servers={servers}
            selectedId={analyticsServerId}
            selectedServer={analyticsServer}
            onSelect={(id) => {
              setAnalyticsServerId(id);
              toast.success("Server selected for analytics");
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel id="status" className="pt-2">
          <StatusTab servers={servers} onInvite={openInviteEditor} />
        </Tabs.Panel>
      </Tabs>

      <Modal.Backdrop isOpen={Boolean(inviteServer)} onOpenChange={(open) => !open && setInviteServer(null)}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>Update invite link</Modal.Heading></Modal.Header>
            <Modal.Body className="space-y-3">
              <p className="text-sm text-muted">Update the public Discord invite for {inviteServer?.name}.</p>
              <TextField value={inviteUrl} onChange={setInviteUrl}>
                <Label>Discord invite URL</Label>
                <Input placeholder="https://discord.gg/example" />
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">Cancel</Button>
              <Button onPress={saveInviteLink}>Save Invite</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop isOpen={Boolean(editServer)} onOpenChange={(open) => !open && setEditServer(null)}>
        <Modal.Container>
          <Modal.Dialog className={editExpanded ? "sm:max-w-6xl" : "sm:max-w-3xl"}>
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>Edit server</Modal.Heading></Modal.Header>
            <Modal.Body className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-segment p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Editing {editServer?.name}</p>
                  <p className="text-xs text-muted">Changes are saved to this mock dashboard session.</p>
                </div>
                {editServer && (
                  <LinkButton href={editServer.publicPath} target="_blank" size="sm" variant="secondary">
                    <Eye className="size-4" />Live Preview<ExternalLink className="size-3.5" />
                  </LinkButton>
                )}
              </div>

              <EditSection title="Basic info" description="Core information shown across Nexus.">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField isRequired value={editForm.name} onChange={(name) => setEditForm((form) => ({ ...form, name }))}>
                    <Label>Server name</Label>
                    <Input placeholder="Server name" />
                  </TextField>
                  <Select selectedKey={editForm.category} onSelectionChange={(key) => setEditForm((form) => ({ ...form, category: String(key) }))}>
                    <Label>Category</Label>
                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                    <Select.Popover><ListBox>{EXPLORE_CATEGORIES.map((category) => <ListBox.Item key={category} id={category} textValue={category}>{category}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
                  </Select>
                </div>
                <TextField isRequired value={editForm.inviteUrl} onChange={(inviteUrl) => setEditForm((form) => ({ ...form, inviteUrl }))}>
                  <Label>Discord invite URL</Label>
                  <Input placeholder="https://discord.gg/example" />
                </TextField>
                <TextField isRequired value={editForm.shortDescription} onChange={(shortDescription) => setEditForm((form) => ({ ...form, shortDescription }))}>
                  <Label>Short description</Label>
                  <Input placeholder="One-line pitch for the listing card" />
                </TextField>
              </EditSection>

              <EditSection title="Full description" description="Use formatting tools, expand the editor, and review changes instantly.">
                <RichDescriptionEditor
                  value={editForm.fullDescription}
                  onChange={(fullDescription) => setEditForm((form) => ({ ...form, fullDescription }))}
                  expanded={editExpanded}
                  onExpandedChange={setEditExpanded}
                />
              </EditSection>

              <EditSection title="Discovery" description="Help people find the right community.">
                <div className="grid gap-4 md:grid-cols-2">
                  <TagMultiSelect
                    value={editForm.tags}
                    options={SERVER_LISTING_TAGS}
                    onChange={(tags) => setEditForm((form) => ({ ...form, tags }))}
                    placeholder="Select up to 3 tags"
                  />
                  <Select selectedKey={editForm.language} onSelectionChange={(key) => setEditForm((form) => ({ ...form, language: String(key) }))}>
                    <Label>Language</Label>
                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                    <Select.Popover><ListBox>{LANGUAGES.filter((language) => language !== "All").map((language) => <ListBox.Item key={language} id={language} textValue={language}>{language}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
                  </Select>
                  <Select selectedKey={editForm.region} onSelectionChange={(key) => setEditForm((form) => ({ ...form, region: String(key) }))}>
                    <Label>Region</Label>
                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                    <Select.Popover><ListBox>{REGIONS.map((region) => <ListBox.Item key={region} id={region} textValue={region}>{region}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
                  </Select>
                </div>
              </EditSection>

              <CommunityFeatureSelect
                value={editForm.communityFeatures}
                onChange={(communityFeatures) => setEditForm((form) => ({ ...form, communityFeatures }))}
              />

              <EditSection title="Listing preferences" description="Member counts and server statistics are synced automatically from Discord.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Select selectedKey={editForm.activity} onSelectionChange={(key) => setEditForm((form) => ({ ...form, activity: String(key) }))}>
                    <Label>Activity</Label>
                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                    <Select.Popover><ListBox>{ACTIVITY_LEVELS.map((activity) => <ListBox.Item key={activity} id={activity} textValue={activity}>{activity}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
                  </Select>
                  <Select selectedKey={editForm.visibility} onSelectionChange={(key) => setEditForm((form) => ({ ...form, visibility: String(key) }))}>
                    <Label>Visibility</Label>
                    <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                    <Select.Popover><ListBox>{VISIBILITY.map((visibility) => <ListBox.Item key={visibility} id={visibility} textValue={visibility}>{visibility}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
                  </Select>
                </div>
              </EditSection>

              <EditSection title="Server media" description="Update the server icon and banner used on Nexus.">
                <div className="grid gap-4 md:grid-cols-2">
                  <UploadBox
                    title="Server icon"
                    hint="Drag & drop or click"
                    sizeHint="Recommended 512×512"
                    variant="icon"
                    previewUrl={editForm.iconPreview}
                    onFile={(_, iconPreview) => setEditForm((form) => ({ ...form, iconPreview }))}
                    onClear={() => setEditForm((form) => ({ ...form, iconPreview: null }))}
                  />
                  <UploadBox
                    title="Server banner"
                    hint="Drag & drop or click"
                    sizeHint="Recommended 960×320"
                    variant="banner"
                    previewUrl={editForm.bannerPreview}
                    onFile={(_, bannerPreview) => setEditForm((form) => ({ ...form, bannerPreview }))}
                    onClear={() => setEditForm((form) => ({ ...form, bannerPreview: null }))}
                  />
                </div>
              </EditSection>

              <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                <div><p className="text-sm font-medium text-foreground">Featured</p><p className="text-xs text-muted">Request featured placement for this listing.</p></div>
                <Switch aria-label="Featured" isSelected={editForm.featured} onChange={(featured) => setEditForm((form) => ({ ...form, featured }))}>
                  <Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch.Content>
                </Switch>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">Cancel</Button>
              <Button
                isDisabled={!editForm.name.trim() || !editForm.category.trim() || !editForm.inviteUrl.trim() || !editForm.shortDescription.trim() || !editForm.fullDescription.trim()}
                onPress={saveServerChanges}
              >
                Update Server
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop isOpen={deletePickerOpen} onOpenChange={setDeletePickerOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>Select projects to delete</Modal.Heading></Modal.Header>
            <Modal.Body className="space-y-2">
              <p className="pb-2 text-sm text-muted">Choose one or more server projects. You will review your selection before deletion.</p>
              {servers.map((server) => (
                <Checkbox
                  key={server.id}
                  isSelected={selectedForDelete.has(server.id)}
                  onChange={(selected) => toggleDeleteSelection(server.id, selected)}
                  className="w-full rounded-xl border border-border p-3"
                >
                  <Checkbox.Content>
                    <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                    <ServerAvatar server={server} className="size-9" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{server.name}</span>
                      <span className="block text-xs text-muted">{server.status}</span>
                    </span>
                  </Checkbox.Content>
                </Checkbox>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">Cancel</Button>
              <Button
                variant="danger"
                isDisabled={selectedForDelete.size === 0}
                onPress={() => {
                  setDeletePickerOpen(false);
                  setDeleteConfirmOpen(true);
                }}
              >
                Continue ({selectedForDelete.size})
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <AlertDialog isOpen={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[420px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Delete {selectedForDelete.size === 1 ? "project" : "projects"} permanently?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will permanently delete <strong>{selectedDeleteServers.map((server) => server.name).join(", ")}</strong> and all associated listing data. This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">Cancel</Button>
                <Button slot="close" variant="danger" onPress={deleteSelectedServers}>
                  <Trash2 className="size-4" />Delete Project
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}

function OverviewTab({ servers, onCopy, onDelete, onDismissUpdate, onEdit, onInvite, onToggle, showUpdateSuccess }: {
  servers: EditableServerListing[];
  onCopy: (server: ServerDashboardListing) => void;
  onDelete: () => void;
  onDismissUpdate: () => void;
  onEdit: (server: EditableServerListing) => void;
  onInvite: (server: ServerDashboardListing) => void;
  onToggle: (server: ServerDashboardListing) => void;
  showUpdateSuccess: boolean;
}) {
  return (
    <section className="space-y-4" aria-labelledby="your-servers-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 id="your-servers-heading" className="text-xl font-bold text-foreground">Your servers</h2><p className="mt-1 text-sm text-muted">Edit listing details and keep invite links current.</p></div>
        <Button variant="danger" onPress={onDelete} isDisabled={servers.length === 0}>
          <Trash2 className="size-4" />Delete Project
        </Button>
      </div>
      {showUpdateSuccess && (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content><Alert.Title>Server updated successfully</Alert.Title></Alert.Content>
          <CloseButton aria-label="Dismiss success message" onPress={onDismissUpdate} />
        </Alert>
      )}
      <div className="space-y-3">
        {servers.length === 0 && (
          <Card variant="secondary" className="items-center p-10 text-center">
            <Server className="size-6 text-muted" />
            <h3 className="font-semibold text-foreground">No server projects</h3>
            <p className="text-sm text-muted">Add a server to start managing a Nexus listing.</p>
          </Card>
        )}
        {servers.map((server) => (
          <Card key={server.id} variant="default" className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <ServerAvatar server={server} className="size-12" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{server.name}</h3>
                    <Chip size="sm" variant="soft" color={listingStatusColor(server.status)}><Chip.Label>{server.status === "Live · Pending Review" ? "Live" : server.status}</Chip.Label></Chip>
                    <ListingStatusChip status={server.safetyStatus} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{server.description}</p>
                  <p className="mt-2 text-xs text-muted">{server.category} · {formatCount(server.members)} members · Updated {server.updated}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button size="sm" variant="secondary" onPress={() => onEdit(server)}><Pencil className="size-4" />Edit</Button>
                <Button size="sm" variant="secondary" onPress={() => onInvite(server)}><Link2 className="size-4" />Update Invite</Button>
                <LinkButton href={server.publicPath} size="sm" variant="ghost"><ExternalLink className="size-4" />Public Page</LinkButton>
                <Dropdown>
                  <Dropdown.Trigger aria-label={`More actions for ${server.name}`} className="button button--ghost button--sm button--icon-only"><MoreHorizontal className="size-4" /></Dropdown.Trigger>
                  <Dropdown.Popover placement="bottom end"><Dropdown.Menu onAction={(key) => { if (key === "copy") onCopy(server); if (key === "toggle") onToggle(server); }}>
                    <Dropdown.Item id="copy" textValue="Copy listing link"><Copy className="size-4" />Copy Listing Link</Dropdown.Item>
                    <Dropdown.Item id="toggle" textValue={server.status === "Paused" ? "Resume listing" : "Pause listing"}>{server.status === "Paused" ? "Resume Listing" : "Pause Listing"}</Dropdown.Item>
                  </Dropdown.Menu></Dropdown.Popover>
                </Dropdown>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function AnalyticsTab({ servers, selectedId, selectedServer, onSelect }: {
  servers: ServerDashboardListing[];
  selectedId: string | null;
  selectedServer: ServerDashboardListing | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="space-y-5" aria-labelledby="server-analytics-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 id="server-analytics-heading" className="text-xl font-bold text-foreground">Server analytics</h2><p className="mt-1 text-sm text-muted">Select one server to view its performance.</p></div>
        <Select className="w-full sm:w-64" selectedKey={selectedId} onSelectionChange={(key) => onSelect(String(key))} placeholder="Select a server">
          <Label>Server</Label>
          <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
          <Select.Popover><ListBox>{servers.map((server) => <ListBox.Item key={server.id} id={server.id} textValue={server.name}><div className="flex items-center gap-2"><ServerAvatar server={server} className="size-8" /><span>{server.name}</span></div><ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
        </Select>
      </div>

      {!selectedServer ? (
        <Card variant="secondary" className="items-center p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Server className="size-6" /></span>
          <h3 className="mt-2 font-semibold text-foreground">Select a server</h3>
          <p className="max-w-md text-sm text-muted">Choose a server above to view listing views, joins, votes, and conversion data.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {ANALYTICS_METRICS.map((metric) => {
              const Icon = metric.icon;
              const value = selectedServer.analytics[metric.key];
              const comingSoon = "comingSoon" in metric && metric.comingSoon;
              const display = comingSoon ? "—" : metric.key === "conversionRate" ? `${value.toFixed(1)}%` : formatCount(value);
              return <Card key={metric.key} variant="default" className="gap-3 p-5"><span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="size-4" /></span><div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-medium text-muted">{metric.label}</p>{comingSoon ? <Chip size="sm" variant="soft"><Chip.Label>Coming Soon</Chip.Label></Chip> : null}</div><p className="mt-1 text-2xl font-bold text-foreground">{display}</p></div></Card>;
            })}
          </div>
          <AnalyticsLineChart
            title={`${selectedServer.name} performance`}
            description="Listing views and join clicks over time. Members-left tracking is coming soon."
            history={selectedServer.analytics.history}
            series={[
              { key: "listingViews", label: "Listing Views", color: "#629BF8" },
              { key: "joinClicks", label: "Join Clicks", color: "#9B8AFB" },
              { key: "confirmedJoins", label: "Members Left", color: "#34D399", comingSoon: true },
            ]}
          />
        </div>
      )}
    </section>
  );
}

function StatusTab({ servers, onInvite }: { servers: ServerDashboardListing[]; onInvite: (server: ServerDashboardListing) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = servers.find((server) => server.id === selectedId) ?? null;
  const verificationChecks = selected ? [
    { label: "At least 5,000 members", passed: selected.members >= 5000 },
    { label: "Listing is live", passed: selected.status === "Live" },
    { label: "Nexus safety review completed", passed: selected.safetyStatus === "SAFE" },
    { label: "Discord invite is active and current", passed: selected.inviteActive && !selected.inviteOutdated },
    { label: "Listing is at least 80% complete", passed: selected.listingCompleteness >= 80 },
  ] : [];
  const passedChecks = verificationChecks.filter((check) => check.passed).length;
  const eligible = verificationChecks.length > 0 && passedChecks === verificationChecks.length;

  return (
    <section className="space-y-5" aria-labelledby="server-status-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 id="server-status-heading" className="text-xl font-bold text-foreground">Server health &amp; status</h2><p className="mt-1 text-sm text-muted">Select a server for an in-depth listing, verification, and invite check.</p></div>
        <Select className="w-full sm:w-64" selectedKey={selectedId} onSelectionChange={(key) => setSelectedId(String(key))} placeholder="Select a server">
          <Label>Server</Label>
          <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
          <Select.Popover><ListBox>{servers.map((server) => <ListBox.Item key={server.id} id={server.id} textValue={server.name}><div className="flex items-center gap-2"><ServerAvatar server={server} className="size-8" /><span>{server.name}</span></div><ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
        </Select>
      </div>

      {!selected ? (
        <Card variant="secondary" className="items-center p-10 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><ShieldCheck className="size-6" /></span><h3 className="font-semibold text-foreground">Select a server to run a status check</h3><p className="max-w-md text-sm text-muted">Nexus will show its current visibility, review state, verification readiness, and invite health.</p></Card>
      ) : (
        <div className="space-y-5">
          <Card variant="default" className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><ServerAvatar server={selected} className="size-12" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-foreground">{selected.name}</h3><ListingStatusChip status={selected.safetyStatus} livePrefix /></div><p className="mt-1 text-sm text-muted">{LISTING_STATUS_CONFIG[selected.safetyStatus].description}</p></div></div><LinkButton href={selected.publicPath} target="_blank" size="sm" variant="secondary"><ExternalLink className="size-4" />View public page</LinkButton></div></Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatusCheck title="Listing" value={selected.status === "Live · Pending Review" ? "Live" : selected.status} detail="Public listing visibility" icon={Eye} tone={selected.status.startsWith("Live") ? "success" : "warning"} />
            <StatusCheck title="Nexus review" value={selected.safetyStatus === "SAFE" ? "Completed" : LISTING_STATUS_CONFIG[selected.safetyStatus].label} detail="Trust and safety review" icon={ShieldCheck} tone={selected.safetyStatus === "SAFE" ? "success" : "warning"} />
            <StatusCheck title="Verification" value={selected.verified ? "Verified by Nexus" : eligible ? "Eligible" : "Not eligible yet"} detail={`${passedChecks}/${verificationChecks.length} requirements met`} icon={VerifiedBadgeIcon} tone={selected.verified || eligible ? "success" : "default"} />
            <StatusCheck title="Invite link" value={!selected.inviteActive ? "Unavailable" : selected.inviteOutdated ? "Outdated" : "Up to date"} detail={`Checked ${selected.inviteLastChecked}`} icon={Link2} tone={!selected.inviteActive || selected.inviteOutdated ? "danger" : "success"} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card variant="default" className="gap-4 p-5"><Card.Header className="flex items-center justify-between gap-3"><div><Card.Title>Verification eligibility</Card.Title><Card.Description>Baseline requirements for a Nexus review.</Card.Description></div><Chip size="sm" variant="soft" color={selected.verified || eligible ? "success" : "default"}><Chip.Label>{selected.verified ? "Verified" : eligible ? "Eligible" : `${passedChecks}/${verificationChecks.length}`}</Chip.Label></Chip></Card.Header><Card.Content className="space-y-2">{verificationChecks.map((check) => <div key={check.label} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"><span className={`flex size-7 items-center justify-center rounded-lg ${check.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-default text-muted"}`}>{check.passed ? <CheckCircle2 className="size-4" /> : <CircleAlert className="size-4" />}</span><span className="text-sm text-foreground">{check.label}</span></div>)}</Card.Content></Card>

            <Card variant="default" className="gap-4 p-5"><Card.Header><Card.Title>Discord invite health</Card.Title><Card.Description>Nexus periodically checks whether visitors can still join.</Card.Description></Card.Header><Card.Content className="space-y-4"><div className={`rounded-2xl border p-4 ${selected.inviteActive && !selected.inviteOutdated ? "border-emerald-500/25 bg-emerald-500/5" : "border-red-500/25 bg-red-500/5"}`}><div className="flex items-start gap-3"><span className={`flex size-9 items-center justify-center rounded-xl ${selected.inviteActive && !selected.inviteOutdated ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{selected.inviteActive && !selected.inviteOutdated ? <CheckCircle2 className="size-5" /> : <CircleAlert className="size-5" />}</span><div><p className="text-sm font-semibold text-foreground">{selected.inviteActive && !selected.inviteOutdated ? "Invite is healthy" : selected.inviteActive ? "Invite needs to be refreshed" : "Invite is unavailable"}</p><p className="mt-1 text-xs leading-relaxed text-muted">Last checked {selected.inviteLastChecked}. {selected.inviteOutdated ? "Update it to prevent failed join attempts." : "No action is currently required."}</p></div></div></div><Button variant={selected.inviteOutdated || !selected.inviteActive ? "primary" : "secondary"} onPress={() => onInvite(selected)}><Clock3 className="size-4" />{selected.inviteOutdated || !selected.inviteActive ? "Update invite link" : "Replace invite link"}</Button></Card.Content></Card>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusCheck({ title, value, detail, icon: Icon, tone }: { title: string; value: string; detail: string; icon: ElementType<{ className?: string }>; tone: "success" | "warning" | "danger" | "default" }) {
  const toneClass = tone === "success" ? "bg-emerald-500/10 text-emerald-500" : tone === "warning" ? "bg-amber-500/10 text-amber-500" : tone === "danger" ? "bg-red-500/10 text-red-500" : "bg-default text-muted";
  return <Card variant="default" className="gap-3 p-4"><span className={`flex size-9 items-center justify-center rounded-xl ${toneClass}`}><Icon className="size-4" /></span><div><p className="text-xs font-medium text-muted">{title}</p><p className="mt-1 font-semibold text-foreground">{value}</p><p className="mt-1 text-xs text-muted">{detail}</p></div></Card>;
}

function EditSection({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="text-xs text-muted">{description}</p></div>
      {children}
    </section>
  );
}

function ServerAvatar({ server, className }: { server: ServerDashboardListing; className: string }) {
  const hue = Number(server.bannerHue);
  return <Avatar className={`shrink-0 rounded-xl ${className}`}><Avatar.Fallback className="rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg,hsl(${hue} 72% 58%),hsl(${hue + 28} 68% 46%))` }}>{initials(server.name)}</Avatar.Fallback></Avatar>;
}
