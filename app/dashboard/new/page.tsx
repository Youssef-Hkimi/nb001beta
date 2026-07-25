"use client";

import {
  Alert,
  Button,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Switch,
  TextField,
  Tooltip,
  toast,
} from "@heroui/react";
import {
  Bot,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Copy,
  ExternalLink,
  Eye,
  LayoutDashboard,
  Plus,
  Save,
  Send,
  Server,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { DashboardNav } from "@/components/dashboard/dashboard-sidebar";
import { PreviewPanel, type PreviewMode } from "@/components/dashboard/preview-panel";
import { ServerCardPreview } from "@/components/dashboard/server-card-preview";
import { ServerPagePreview } from "@/components/dashboard/server-page-preview";
import { TagMultiSelect } from "@/components/forms/tag-multi-select";
import { UploadBox } from "@/components/forms/upload-box";
import { UploadDropzone } from "@/components/forms/upload-dropzone";
import { ListingTypeModal } from "@/components/listing/listing-type-modal";
import { BotReviewModal } from "@/components/listing/bot-review-modal";
import { ListingStatusChip } from "@/components/listing/listing-safety";
import { LinkButton } from "@/components/ui/link-button";
import { CommunityFeatureSelect } from "@/components/forms/community-feature-select";
import { BotFeatureSelect } from "@/components/forms/bot-feature-select";
import { BannerColorPicker } from "@/components/forms/banner-color-picker";
import { RichDescriptionEditor } from "@/components/forms/rich-description-editor";
import {
  ServerSetupModal,
  type ServerSetupMode,
} from "@/components/listing/server-setup-modal";
import {
  ServerWidgetVerificationModal,
  type ServerWidgetVerificationState,
} from "@/components/listing/server-widget-verification-modal";
import {
  BOT_CATEGORIES,
  BOT_LISTING_TAGS,
  EXPLORE_CATEGORIES,
  LANGUAGES,
  SERVER_LISTING_TAGS,
} from "@/lib/data/categories";
import { DEFAULT_COMMUNITY_FEATURE_IDS } from "@/lib/data/community-features";
import { DEFAULT_BOT_FEATURE_IDS } from "@/lib/data/bot-features";
import { getBotAvatarUrl, getBotBannerUrl, getBotGalleryImageUrl } from "@/lib/bot-visuals";
import { bannerColorFromHue, extractMatchingBannerColor } from "@/lib/image-color";
import {
  addWidgetSetupReminder,
  removeWidgetSetupReminder,
} from "@/lib/widget-setup-reminders";
import { useAuth } from "@/lib/auth/auth-context";
import type { BotCommand, DiscordServer, ListingType } from "@/lib/types";

const REGIONS = ["Global", "North America", "Europe", "Asia", "South America", "Oceania"] as const;
const ACTIVITY_LEVELS = ["Very Active", "Active", "Calm"] as const;
const VISIBILITY = ["Public", "Unlisted", "Private"] as const;

type ServerForm = {
  guildId: string;
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
  monthlyGrowth: string;
  joinClicks: string;
  createdAt: string;
  activity: string;
  visibility: string;
  featured: boolean;
  verified: boolean;
  iconPreview: string | null;
  bannerPreview: string | null;
  bannerHue: string;
  bannerColor: string;
  communityFeatures: string[];
};

type BotForm = {
  name: string;
  clientId: string;
  prefix: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  tags: string[];
  inviteUrl: string;
  supportUrl: string;
  websiteUrl: string;
  githubUrl: string;
  commands: BotCommand[];
  botFeatures: string[];
  premium: boolean;
  verified: boolean;
  servers: string;
  votes: string;
  monthlyGrowth: string;
  createdAt: string;
  developerName: string;
  avatarPreview: string | null;
  bannerPreview: string | null;
  galleryImages: string[];
  statusLabel: string;
  bannerHue: string;
  bannerColor: string;
};

type ServerField = "name" | "guildId" | "inviteUrl";
type BotField =
  | "name"
  | "clientId"
  | "prefix"
  | "shortDescription"
  | "fullDescription"
  | "tags"
  | "inviteUrl"
  | "commands"
  | "avatar";

type CreatedListing = {
  id: string;
  slug: string;
  name: string;
};

const emptyServer = (): ServerForm => ({
  guildId: "",
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
  likes: "0",
  monthlyGrowth: "0",
  joinClicks: "0",
  createdAt: "2024",
  activity: "Active",
  visibility: "Public",
  featured: false,
  verified: false,
  iconPreview: null,
  bannerPreview: null,
  bannerHue: "220",
  bannerColor: "#325578",
  communityFeatures: [],
});

const sampleServer = (): ServerForm => ({
  guildId: "",
  name: "Nexbiy Hub",
  shortDescription: "Official community for creators and server owners.",
  fullDescription:
    "Join thousands of Discord creators building better communities with Nexbiy tools, events, and support.",
  category: "Social",
  tags: ["Community", "Support", "Events"],
  language: "English",
  region: "Global",
  inviteUrl: "https://discord.gg/nexbiy",
  members: "128400",
  online: "18420",
  likes: "8900",
  monthlyGrowth: "14",
  joinClicks: "15400",
  createdAt: "March 2021",
  activity: "Very Active",
  visibility: "Public",
  featured: false,
  verified: false,
  iconPreview: null,
  bannerPreview: null,
  bannerHue: "220",
  bannerColor: "#325578",
  communityFeatures: [...DEFAULT_COMMUNITY_FEATURE_IDS],
});

const sampleBot = (): BotForm => ({
  name: "Helper AI",
  clientId: "123456789012345678",
  prefix: "/",
  shortDescription: "Context-aware answers and FAQ automation.",
  fullDescription:
    "## Features\n- Auto FAQ replies\n- Ticket assist\n- Multi-language support\n\nUse `/setup` after inviting the bot.",
  category: "AI",
  tags: ["AI", "Support", "FAQ"],
  inviteUrl: "https://discord.com/oauth2/authorize?client_id=helper",
  supportUrl: "https://discord.gg/nexbiy",
  websiteUrl: "https://nexbiy.example/helper",
  githubUrl: "https://github.com/nexbiy/helper-ai",
  commands: [
    { id: "c1", name: "/ban", description: "Ban a user from the server" },
    { id: "c2", name: "/setup", description: "Configure the bot for your server" },
  ],
  botFeatures: [...DEFAULT_BOT_FEATURE_IDS, "ai-tools"],
  premium: false,
  verified: false,
  servers: "890000",
  votes: "39200",
  monthlyGrowth: "21",
  createdAt: "October 2022",
  developerName: "Nexbiy Labs",
  avatarPreview: getBotAvatarUrl("Helper AI", "185"),
  bannerPreview: getBotBannerUrl("helper-ai", "185"),
  galleryImages: Array.from({ length: 4 }, (_, index) => getBotGalleryImageUrl("Helper AI", index, "185")),
  statusLabel: "",
  bannerHue: "185",
  bannerColor: "#256b73",
});

const emptyBot = (): BotForm => ({
  ...sampleBot(),
  name: "",
  clientId: "",
  shortDescription: "",
  fullDescription: "",
  tags: [],
  inviteUrl: "",
  supportUrl: "",
  websiteUrl: "",
  githubUrl: "",
  commands: [
    {id: crypto.randomUUID(), name: "", description: ""},
    {id: crypto.randomUUID(), name: "", description: ""},
  ],
  avatarPreview: null,
  bannerPreview: null,
  galleryImages: [],
});

function num(value: string, fallback = 0) {
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `listing-${Date.now()}`
  );
}

function fromDiscordServer(ds: DiscordServer): ServerForm {
  return {
    ...emptyServer(),
    guildId: ds.id,
    name: ds.name,
    shortDescription: ds.shortDescription,
    fullDescription: ds.fullDescription,
    category: ds.category,
    tags: ds.tags.slice(0, 3),
    language: ds.language,
    region: ds.region,
    inviteUrl: ds.inviteUrl,
    members: String(ds.members),
    online: String(ds.online),
    createdAt: ds.createdAt,
    activity: "Very Active",
    iconPreview: ds.iconUrl ?? null,
    bannerHue: ds.bannerHue,
    bannerColor: bannerColorFromHue(ds.bannerHue),
    communityFeatures: [...DEFAULT_COMMUNITY_FEATURE_IDS],
  };
}

export default function NewListingPage() {
  const router = useRouter();
  const { discordServers } = useAuth();
  const [tab, setTab] = useState<"server" | "bot">("server");
  const [server, setServer] = useState(emptyServer);
  const [bot, setBot] = useState(emptyBot);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("listing");
  const [modalOpen, setModalOpen] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<"bot" | null>(null);
  const [publishedServerPath, setPublishedServerPath] = useState<string | null>(null);
  const [publishedBotPath, setPublishedBotPath] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [serverMediaFiles, setServerMediaFiles] = useState<{
    icon: File | null;
    banner: File | null;
  }>({icon: null, banner: null});
  const [botMediaFiles, setBotMediaFiles] = useState<{
    icon: File | null;
    banner: File | null;
  }>({icon: null, banner: null});

  const [typeModalOpen, setTypeModalOpen] = useState(true);
  const [pendingType, setPendingType] = useState<ListingType | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupMode, setSetupMode] = useState<ServerSetupMode | null>(null);
  const [selectedDiscordId, setSelectedDiscordId] = useState<string | null>(null);
  const [flowReady, setFlowReady] = useState(false);
  const [serverVerificationState, setServerVerificationState] = useState<ServerWidgetVerificationState>(null);
  const [serverVerificationError, setServerVerificationError] = useState("");
  const serverVerificationInFlight = useRef(false);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [serverColorMatched, setServerColorMatched] = useState(false);
  const [botColorMatched, setBotColorMatched] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<Partial<Record<ServerField, string>>>({});
  const [botFieldErrors, setBotFieldErrors] = useState<Partial<Record<BotField, string>>>({});

  const listingPreview = useMemo(
    () => ({
      name: server.name,
      shortDescription: server.shortDescription,
      category: server.category,
      tags: server.tags,
      members: num(server.members),
      online: num(server.online),
      verified: server.verified,
      bannerPreview: server.bannerPreview,
      iconPreview: server.iconPreview,
      bannerHue: server.bannerHue,
      bannerColor: server.bannerColor,
    }),
    [server],
  );

  const pagePreview = useMemo(
    () => ({
      ...listingPreview,
      fullDescription: server.fullDescription,
      language: server.language,
      region: server.region,
      likes: num(server.likes),
      monthlyGrowth: num(server.monthlyGrowth, 10),
      joinClicks: num(server.joinClicks),
      createdAt: server.createdAt,
      communityFeatures: server.communityFeatures,
    }),
    [listingPreview, server],
  );

  const botListingPreview = useMemo(
    () => ({
      name: bot.name,
      shortDescription: bot.shortDescription,
      category: bot.category,
      tags: bot.tags,
      servers: num(bot.servers),
      votes: num(bot.votes),
      verified: bot.verified,
      botFeatures: bot.botFeatures,
      avatarPreview: bot.avatarPreview,
      bannerPreview: bot.bannerPreview,
      bannerHue: bot.bannerHue,
      bannerColor: bot.bannerColor,
    }),
    [bot],
  );

  const botPagePreview = useMemo(
    () => ({
      name: bot.name,
      shortDescription: bot.shortDescription,
      fullDescription: bot.fullDescription,
      category: bot.category,
      tags: bot.tags,
      clientId: bot.clientId,
      prefix: bot.prefix,
      inviteUrl: bot.inviteUrl,
      supportUrl: bot.supportUrl,
      websiteUrl: bot.websiteUrl,
      githubUrl: bot.githubUrl,
      commands: bot.commands,
      botFeatures: bot.botFeatures,
      verified: bot.verified,
      servers: num(bot.servers),
      votes: num(bot.votes),
      monthlyGrowth: num(bot.monthlyGrowth),
      createdAt: bot.createdAt,
      developerName: bot.developerName,
      avatarPreview: bot.avatarPreview,
      bannerPreview: bot.bannerPreview,
      galleryImages: bot.galleryImages,
      bannerHue: bot.bannerHue,
      bannerColor: bot.bannerColor,
      statusLabel: bot.statusLabel || undefined,
    }),
    [bot],
  );

  function handleTypeContinue() {
    if (!pendingType) return;
    setTab(pendingType);
    setTypeModalOpen(false);
    if (pendingType === "server") {
      setServerFieldErrors({});
      setSetupMode(null);
      setSelectedDiscordId(null);
      setSetupModalOpen(true);
    } else {
      setBotFieldErrors({});
      setCommandError(null);
      setBot(emptyBot());
      setFlowReady(true);
    }
  }

  function handleSetupContinue() {
    if (setupMode === "manual") {
      setServerFieldErrors({});
      setServer(emptyServer());
      setSetupModalOpen(false);
      setFlowReady(true);
      toast.success("Manual server setup ready");
      return;
    }
    if (setupMode === "import" && selectedDiscordId) {
      setSetupModalOpen(false);
      setFlowReady(true);
      toast.success("Server details imported from Discord");
    }
  }

  function validCommands(commands: BotCommand[]) {
    return commands.filter((c) => c.name.trim() && c.description.trim());
  }

  async function uploadListingMedia(
    listingId: string,
    entries: Array<{kind: "icon" | "banner" | "gallery"; file: File; position?: number}>,
  ) {
    for (const entry of entries) {
      const form = new FormData();
      form.set("kind", entry.kind);
      form.set("file", entry.file);
      if (entry.position !== undefined) form.set("position", String(entry.position));
      const response = await fetch(`/api/listings/${listingId}/media`, {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as {error?: string} | null;
        throw new Error(result?.error || "media_upload_failed");
      }
    }
  }

  async function createListing(payload: Record<string, unknown>) {
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null) as {
      error?: string;
      fields?: Record<string, string[]>;
      listing?: CreatedListing;
    } | null;
    if (!response.ok || !result?.listing) {
      const fieldMessage = result?.fields
        ? Object.values(result.fields).flat().find(Boolean)
        : null;
      throw new Error(fieldMessage || result?.error || "listing_publish_failed");
    }
    return result.listing;
  }

  async function saveDraft(type: "server" | "bot") {
    const payload = type === "server"
      ? {...server, iconPreview: null, bannerPreview: null}
      : {...bot, avatarPreview: null, bannerPreview: null, galleryImages: []};
    const response = await fetch("/api/listings/drafts", {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({type, payload}),
    });
    if (!response.ok) {
      toast.danger("Draft could not be saved", {description: "Please try again."});
      return;
    }
    toast.success("Draft saved securely");
  }

  function focusListingField(field: ServerField | BotField, kind: "server" | "bot") {
    requestAnimationFrame(() => {
      const fieldElement = document.querySelector<HTMLElement>(
        `[data-listing-field="${kind}-${field}"]`,
      );
      fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => {
        fieldElement
          ?.querySelector<HTMLElement>("input, textarea, button, [tabindex]:not([tabindex='-1'])")
          ?.focus({ preventScroll: true });
      }, 350);
    });
  }

  function clearServerFieldError(field: ServerField) {
    setServerFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function clearBotFieldError(field: BotField) {
    setBotFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function tryPublishBot() {
    const good = validCommands(bot.commands);
    const errors: Partial<Record<BotField, string>> = {};
    if (!bot.name.trim()) errors.name = "Bot name is required.";
    if (!bot.clientId.trim()) errors.clientId = "Bot client ID is required.";
    if (!bot.prefix.trim()) errors.prefix = "Bot prefix is required.";
    if (!bot.shortDescription.trim()) errors.shortDescription = "Short description is required.";
    if (!bot.fullDescription.trim()) errors.fullDescription = "Long description is required.";
    if (!bot.tags.length) errors.tags = "Choose at least one tag.";
    if (!bot.inviteUrl.trim()) errors.inviteUrl = "Bot invite URL is required.";
    if (good.length < 2) errors.commands = "Add at least 2 complete commands.";
    if (!bot.avatarPreview) errors.avatar = "Bot avatar is required.";

    const firstInvalid = (Object.keys(errors) as BotField[])[0];
    if (firstInvalid) {
      setBotFieldErrors(errors);
      setCommandError(errors.commands || null);
      focusListingField(firstInvalid, "bot");
      toast.danger("Missing required fields", {
        description: "The first missing field has been highlighted.",
      });
      return;
    }
    setBotFieldErrors({});
    setCommandError(null);
    setReviewOpen(true);
  }

  async function finalizeBotPublish() {
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      const listing = await createListing({
        type: "bot",
        discordId: bot.clientId.trim(),
        name: bot.name.trim(),
        shortDescription: bot.shortDescription.trim(),
        longDescription: bot.fullDescription.trim(),
        category: bot.category,
        tags: bot.tags,
        featureIds: bot.botFeatures,
        inviteUrl: bot.inviteUrl.trim(),
        supportUrl: bot.supportUrl.trim(),
        websiteUrl: bot.websiteUrl.trim(),
        githubUrl: bot.githubUrl.trim(),
        botPrefix: bot.prefix.trim(),
        botCommands: validCommands(bot.commands).map(({name, description}) => ({name, description})),
        premium: bot.premium,
        bannerColor: bot.bannerColor,
      });
      const media = [
        ...(botMediaFiles.icon ? [{kind: "icon" as const, file: botMediaFiles.icon}] : []),
        ...(botMediaFiles.banner ? [{kind: "banner" as const, file: botMediaFiles.banner}] : []),
      ];
      if (media.length) await uploadListingMedia(listing.id, media);
      setBot((current) => ({...current, statusLabel: "Pending Review"}));
      setPublishedBotPath(`/dashboard/preview/${listing.id}`);
      setReviewOpen(false);
      setPublishSuccess("bot");
      toast.success("Bot submitted for review");
    } catch (error) {
      toast.danger("Bot could not be published", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsPublishing(false);
    }
  }

  async function publishServer() {
    if (serverVerificationInFlight.current) return;

    const errors: Partial<Record<ServerField, string>> = {};
    if (!server.name.trim()) errors.name = "Server name is required.";
    if (!server.guildId.trim()) {
      errors.guildId = "Discord Server ID is required.";
    } else if (!/^\d{17,20}$/.test(server.guildId.trim())) {
      errors.guildId = "Discord Server IDs contain 17–20 digits.";
    }
    if (!server.inviteUrl.trim()) errors.inviteUrl = "Discord invite URL is required.";

    const firstInvalid = (Object.keys(errors) as ServerField[])[0];
    if (firstInvalid) {
      setServerFieldErrors(errors);
      focusListingField(firstInvalid, "server");
      toast.danger("Missing required fields", {
        description: "The first missing or invalid field has been highlighted.",
      });
      return;
    }
    setServerFieldErrors({});

    setServerVerificationState("verifying");
    setServerVerificationError("");
    serverVerificationInFlight.current = true;

    try {
      const response = await fetch("/api/discord/server-widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: server.guildId.trim(),
          forceRefresh: true,
        }),
      });
      const result: unknown = await response.json();
      const error =
        typeof result === "object" && result !== null && "error" in result
          ? String(result.error)
          : "";

      if (error === "widget_disabled") {
        setServerVerificationState("widget_disabled");
        return;
      }

      if (!response.ok) {
        setServerVerificationError(
          error === "guild_not_found"
            ? "Discord could not find that server. Check the Server ID and try again."
            : error === "widget_no_channel"
              ? "Your widget is enabled, but no invite channel is selected. Open Server Settings → Widget, choose a public channel, save, then try again."
            : "Discord could not verify this server right now. Please try again.",
        );
        setServerVerificationState("error");
        return;
      }

      const guild =
        typeof result === "object" && result !== null && "guild" in result
          ? result.guild as { name?: unknown; presenceCount?: unknown }
          : null;
      if (typeof guild?.name !== "string" || typeof guild.presenceCount !== "number") {
        throw new Error("Invalid verification response");
      }

      const verifiedName = guild.name;
      setServer((current) => ({
        ...current,
        name: verifiedName,
        online: String(guild.presenceCount),
      }));
      const listing = await createListing({
        type: "server",
        discordId: server.guildId.trim(),
        name: verifiedName,
        shortDescription: server.shortDescription.trim(),
        longDescription: server.fullDescription.trim(),
        category: server.category,
        tags: server.tags,
        featureIds: server.communityFeatures,
        language: server.language,
        region: server.region,
        inviteUrl: server.inviteUrl.trim(),
        bannerColor: server.bannerColor,
        skipWidgetVerification: false,
      });
      const media = [
        ...(serverMediaFiles.icon ? [{kind: "icon" as const, file: serverMediaFiles.icon}] : []),
        ...(serverMediaFiles.banner ? [{kind: "banner" as const, file: serverMediaFiles.banner}] : []),
      ];
      if (media.length) await uploadListingMedia(listing.id, media);
      setPublishedServerPath(`/dashboard/preview/${listing.id}`);
      removeWidgetSetupReminder(server.guildId.trim());
      setServerVerificationState("success");
      toast.success("Server submitted for review");
    } catch (error) {
      setServerVerificationError(
        error instanceof Error ? error.message : "Nexbiy could not reach Discord. Please try again.",
      );
      setServerVerificationState("error");
    } finally {
      serverVerificationInFlight.current = false;
    }
  }

  async function publishServerWithoutWidget() {
    if (serverVerificationInFlight.current) return;
    serverVerificationInFlight.current = true;
    const guildId = server.guildId.trim();
    const importedServer = discordServers.find((item) => item.id === guildId);
    const memberCount = num(server.members, importedServer?.members ?? 0);
    const serverName = server.name.trim() || importedServer?.name || "Untitled Server";
    try {
      const listing = await createListing({
        type: "server",
        discordId: guildId,
        name: serverName,
        shortDescription: server.shortDescription.trim(),
        longDescription: server.fullDescription.trim(),
        category: server.category,
        tags: server.tags,
        featureIds: server.communityFeatures,
        language: server.language,
        region: server.region,
        inviteUrl: server.inviteUrl.trim(),
        bannerColor: server.bannerColor,
        skipWidgetVerification: true,
      });
      const media = [
        ...(serverMediaFiles.icon ? [{kind: "icon" as const, file: serverMediaFiles.icon}] : []),
        ...(serverMediaFiles.banner ? [{kind: "banner" as const, file: serverMediaFiles.banner}] : []),
      ];
      if (media.length) await uploadListingMedia(listing.id, media);
      setServer((current) => ({
        ...current,
        name: listing.name,
        members: String(memberCount),
        online: String(memberCount),
      }));
      setPublishedServerPath(`/dashboard/preview/${listing.id}`);
      addWidgetSetupReminder({guildId, serverName: listing.name, memberCount, createdAt: Date.now()});
      setServerVerificationState("success_unverified");
      toast.success("Server submitted with widget setup pending");
    } catch (error) {
      setServerVerificationError(error instanceof Error ? error.message : "Please try again.");
      setServerVerificationState("error");
    } finally {
      serverVerificationInFlight.current = false;
    }
  }

  function updateCommand(id: string, patch: Partial<BotCommand>) {
    setBot((b) => ({
      ...b,
      commands: b.commands.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    clearBotFieldError("commands");
    setCommandError(null);
  }

  async function handleServerIcon(file: File, iconPreview: string) {
    setServerMediaFiles((current) => ({...current, icon: file}));
    setServer((current) => ({ ...current, iconPreview }));
    try {
      const bannerColor = await extractMatchingBannerColor(file);
      setServer((current) => ({ ...current, bannerColor }));
      setServerColorMatched(true);
    } catch {
      setServerColorMatched(false);
    }
  }

  async function handleBotAvatar(file: File, avatarPreview: string) {
    setBotMediaFiles((current) => ({...current, icon: file}));
    setBot((current) => ({ ...current, avatarPreview }));
    try {
      const bannerColor = await extractMatchingBannerColor(file);
      setBot((current) => ({ ...current, bannerColor }));
      setBotColorMatched(true);
    } catch {
      setBotColorMatched(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="lg:hidden">
        <DashboardNav />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Listing</h1>
          <p className="mt-1 text-muted">
            Build your listing and preview how it appears in the marketplace and public page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onPress={() => {
              setPendingType(null);
              setTypeModalOpen(true);
            }}
          >
            Change type
          </Button>
          {tab === "server" ? (
            <Button variant="secondary" onPress={() => setModalOpen(true)}>
              <Eye className="size-4" />
              Expand Preview
            </Button>
          ) : null}
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Listing type"
        className="flex w-full max-w-md gap-1 rounded-2xl border border-border bg-default/60 p-1"
      >
        <Button
          className="flex-1"
          variant={tab === "server" ? "primary" : "ghost"}
          onPress={() => {
            setTab("server");
            setPendingType("server");
            setSetupModalOpen(true);
            setFlowReady(false);
          }}
        >
          <Server className="size-4" />
          Server Listing
        </Button>
        <Button
          className="flex-1"
          variant={tab === "bot" ? "primary" : "ghost"}
          onPress={() => {
            setTab("bot");
            setFlowReady(true);
          }}
        >
          <Bot className="size-4" />
          Bot Listing
        </Button>
      </div>

      {!flowReady ? (
        <div className="nexus-card rounded-2xl p-8 text-center text-sm text-muted">
          Choose a listing type to continue. Use the dialogs to pick Server or Bot, then complete
          setup.
        </div>
      ) : tab === "server" ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
          <form
            className="nexus-card space-y-6 rounded-2xl p-5 md:p-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <Alert status="accent" className="rounded-2xl">
              <Alert.Indicator>
                <Shield className="size-4" />
              </Alert.Indicator>
              <Alert.Content>
                <Alert.Title>Community safety</Alert.Title>
                <Alert.Description>
                  Servers listed on Nexbiy should be safe, public-facing communities that follow
                  Discord’s Terms of Service and avoid harmful or misleading content.
                </Alert.Description>
              </Alert.Content>
            </Alert>

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Basic info</h2>
                <p className="text-xs text-muted">Core details shown across Nexbiy</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  data-listing-field="server-name"
                  isRequired
                  isInvalid={Boolean(serverFieldErrors.name)}
                  value={server.name}
                  onChange={(v) => {
                    setServer((s) => ({ ...s, name: v }));
                    clearServerFieldError("name");
                  }}
                >
                  <Label>Server name</Label>
                  <Input placeholder="My awesome server" />
                  {serverFieldErrors.name ? <FieldError>{serverFieldErrors.name}</FieldError> : null}
                </TextField>

                <Select
                  selectedKey={server.category}
                  onSelectionChange={(key) =>
                    setServer((s) => ({ ...s, category: String(key) }))
                  }
                >
                  <Label>Category</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {EXPLORE_CATEGORIES.map((c) => (
                        <ListBox.Item key={c} id={c} textValue={c}>
                          {c}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                  data-listing-field="server-guildId"
                  isRequired
                  isInvalid={Boolean(serverFieldErrors.guildId)}
                  value={server.guildId}
                  onChange={(value) => {
                    setServer((current) => ({
                      ...current,
                      guildId: value.replace(/\D/g, ""),
                    }));
                    clearServerFieldError("guildId");
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <Label>
                      Discord Server ID <span className="text-danger" aria-hidden="true">*</span>
                    </Label>
                    <Tooltip>
                      <Tooltip.Trigger
                        aria-label="Why Nexbiy requires a Discord Server ID"
                        className="rounded-full text-muted outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <CircleHelp className="size-4" />
                      </Tooltip.Trigger>
                      <Tooltip.Content className="max-w-xs">
                        Nexbiy uses the Server ID to verify the public Discord widget and sync the official server name and live online count when you publish.
                      </Tooltip.Content>
                    </Tooltip>
                  </div>
                  <Input inputMode="numeric" pattern="[0-9]*" placeholder="123456789012345678" />
                  <Description>Required for Discord widget verification.</Description>
                  {serverFieldErrors.guildId ? <FieldError>{serverFieldErrors.guildId}</FieldError> : null}
                </TextField>

                <TextField
                  data-listing-field="server-inviteUrl"
                  isRequired
                  isInvalid={Boolean(serverFieldErrors.inviteUrl)}
                  value={server.inviteUrl}
                  onChange={(v) => {
                    setServer((s) => ({ ...s, inviteUrl: v }));
                    clearServerFieldError("inviteUrl");
                  }}
                >
                  <Label>Discord invite URL</Label>
                  <Input placeholder="https://discord.gg/..." />
                  {serverFieldErrors.inviteUrl ? <FieldError>{serverFieldErrors.inviteUrl}</FieldError> : null}
                </TextField>
              </div>

              <TextField
                value={server.shortDescription}
                onChange={(v) => setServer((s) => ({ ...s, shortDescription: v }))}
              >
                <Label>Short description</Label>
                <Input placeholder="One-line pitch for the listing card" />
              </TextField>

              <div className="space-y-2">
                <div><p className="text-sm font-medium text-foreground">Full description</p><p className="text-xs text-muted">Format the public About section and preview it live.</p></div>
                <RichDescriptionEditor
                  value={server.fullDescription}
                  onChange={(fullDescription) => setServer((current) => ({ ...current, fullDescription }))}
                  placeholder="Describe your community, events, and what makes it special."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TagMultiSelect
                  value={server.tags}
                  options={SERVER_LISTING_TAGS}
                  onChange={(tags) => setServer((s) => ({ ...s, tags }))}
                  placeholder="Select up to 3 tags"
                />

                <Select
                  selectedKey={server.language}
                  onSelectionChange={(key) =>
                    setServer((s) => ({ ...s, language: String(key) }))
                  }
                >
                  <Label>Language</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {LANGUAGES.filter((l) => l !== "All").map((l) => (
                        <ListBox.Item key={l} id={l} textValue={l}>
                          {l}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <Select
                selectedKey={server.region}
                onSelectionChange={(key) => setServer((s) => ({ ...s, region: String(key) }))}
              >
                <Label>Region</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {REGIONS.map((r) => (
                      <ListBox.Item key={r} id={r} textValue={r}>
                        {r}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </section>

            <CommunityFeatureSelect
              value={server.communityFeatures}
              onChange={(communityFeatures) =>
                setServer((current) => ({ ...current, communityFeatures }))
              }
            />

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Listing preferences</h2>
                <p className="text-xs text-muted">Member counts and server statistics are synced automatically from Discord.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  selectedKey={server.activity}
                  onSelectionChange={(key) =>
                    setServer((s) => ({ ...s, activity: String(key) }))
                  }
                >
                  <Label>Activity</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {ACTIVITY_LEVELS.map((a) => (
                        <ListBox.Item key={a} id={a} textValue={a}>
                          {a}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Select
                  selectedKey={server.visibility}
                  onSelectionChange={(key) =>
                    setServer((s) => ({ ...s, visibility: String(key) }))
                  }
                >
                  <Label>Visibility</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {VISIBILITY.map((v) => (
                        <ListBox.Item key={v} id={v} textValue={v}>
                          {v}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Server media</h2>
                <p className="text-xs text-muted">
                  Servers support icon and banner only — no gallery images.
                </p>
              </div>
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                <UploadBox
                  title="Server icon"
                  hint="Drag & drop or click"
                  sizeHint="Recommended 512×512"
                  variant="icon"
                  previewUrl={server.iconPreview}
                  onFile={handleServerIcon}
                  onClear={() => {
                    setServer((current) => ({ ...current, iconPreview: null }));
                    setServerMediaFiles((current) => ({...current, icon: null}));
                    setServerColorMatched(false);
                  }}
                />
                <UploadBox
                  title="Server banner (optional)"
                  hint="Drag & drop or click"
                  sizeHint="Recommended 960×320"
                  variant="banner"
                  previewUrl={server.bannerPreview}
                  onFile={(file, bannerPreview) => {
                    setServer((current) => ({ ...current, bannerPreview }));
                    setServerMediaFiles((current) => ({...current, banner: file}));
                  }}
                  onClear={() => {
                    setServer((current) => ({ ...current, bannerPreview: null }));
                    setServerMediaFiles((current) => ({...current, banner: null}));
                  }}
                />
              </div>
              <BannerColorPicker
                value={server.bannerColor}
                matchedFromIcon={serverColorMatched}
                onChange={(bannerColor) => {
                  setServer((current) => ({ ...current, bannerColor }));
                  setServerColorMatched(false);
                }}
              />
            </section>

            <Alert status="warning" className="rounded-2xl">
              <Alert.Indicator><Clock3 className="size-4" /></Alert.Indicator>
              <Alert.Content><Alert.Description>New server listings are submitted for review. Their public pages appear after Nexbiy approves them for safety and platform compliance.</Alert.Description></Alert.Content>
            </Alert>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="secondary"
                onPress={() => {
                  void saveDraft("server");
                }}
              >
                <Save className="size-4" />
                Save Draft
              </Button>
              <Button isDisabled={isPublishing || serverVerificationState === "verifying"} onPress={publishServer}>
                <Send className="size-4" />
                Publish Server
              </Button>
            </div>
          </form>

          <PreviewPanel
            kind="server"
            mode={previewMode}
            onModeChange={setPreviewMode}
            listing={listingPreview}
            page={pagePreview}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
          <form
            className="nexus-card space-y-5 rounded-2xl p-5 md:p-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <Alert status="warning" className="rounded-2xl">
              <Alert.Indicator>
                <Shield className="size-4" />
              </Alert.Indicator>
              <Alert.Content>
                <Alert.Title>Bot listing rules</Alert.Title>
                <Alert.Description>
                  Bots listed on Nexbiy must follow Discord’s Terms of Service, avoid malicious
                  behavior, avoid spam, and provide clear functionality for users.
                </Alert.Description>
              </Alert.Content>
            </Alert>

            {bot.statusLabel ? (
              <ListingStatusChip status="PENDING_REVIEW" livePrefix />
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                data-listing-field="bot-name"
                isRequired
                isInvalid={Boolean(botFieldErrors.name)}
                value={bot.name}
                onChange={(v) => {
                  setBot((s) => ({ ...s, name: v }));
                  clearBotFieldError("name");
                }}
              >
                <Label>Bot name</Label>
                <Input placeholder="My utility bot" />
                {botFieldErrors.name ? <FieldError>{botFieldErrors.name}</FieldError> : null}
              </TextField>

              <TextField
                data-listing-field="bot-clientId"
                isRequired
                isInvalid={Boolean(botFieldErrors.clientId)}
                value={bot.clientId}
                onChange={(v) => {
                  setBot((s) => ({ ...s, clientId: v }));
                  clearBotFieldError("clientId");
                }}
              >
                <Label>Bot client ID</Label>
                <Input placeholder="From Discord Developer Portal" />
                <Description>Found in the Discord Developer Portal application page.</Description>
                {botFieldErrors.clientId ? <FieldError>{botFieldErrors.clientId}</FieldError> : null}
              </TextField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                data-listing-field="bot-prefix"
                isRequired
                isInvalid={Boolean(botFieldErrors.prefix)}
                value={bot.prefix}
                onChange={(v) => {
                  setBot((s) => ({ ...s, prefix: v }));
                  clearBotFieldError("prefix");
                }}
              >
                <Label>Bot prefix</Label>
                <Input placeholder="/" />
                {botFieldErrors.prefix ? <FieldError>{botFieldErrors.prefix}</FieldError> : null}
              </TextField>

              <Select
                selectedKey={bot.category}
                onSelectionChange={(key) => setBot((s) => ({ ...s, category: String(key) }))}
              >
                <Label>Category</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {BOT_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <ListBox.Item key={c} id={c} textValue={c}>
                        {c}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <TextField
              data-listing-field="bot-shortDescription"
              isRequired
              isInvalid={Boolean(botFieldErrors.shortDescription)}
              value={bot.shortDescription}
              onChange={(v) => {
                setBot((s) => ({ ...s, shortDescription: v }));
                clearBotFieldError("shortDescription");
              }}
            >
              <Label>Short description</Label>
              <Input placeholder="One-line pitch" />
              {botFieldErrors.shortDescription ? <FieldError>{botFieldErrors.shortDescription}</FieldError> : null}
            </TextField>

            <div
              data-listing-field="bot-fullDescription"
              className={botFieldErrors.fullDescription ? "space-y-2 rounded-xl ring-2 ring-danger/70 ring-offset-2 ring-offset-background" : "space-y-2"}
            >
              <div><p className="text-sm font-medium text-foreground">Long description</p><p className="text-xs text-muted">Format features, setup instructions, and command examples with a live preview.</p></div>
              <RichDescriptionEditor
                value={bot.fullDescription}
                onChange={(fullDescription) => {
                  setBot((current) => ({ ...current, fullDescription }));
                  clearBotFieldError("fullDescription");
                }}
                placeholder="Describe features, setup instructions, and command examples."
              />
              {botFieldErrors.fullDescription ? <p className="text-sm text-danger">{botFieldErrors.fullDescription}</p> : null}
            </div>

            <div
              data-listing-field="bot-tags"
              className={botFieldErrors.tags ? "rounded-xl ring-2 ring-danger/70 ring-offset-2 ring-offset-background" : undefined}
            >
              <TagMultiSelect
                value={bot.tags}
                options={BOT_LISTING_TAGS}
                onChange={(tags) => {
                  setBot((s) => ({ ...s, tags }));
                  clearBotFieldError("tags");
                }}
                placeholder="Select up to 3 tags"
              />
              {botFieldErrors.tags ? <p className="mt-1 text-sm text-danger">{botFieldErrors.tags}</p> : null}
            </div>

            <BotFeatureSelect
              value={bot.botFeatures}
              onChange={(botFeatures) => setBot((current) => ({ ...current, botFeatures }))}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                data-listing-field="bot-inviteUrl"
                isRequired
                isInvalid={Boolean(botFieldErrors.inviteUrl)}
                value={bot.inviteUrl}
                onChange={(v) => {
                  setBot((s) => ({ ...s, inviteUrl: v }));
                  clearBotFieldError("inviteUrl");
                }}
              >
                <Label>Bot invite URL</Label>
                <Input placeholder="https://discord.com/oauth2/..." />
                {botFieldErrors.inviteUrl ? <FieldError>{botFieldErrors.inviteUrl}</FieldError> : null}
              </TextField>
              <TextField
                value={bot.supportUrl}
                onChange={(v) => setBot((s) => ({ ...s, supportUrl: v }))}
              >
                <Label>Support server URL (Optional)</Label>
                <Input placeholder="https://discord.gg/..." />
              </TextField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                value={bot.websiteUrl}
                onChange={(v) => setBot((s) => ({ ...s, websiteUrl: v }))}
              >
                <Label>Website URL (Optional)</Label>
                <Input placeholder="https://" />
              </TextField>
              <TextField
                value={bot.githubUrl}
                onChange={(v) => setBot((s) => ({ ...s, githubUrl: v }))}
              >
                <Label>GitHub repository (Optional)</Label>
                <Input placeholder="https://github.com/..." />
              </TextField>
            </div>

            <section
              data-listing-field="bot-commands"
              className={botFieldErrors.commands ? "space-y-3 rounded-xl ring-2 ring-danger/70 ring-offset-2 ring-offset-background" : "space-y-3"}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Bot commands</h2>
                  <p className="text-xs text-muted">At least 2 commands are required to publish</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() =>
                    setBot((b) => ({
                      ...b,
                      commands: [
                        ...b.commands,
                        { id: `c${Date.now()}`, name: "", description: "" },
                      ],
                    }))
                  }
                >
                  <Plus className="size-4" />
                  Add command
                </Button>
              </div>

              {commandError ? (
                <p className="text-sm text-danger">{commandError}</p>
              ) : null}

              <div className="space-y-3">
                {bot.commands.map((cmd, index) => (
                  <div
                    key={cmd.id}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-border p-3 md:grid-cols-[1fr_1.4fr_auto]"
                  >
                    <TextField
                      value={cmd.name}
                      onChange={(v) => updateCommand(cmd.id, { name: v })}
                      isInvalid={Boolean(commandError) && !cmd.name.trim()}
                    >
                      <Label>Command {index + 1}</Label>
                      <Input placeholder="/ban" />
                      {commandError && !cmd.name.trim() ? (
                        <FieldError>Required</FieldError>
                      ) : null}
                    </TextField>
                    <TextField
                      value={cmd.description}
                      onChange={(v) => updateCommand(cmd.id, { description: v })}
                      isInvalid={Boolean(commandError) && !cmd.description.trim()}
                    >
                      <Label>Description</Label>
                      <Input placeholder="Ban a user from the server" />
                      {commandError && !cmd.description.trim() ? (
                        <FieldError>Required</FieldError>
                      ) : null}
                    </TextField>
                    <div className="flex items-end">
                      <Button
                        isIconOnly
                        variant="ghost"
                        aria-label="Remove command"
                        isDisabled={bot.commands.length <= 2}
                        onPress={() =>
                          setBot((b) => ({
                            ...b,
                            commands: b.commands.filter((c) => c.id !== cmd.id),
                          }))
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <p className="mb-2 text-sm font-semibold text-foreground">Bot media</p>
              <p className="mb-3 text-xs text-muted">
                Avatar, optional banner, and gallery previews (up to 6 images). Gallery is bot-only.
              </p>
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                <div
                  data-listing-field="bot-avatar"
                  className={botFieldErrors.avatar ? "rounded-2xl ring-2 ring-danger/70 ring-offset-2 ring-offset-background" : undefined}
                >
                  <UploadBox
                    title="Bot avatar *"
                    hint="Drag & drop or click"
                    sizeHint="Recommended 512×512"
                    variant="icon"
                    previewUrl={bot.avatarPreview}
                    onFile={(file, avatarPreview) => {
                      clearBotFieldError("avatar");
                      void handleBotAvatar(file, avatarPreview);
                    }}
                    onClear={() => {
                      setBot((current) => ({ ...current, avatarPreview: null }));
                      setBotMediaFiles((current) => ({...current, icon: null}));
                      setBotColorMatched(false);
                    }}
                  />
                  {botFieldErrors.avatar ? <p className="mt-1 text-sm text-danger">{botFieldErrors.avatar}</p> : null}
                </div>
                <UploadBox
                  title="Bot banner (optional)"
                  hint="Drag & drop or click"
                  sizeHint="Recommended 960×320"
                  variant="banner"
                  previewUrl={bot.bannerPreview}
                  onFile={(file, bannerPreview) => {
                    setBot((current) => ({ ...current, bannerPreview }));
                    setBotMediaFiles((current) => ({...current, banner: file}));
                  }}
                  onClear={() => {
                    setBot((current) => ({ ...current, bannerPreview: null }));
                    setBotMediaFiles((current) => ({...current, banner: null}));
                  }}
                />
              </div>
              <BannerColorPicker
                value={bot.bannerColor}
                matchedFromIcon={botColorMatched}
                onChange={(bannerColor) => {
                  setBot((current) => ({ ...current, bannerColor }));
                  setBotColorMatched(false);
                }}
              />
              <div>
                <UploadDropzone
                  title="Preview gallery"
                  hint="Add up to 6 images"
                  sizeHint="Recommended 1200×675"
                  selectedLabel={bot.galleryImages.length ? `${bot.galleryImages.length}/6 mock previews added` : undefined}
                  onPress={() => setBot((current) => {
                    if (current.galleryImages.length >= 6) {
                      toast.warning("You can add up to 6 gallery images.");
                      return current;
                    }
                    return { ...current, galleryImages: [...current.galleryImages, getBotGalleryImageUrl(current.name || "Bot", current.galleryImages.length, current.bannerHue)] };
                  })}
                />
              </div>
              {bot.galleryImages.length ? (
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="ghost" onPress={() => setBot((current) => ({ ...current, galleryImages: current.galleryImages.slice(0, -1) }))}>
                    <Trash2 className="size-3.5" />Remove last preview
                  </Button>
                </div>
              ) : null}
            </section>

            <div className="max-w-md">
              <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Premium bot</p>
                  <p className="text-xs text-muted">Highlight paid plan features</p>
                </div>
                <Switch
                  aria-label="Premium bot"
                  isSelected={bot.premium}
                  onChange={(v) => setBot((s) => ({ ...s, premium: v }))}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
              </div>
            </div>

            <Alert status="warning" className="rounded-2xl">
              <Alert.Indicator><Clock3 className="size-4" /></Alert.Indicator>
              <Alert.Content><Alert.Description>New bot listings are submitted for review. Their public pages appear after Nexbiy approves them for safety, clear functionality, and Discord Terms of Service compliance.</Alert.Description></Alert.Content>
            </Alert>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="secondary"
                onPress={() => {
                  void saveDraft("bot");
                }}
              >
                <Save className="size-4" />
                Save Draft
              </Button>
              <Button isDisabled={isPublishing} onPress={tryPublishBot}>
                <Send className="size-4" />
                Publish Bot
              </Button>
            </div>
          </form>

          <PreviewPanel
            kind="bot"
            mode={previewMode}
            onModeChange={setPreviewMode}
            listing={botListingPreview}
            page={botPagePreview}
          />
        </div>
      )}

      <ListingTypeModal
        isOpen={typeModalOpen}
        onOpenChange={(open) => {
          setTypeModalOpen(open);
          if (!open && !flowReady) router.push("/dashboard");
        }}
        value={pendingType}
        onChange={setPendingType}
        onContinue={handleTypeContinue}
        onCancel={() => router.push("/dashboard")}
      />

      <ServerSetupModal
        isOpen={setupModalOpen}
        onOpenChange={setSetupModalOpen}
        mode={setupMode}
        onModeChange={setSetupMode}
        selectedServerId={selectedDiscordId}
        servers={discordServers}
        onSelectServer={(discordServer) => {
          setServerFieldErrors({});
          setSelectedDiscordId(discordServer.id);
          setServer(fromDiscordServer(discordServer));
        }}
        onContinue={handleSetupContinue}
      />

      <ServerWidgetVerificationModal
        state={serverVerificationState}
        errorMessage={serverVerificationError}
        publicPath={publishedServerPath || `/server/${slugify(server.name || "server")}`}
        onRetry={() => void publishServer()}
        onSkip={() => void publishServerWithoutWidget()}
        onClose={() => setServerVerificationState(null)}
      />

      <BotReviewModal
        isOpen={reviewOpen}
        onOpenChange={setReviewOpen}
        onAgree={() => void finalizeBotPublish()}
      />

      <Modal.Backdrop
        isOpen={publishSuccess === "bot"}
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <Modal.Container>
          <Modal.Dialog className="widget-verification-dialog relative sm:max-w-lg">
            <Button
              isIconOnly
              aria-label="Close published bot dialog"
              className="absolute right-4 top-4 z-10"
              size="sm"
              variant="tertiary"
              onPress={() => setPublishSuccess(null)}
            >
              <X className="size-4" />
            </Button>
            <Modal.Header className="pr-16">
              <Modal.Heading className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                  <CheckCircle2 className="size-5" />
                </span>
                <span>Your bot was submitted</span>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              <Alert status="success" className="widget-verification-alert">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Bot submitted successfully</Alert.Title>
                  <Alert.Description>
                    Nexbiy will review your bot before its public page becomes visible.
                  </Alert.Description>
                </Alert.Content>
              </Alert>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted">Listing status</p>
                <ListingStatusChip status="PENDING_REVIEW" livePrefix />
              </div>
              <div className="rounded-xl border border-border bg-default/25 p-3">
                <TextField isReadOnly value={publishedBotPath || `/bots/${slugify(bot.name)}`}>
                  <Label>Owner preview</Label>
                  <Input />
                </TextField>
              </div>
            </Modal.Body>
            <Modal.Footer className="flex-wrap border-t border-border/70 pt-4">
              <Button variant="secondary" onPress={() => { const url = new URL(publishedBotPath || `/bots/${slugify(bot.name)}`, window.location.origin).toString(); void navigator.clipboard?.writeText(url); toast.success("Preview link copied"); }}><Copy className="size-4" />Copy preview link</Button>
              <LinkButton href={publishedBotPath || `/bots/${slugify(bot.name)}`} target="_blank">
                View owner preview
              </LinkButton>
              <LinkButton href="/dashboard">
                <LayoutDashboard className="size-4" />
                Back to dashboard
              </LinkButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop isOpen={modalOpen} onOpenChange={setModalOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {previewMode === "listing" ? "Listing card preview" : "Server page preview"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-4 flex gap-1 rounded-xl border border-border bg-default/50 p-1">
                <Button
                  size="sm"
                  className="flex-1"
                  variant={previewMode === "listing" ? "primary" : "ghost"}
                  onPress={() => setPreviewMode("listing")}
                >
                  Listing Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  variant={previewMode === "page" ? "primary" : "ghost"}
                  onPress={() => setPreviewMode("page")}
                >
                  Page Preview
                </Button>
              </div>
              <div className="mx-auto max-w-md">
                {previewMode === "listing" ? (
                  <ServerCardPreview model={listingPreview} />
                ) : (
                  <ServerPagePreview model={pagePreview} />
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Close
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
