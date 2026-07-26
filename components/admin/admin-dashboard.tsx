"use client";

import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  Input,
  Label,
  ListBox,
  Modal,
  SearchField,
  Select,
  Table,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import {
  Activity,
  BadgeCheck,
  Ban,
  BellRing,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  CircleX,
  CircleDollarSign,
  Clock3,
  Copy,
  Download,
  Eye,
  FileWarning,
  Flag,
  Gavel,
  HeartPulse,
  Inbox,
  LayoutDashboard,
  KeyRound,
  LockKeyhole,
  Megaphone,
  MessageSquareWarning,
  Pause,
  Pencil,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TicketCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LinkButton } from "@/components/ui/link-button";
import { BOTS } from "@/lib/data/bots";
import { SERVERS } from "@/lib/data/servers";
import { formatCount, initials } from "@/lib/format";

type AdminSection =
  | "main"
  | "listings"
  | "users"
  | "reports"
  | "review"
  | "verification"
  | "rewards"
  | "featured"
  | "moderators"
  | "support"
  | "health"
  | "announcements"
  | "audit";
type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";
type Urgency = "Low" | "Medium" | "High" | "Urgent";
type ListingStatus = "Live" | "Pending review" | "Paused" | "Suspended" | "Rejected";
type UserStatus = "Active" | "Restricted" | "Suspended" | "Banned";
type AdminListing = {
  key: string;
  slug: string;
  name: string;
  type: "server" | "bot";
  description: string;
  category: string;
  owner: string;
  ownerId: string;
  status: ListingStatus;
  verified: boolean;
  safeBadge: boolean;
  featured: boolean;
  placement: number | null;
  reach: number;
  trust: number;
  created: string;
  updated: string;
  reports: number;
  votes: Record<"1h" | "6h" | "24h", number>;
  iconUrl?: string | null;
};
type AdminUser = {
  id: string;
  discordId: string;
  name: string;
  handle: string;
  avatar: string;
  role: "CEO" | "Admin" | "Moderator" | "Owner" | "Member";
  status: UserStatus;
  listings: number;
  joined: string;
  longestActivity: string;
  online: boolean;
  flags: number;
  suspendedBefore: boolean;
  notice: string;
  listingsFrozen: boolean;
};
type AdminReport = {
  id: string;
  target: string;
  targetSlug: string;
  targetType: "server" | "bot";
  ownerId: string;
  reason: string;
  category: string;
  context: string;
  reporter: string;
  priority: Urgency;
  ageHours: number;
  age: string;
  status: "Open" | "Flagged" | "Passed";
};
type ModerationRequest = {
  id: string;
  title: string;
  kind: string;
  urgency: Urgency;
  requestedBy: string;
  age: string;
};
type VerificationRequest = {
  id: string;
  listingKey: string;
  name: string;
  type: "Server" | "Bot";
  eligibility: string;
  submitted: string;
};
type RewardAccount = {
  id: string;
  name: string;
  points: number;
  referrals: number;
  qualified: number;
  risk: "Clear" | "Review" | "High";
  suspended: boolean;
  signals: string[];
};
type Moderator = {
  id: string;
  name: string;
  discordId: string;
  role: "Admin" | "Moderator";
  status: "Active" | "Disabled";
  lastActive: string;
  permissions: string[];
};
type SupportTicket = {
  id: string;
  subject: string;
  user: string;
  priority: Urgency;
  status: "Open" | "Waiting" | "Escalated";
  age: string;
};
type ProtectedAction = {
  title: string;
  description: string;
  confirmation: string;
  scope: string;
  run: (challenge: string) => Promise<void> | void;
};
type AuditEntry = { id: string; action: string; target: string; actor: string; time: string; severity: "Info" | "Warning" | "Critical" };
type RangeMetrics = { visits: number; actions: number; reports: number; signups: number; points: number[] };
type AdminOverviewPayload = {
  listings: AdminListing[];
  users: AdminUser[];
  reports: AdminReport[];
  moderation: ModerationRequest[];
  audit: AuditEntry[];
  rangeMetrics: Record<TimeRange, RangeMetrics>;
};

const RANGE_OPTIONS: Array<{ id: TimeRange; label: string }> = [
  { id: "1h", label: "1 hour" },
  { id: "6h", label: "6 hours" },
  { id: "24h", label: "24 hours" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
];

const EMPTY_RANGE_METRICS = Object.fromEntries(
  RANGE_OPTIONS.map(({id}) => [id, {visits: 0, actions: 0, reports: 0, signups: 0, points: Array(12).fill(0)}]),
) as Record<TimeRange, RangeMetrics>;

const NAV_GROUPS: Array<{ label: string; items: Array<{ id: AdminSection; label: string; icon: LucideIcon }> }> = [
  {
    label: "Command",
    items: [
      { id: "main", label: "Main", icon: LayoutDashboard },
      { id: "health", label: "Site health", icon: HeartPulse },
      { id: "audit", label: "Audit log", icon: Activity },
    ],
  },
  {
    label: "Safety",
    items: [
      { id: "listings", label: "Listings", icon: Server },
      { id: "users", label: "Users", icon: Users },
      { id: "reports", label: "Reports", icon: Flag },
      { id: "review", label: "Pending review", icon: CircleCheck },
      { id: "verification", label: "Verification", icon: BadgeCheck },
      { id: "support", label: "Support tickets", icon: Inbox },
    ],
  },
  {
    label: "Growth",
    items: [
      { id: "rewards", label: "Rewards", icon: CircleDollarSign },
      { id: "featured", label: "Featured listings", icon: Star },
      { id: "announcements", label: "Announcements", icon: Megaphone },
    ],
  },
  {
    label: "Access",
    items: [{ id: "moderators", label: "Moderators", icon: ShieldCheck }],
  },
];

const INITIAL_USERS: AdminUser[] = [
  { id: "u1", discordId: "278619847520113664", name: "Denna", handle: "@denna", avatar: "https://cdn.discordapp.com/embed/avatars/0.png", role: "CEO", status: "Active", listings: 4, joined: "Jan 12, 2026", longestActivity: "11h 42m", online: true, flags: 0, suspendedBefore: false, notice: "None", listingsFrozen: false },
  { id: "u2", discordId: "384720115662503936", name: "Alex", handle: "@alexnexbiy", avatar: "https://cdn.discordapp.com/embed/avatars/1.png", role: "Owner", status: "Active", listings: 3, joined: "Feb 3, 2026", longestActivity: "6h 18m", online: true, flags: 0, suspendedBefore: false, notice: "None", listingsFrozen: false },
  { id: "u3", discordId: "491205773820018689", name: "Maya", handle: "@mayacodes", avatar: "https://cdn.discordapp.com/embed/avatars/2.png", role: "Owner", status: "Restricted", listings: 2, joined: "Mar 18, 2026", longestActivity: "4h 53m", online: false, flags: 2, suspendedBefore: true, notice: "Referral activity under review", listingsFrozen: false },
  { id: "u4", discordId: "622431987560103957", name: "Kai", handle: "@kaibuilds", avatar: "https://cdn.discordapp.com/embed/avatars/3.png", role: "Owner", status: "Active", listings: 1, joined: "Apr 7, 2026", longestActivity: "3h 27m", online: true, flags: 0, suspendedBefore: false, notice: "None", listingsFrozen: false },
  { id: "u5", discordId: "733204981145829447", name: "Lina", handle: "@linamusic", avatar: "https://cdn.discordapp.com/embed/avatars/4.png", role: "Member", status: "Active", listings: 0, joined: "May 21, 2026", longestActivity: "2h 09m", online: false, flags: 0, suspendedBefore: false, notice: "None", listingsFrozen: false },
  { id: "u6", discordId: "844107553201823744", name: "Orion", handle: "@orionlabs", avatar: "https://cdn.discordapp.com/embed/avatars/5.png", role: "Owner", status: "Suspended", listings: 2, joined: "Jun 2, 2026", longestActivity: "8h 01m", online: false, flags: 5, suspendedBefore: true, notice: "Suspicious referral pattern", listingsFrozen: true },
];

const INITIAL_REPORTS: AdminReport[] = [
  { id: "r1", target: "Economy Pro", targetSlug: "economy-pro", targetType: "bot", ownerId: "u6", reason: "Misleading invite permissions", category: "Dangerous permissions", context: "The bot requests administrator access without explaining why.", reporter: "@northstar", priority: "High", ageHours: 0.3, age: "18 min", status: "Open" },
  { id: "r2", target: "Crypto Hub", targetSlug: "crypto-hub", targetType: "server", ownerId: "u3", reason: "Potential scam links", category: "Scam or fraud", context: "Multiple shortened wallet links were posted in the welcome channel.", reporter: "@safeguard", priority: "Urgent", ageHours: 0.7, age: "42 min", status: "Flagged" },
  { id: "r3", target: "Meme Factory", targetSlug: "meme-factory", targetType: "server", ownerId: "u4", reason: "Incorrect category", category: "Incorrect information", context: "The listing is categorized as education but contains meme content.", reporter: "@lina", priority: "Low", ageHours: 3, age: "3 hr", status: "Open" },
  { id: "r4", target: "Startup Lounge", targetSlug: "startup-lounge", targetType: "server", ownerId: "u2", reason: "Expired Discord invite", category: "Broken invite", context: "The public invite returns an invalid invite message.", reporter: "System check", priority: "Medium", ageHours: 6, age: "6 hr", status: "Open" },
];

const INITIAL_MODERATION: ModerationRequest[] = [
  { id: "m1", title: "Emergency review: Crypto Hub", kind: "Listing safety", urgency: "Urgent", requestedBy: "Safety bot", age: "4 min" },
  { id: "m2", title: "Orion referral risk escalation", kind: "Rewards abuse", urgency: "High", requestedBy: "Maya (Moderator)", age: "19 min" },
  { id: "m3", title: "Economy Pro permissions review", kind: "Bot permissions", urgency: "High", requestedBy: "Kai (Moderator)", age: "37 min" },
  { id: "m4", title: "Resolve duplicate ownership claim", kind: "Ownership", urgency: "Medium", requestedBy: "Support", age: "2 hr" },
  { id: "m5", title: "Reclassify Meme Factory", kind: "Metadata", urgency: "Low", requestedBy: "Automated triage", age: "5 hr" },
];

const INITIAL_VERIFICATIONS: VerificationRequest[] = [
  { id: "v1", listingKey: "server:startup-lounge", name: "Startup Lounge", type: "Server", eligibility: "Identity and activity checks passed", submitted: "12 min ago" },
  { id: "v2", listingKey: "bot:giveaway-bot", name: "Giveaway Bot", type: "Bot", eligibility: "500+ servers and policy checks passed", submitted: "1 hr ago" },
  { id: "v3", listingKey: "server:cozy-corner", name: "Cozy Corner", type: "Server", eligibility: "Manual ownership review required", submitted: "4 hr ago" },
];

const INITIAL_REWARDS: RewardAccount[] = [
  { id: "rw1", name: "Alex", points: 20, referrals: 4, qualified: 2, risk: "Clear", suspended: false, signals: [] },
  { id: "rw2", name: "Maya", points: 10, referrals: 2, qualified: 1, risk: "Review", suspended: false, signals: ["Two referrals share a device fingerprint"] },
  { id: "rw3", name: "Orion", points: 85, referrals: 19, qualified: 8, risk: "High", suspended: true, signals: ["Daily limit exceeded", "Linked secondary account", "Burst signup pattern"] },
  { id: "rw4", name: "Kai", points: 5, referrals: 1, qualified: 1, risk: "Clear", suspended: false, signals: [] },
];

const INITIAL_MODERATORS: Moderator[] = [
  { id: "mod1", name: "Denna", discordId: "278619847520113664", role: "Admin", status: "Active", lastActive: "Now", permissions: ["All access", "2FA protected actions"] },
  { id: "mod2", name: "Maya", discordId: "491205773820018689", role: "Moderator", status: "Active", lastActive: "8 min ago", permissions: ["Manage reports", "Limited user actions"] },
  { id: "mod3", name: "Kai", discordId: "622431987560103957", role: "Moderator", status: "Active", lastActive: "27 min ago", permissions: ["Manage listings", "Verification"] },
];

const INITIAL_TICKETS: SupportTicket[] = [
  { id: "t1", subject: "Ownership import does not show my server", user: "@nova", priority: "High", status: "Escalated", age: "14 min" },
  { id: "t2", subject: "Widget verification still pending", user: "@m3", priority: "Medium", status: "Open", age: "43 min" },
  { id: "t3", subject: "Referral points not visible", user: "@lina", priority: "Low", status: "Waiting", age: "2 hr" },
];

const INITIAL_AUDIT: AuditEntry[] = [
  { id: "a1", action: "Suspended referral access", target: "Orion", actor: "Denna", time: "7 min ago", severity: "Critical" },
  { id: "a2", action: "Changed listing status to pending review", target: "Startup Lounge", actor: "Kai", time: "31 min ago", severity: "Warning" },
  { id: "a3", action: "Published global announcement", target: "Widget verification update", actor: "Denna", time: "2 hr ago", severity: "Info" },
];

function mapStatus(status: string): ListingStatus {
  if (status === "PENDING_REVIEW") return "Pending review";
  if (status === "PAUSED") return "Paused";
  if (status === "SUSPENDED") return "Suspended";
  return "Live";
}

const INITIAL_LISTINGS: AdminListing[] = [
  ...SERVERS.map((listing, index) => ({
    key: `server:${listing.id}`,
    slug: listing.id,
    name: listing.name,
    type: "server" as const,
    description: listing.description,
    category: listing.category,
    owner: listing.id === "nexus-hub" ? "Denna" : `${listing.name} Team`,
    ownerId: `U-${String(10420 + index)}`,
    status: mapStatus(listing.safetyStatus),
    verified: listing.verified,
    safeBadge: Boolean(listing.safeBadge),
    featured: Boolean(listing.featured),
    placement: listing.featured ? index + 1 : null,
    reach: listing.members,
    trust: listing.verified ? 96 - index : 74 + index,
    created: `May ${String(4 + index).padStart(2, "0")}, 2026`,
    updated: index % 2 ? "2 hr ago" : "24 min ago",
    reports: index % 4,
    votes: { "1h": 8 + index, "6h": 39 + index * 3, "24h": 116 + index * 11 },
  })),
  ...BOTS.map((listing, index) => ({
    key: `bot:${listing.id}`,
    slug: listing.slug,
    name: listing.name,
    type: "bot" as const,
    description: listing.shortDescription,
    category: listing.category,
    owner: listing.developer.name,
    ownerId: `U-${String(20840 + index)}`,
    status: mapStatus(listing.safetyStatus),
    verified: listing.verified,
    safeBadge: Boolean(listing.safeBadge),
    featured: Boolean(listing.rank && listing.rank <= 3),
    placement: listing.rank && listing.rank <= 3 ? listing.rank : null,
    reach: listing.servers ?? 0,
    trust: listing.verified ? 94 - index : 71 + index,
    created: `Apr ${String(8 + index).padStart(2, "0")}, 2026`,
    updated: index % 2 ? "1 hr ago" : "11 min ago",
    reports: index % 3,
    votes: { "1h": 11 + index, "6h": 52 + index * 4, "24h": 184 + index * 13 },
  })),
];

function priorityColor(priority: Urgency) {
  if (priority === "Urgent" || priority === "High") return "danger" as const;
  if (priority === "Medium") return "warning" as const;
  return "default" as const;
}

function listingUrl(listing: AdminListing) {
  return listing.type === "server" ? `/server/${listing.slug}` : `/bots/${listing.slug}`;
}

export function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>("main");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [moderation, setModeration] = useState<ModerationRequest[]>([]);
  const [verification, setVerification] = useState<VerificationRequest[]>([]);
  const [rewards, setRewards] = useState(INITIAL_REWARDS);
  const [moderators, setModerators] = useState(INITIAL_MODERATORS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [audit, setAudit] = useState(INITIAL_AUDIT);
  const [rangeMetrics, setRangeMetrics] = useState(EMPTY_RANGE_METRICS);
  const [editingListing, setEditingListing] = useState<AdminListing | null>(null);
  const [inspectingUser, setInspectingUser] = useState<AdminUser | null>(null);
  const [moderatingUser, setModeratingUser] = useState<AdminUser | null>(null);
  const [inspectingReport, setInspectingReport] = useState<AdminReport | null>(null);
  const [protectedAction, setProtectedAction] = useState<ProtectedAction | null>(null);
  const [isLoadingOperations, setIsLoadingOperations] = useState(true);
  const [mfaEnrolled, setMfaEnrolled] = useState<boolean | null>(null);
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  async function refreshOperations() {
    setIsLoadingOperations(true);
    try {
      const response = await fetch("/api/admin/overview", {cache: "no-store"});
      const payload = await response.json() as AdminOverviewPayload & {error?: string};
      if (!response.ok) throw new Error(payload.error || "admin_overview_failed");
      setListings(payload.listings);
      setUsers(payload.users);
      setReports(payload.reports);
      setModeration(payload.moderation);
      setAudit(payload.audit);
      setRangeMetrics(payload.rangeMetrics || EMPTY_RANGE_METRICS);
      setVerification(payload.listings
        .filter((listing) => listing.status === "Pending review")
        .map((listing) => ({
          id: `review:${listing.key}`,
          listingKey: listing.key,
          name: listing.name,
          type: listing.type === "server" ? "Server" : "Bot",
          eligibility: listing.type === "server"
            ? "Discord ownership and widget information available"
            : "Bot identity and listing details ready for staff review",
          submitted: listing.updated,
        })));
    } catch (error) {
      toast.danger("Could not load live operations", {
        description: error instanceof Error ? error.message : "Try refreshing the page.",
      });
    } finally {
      setIsLoadingOperations(false);
    }
  }

  useEffect(() => {
    void refreshOperations();
    void fetch("/api/admin/mfa/status", {cache: "no-store"})
      .then(async (response) => {
        const payload = await response.json() as {enrolled?: boolean};
        if (!response.ok) throw new Error("mfa_status_failed");
        setMfaEnrolled(Boolean(payload.enrolled));
      })
      .catch(() => setMfaEnrolled(false));
  }, []);

  const counts = useMemo(() => ({
    live: listings.filter((item) => item.status === "Live").length,
    review: listings.filter((item) => item.status === "Pending review").length,
    users: users.length,
    reports: reports.filter((item) => item.status !== "Passed").length,
    verification: verification.length,
  }), [listings, reports, users, verification]);

  function record(action: string, target: string, severity: AuditEntry["severity"] = "Info") {
    setAudit((current) => [{ id: crypto.randomUUID(), action, target, actor: "Denna", time: "Now", severity }, ...current]);
  }

  async function saveListing(next: AdminListing) {
    const response = await fetch(`/api/admin/listings/${next.key}/action`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        action: "edit_listing",
        name: next.name,
        shortDescription: next.description,
        category: next.category,
        reason: "Listing metadata updated from the admin dashboard",
      }),
    });
    const result = await response.json() as {error?: string};
    if (!response.ok) {
      toast.danger("Listing update failed", {description: result.error || "Please try again."});
      return;
    }
    setEditingListing(null);
    await refreshOperations();
    toast.success("Listing updated", { description: next.name });
  }

  async function updateListingStatus(listing: AdminListing, status: ListingStatus, challenge?: string) {
    const statusValue: Record<ListingStatus, string> = {
      Live: "live",
      "Pending review": "pending_review",
      Paused: "paused",
      Suspended: "suspended",
      Rejected: "rejected",
    };
    const response = await fetch(`/api/admin/listings/${listing.key}/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(challenge ? {"X-Admin-MFA-Challenge": challenge} : {}),
      },
      body: JSON.stringify({
        action: "set_status",
        status: statusValue[status],
        reason: `Status changed to ${status} from the admin dashboard`,
      }),
    });
    const result = await response.json() as {error?: string};
    if (!response.ok) {
      toast.danger("Status update failed", {description: result.error || "Please try again."});
      return;
    }
    await refreshOperations();
    toast.success("Listing status updated", { description: `${listing.name} is now ${status.toLowerCase()}.` });
  }

  async function runListingAction(
    listing: AdminListing,
    body: Record<string, unknown>,
    challenge?: string,
  ) {
    const response = await fetch(`/api/admin/listings/${listing.key}/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(challenge ? {"X-Admin-MFA-Challenge": challenge} : {}),
      },
      body: JSON.stringify(body),
    });
    const result = await response.json() as {error?: string};
    if (!response.ok) throw new Error(result.error || "admin_listing_action_failed");
    await refreshOperations();
  }

  async function runUserAction(
    user: AdminUser,
    body: Record<string, unknown>,
    challenge?: string,
  ) {
    const response = await fetch(`/api/admin/users/${user.id}/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(challenge ? {"X-Admin-MFA-Challenge": challenge} : {}),
      },
      body: JSON.stringify(body),
    });
    const result = await response.json() as {error?: string};
    if (!response.ok) throw new Error(result.error || "admin_user_action_failed");
    await refreshOperations();
  }

  async function runReportAction(
    report: AdminReport,
    input: {
      status: "triaged" | "investigating" | "resolved" | "dismissed";
      severity?: "low" | "medium" | "high" | "urgent";
      notes: string;
      notifyReporter?: boolean;
    },
  ) {
    const response = await fetch(`/api/admin/reports/${report.id}/action`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(input),
    });
    const result = await response.json() as {error?: string};
    if (!response.ok) throw new Error(result.error || "admin_report_action_failed");
    await refreshOperations();
  }

  function requestListingToggle(
    listing: AdminListing,
    action: "verified_badge" | "safe_badge" | "featured",
    enabled: boolean,
  ) {
    const label = action === "verified_badge"
      ? "Nexbiy verification"
      : action === "safe_badge"
        ? "Safe reputation badge"
        : "featured placement";
    setProtectedAction({
      title: `${enabled ? "Enable" : "Remove"} ${label}`,
      description: `${label} for ${listing.name} will be changed and recorded in the audit log.`,
      confirmation: listing.name,
      scope: `set_${action}`,
      run: async (challenge) => {
        await runListingAction(listing, {
          action,
          enabled,
          reason: `${label} ${enabled ? "enabled" : "removed"} from the admin dashboard`,
        }, challenge);
        toast.success("Listing updated", {description: `${listing.name}: ${label}`});
      },
    });
  }

  function requestVoteAdjustment(listing: AdminListing) {
    setProtectedAction({
      title: "Add 10 administrative votes",
      description: `Add 10 audited votes to ${listing.name}. This restricted adjustment is recorded.`,
      confirmation: listing.name,
      scope: "adjust_votes",
      run: async (challenge) => {
        await runListingAction(listing, {
          action: "adjust_votes",
          amount: 10,
          reason: "Approved featured-listing adjustment from the admin dashboard",
        }, challenge);
        toast.success("10 votes added", {description: listing.name});
      },
    });
  }

  function requestListingDelete(listing: AdminListing) {
    setProtectedAction({
      title: "Delete listing permanently",
      description: `${listing.name} will be removed from Nexbiy. This action requires an administrator 2FA code.`,
      confirmation: listing.name,
      scope: "delete_listing",
      run: async (challenge) => {
        await runListingAction(listing, {
          action: "set_status",
          status: "deleted",
          reason: "Listing permanently deleted from the admin dashboard",
        }, challenge);
        toast.success("Listing deleted", { description: listing.name });
      },
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto grid w-full max-w-[1800px] gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-6">
        <AdminSidebar
          section={section}
          reportCount={counts.reports}
          reviewCount={counts.review}
          verificationCount={counts.verification}
          onNavigate={setSection}
        />

        <div className="min-w-0">
          <header className="mb-5 flex flex-col gap-4 border-b border-border pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <Shield className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Nexbiy control center</h1>
                  <Chip size="sm" color="success" variant="soft"><Chip.Label>Live operations</Chip.Label></Chip>
                </div>
                <p className="mt-0.5 text-sm text-muted">CEO access · destructive actions require 2FA</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" isDisabled={isLoadingOperations} onPress={() => void refreshOperations()}>
                <RefreshCw className={`size-4 ${isLoadingOperations ? "animate-spin" : ""}`} />Refresh
              </Button>
              <LinkButton href="/explore" variant="secondary"><Eye className="size-4" />Public site</LinkButton>
              <Button variant="primary" onPress={() => setSection("announcements")}><Megaphone className="size-4" />Broadcast</Button>
            </div>
          </header>

          <main>
            {mfaEnrolled === false ? (
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/8 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                    <KeyRound className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Finish staff security setup</p>
                    <p className="mt-1 text-xs leading-5 text-muted">Connect an authenticator before using protected admin actions.</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onPress={() => setShowMfaSetup(true)}>
                  Set up 2FA
                </Button>
              </div>
            ) : null}
            {section === "main" ? <OverviewSection counts={counts} moderation={moderation} rangeMetrics={rangeMetrics} onNavigate={setSection} /> : null}
            {section === "listings" ? (
              <ListingsSection
                listings={listings}
                onEdit={setEditingListing}
                onDelete={requestListingDelete}
                onStatus={updateListingStatus}
                onToggleVerified={(listing) => requestListingToggle(listing, "verified_badge", !listing.verified)}
                onToggleSafeBadge={(listing) => requestListingToggle(listing, "safe_badge", !listing.safeBadge)}
                onToggleFeatured={(listing) => requestListingToggle(listing, "featured", !listing.featured)}
              />
            ) : null}
            {section === "users" ? (
              <UsersSection
                users={users}
                onInspect={setInspectingUser}
                onModerate={setModeratingUser}
              />
            ) : null}
            {section === "reports" ? (
              <ReportsSection
                reports={reports}
                onInspect={setInspectingReport}
                onAction={runReportAction}
              />
            ) : null}
            {section === "review" ? (
              <PendingReviewSection
                listings={listings}
                onEdit={setEditingListing}
                onStatus={updateListingStatus}
                onProtected={setProtectedAction}
              />
            ) : null}
            {section === "verification" ? <VerificationSection requests={verification} setRequests={setVerification} setListings={setListings} record={record} /> : null}
            {section === "rewards" ? <RewardsSection accounts={rewards} setAccounts={setRewards} record={record} /> : null}
            {section === "featured" ? <FeaturedSection listings={listings} onToggleFeatured={(listing, enabled) => requestListingToggle(listing, "featured", enabled)} onAddVotes={requestVoteAdjustment} /> : null}
            {section === "moderators" ? <ModeratorsSection moderators={moderators} setModerators={setModerators} record={record} /> : null}
            {section === "support" ? <SupportSection tickets={tickets} setTickets={setTickets} record={record} /> : null}
            {section === "health" ? <HealthSection /> : null}
            {section === "announcements" ? <AnnouncementsSection record={record} /> : null}
            {section === "audit" ? <AuditSection entries={audit} /> : null}
          </main>
        </div>
      </div>

      <ListingEditModal listing={editingListing} onClose={() => setEditingListing(null)} onSave={saveListing} />
      <UserInspectModal
        user={inspectingUser}
        onClose={() => setInspectingUser(null)}
      />
      <UserHammerModal
        user={moderatingUser}
        onClose={() => setModeratingUser(null)}
        onAction={async (user, body, challenge) => {
          try {
            await runUserAction(user, body, challenge);
            setModeratingUser(null);
            toast.success("User action completed", {description: user.name});
          } catch (error) {
            toast.danger("User action failed", {
              description: error instanceof Error ? error.message : "Please try again.",
            });
            throw error;
          }
        }}
        onProtected={setProtectedAction}
      />
      <ReportInspectModal
        report={inspectingReport}
        onClose={() => setInspectingReport(null)}
        onPriority={(report, priority) => {
          void runReportAction(report, {
            status: "triaged",
            severity: priority.toLowerCase() as "low" | "medium" | "high" | "urgent",
            notes: `Report triaged as ${priority.toLowerCase()} urgency.`,
          }).then(() => setInspectingReport(null)).catch((error) => {
            toast.danger("Report update failed", {description: error instanceof Error ? error.message : "Please try again."});
          });
        }}
        onNotify={(report) => {
          void runReportAction(report, {
            status: "investigating",
            severity: report.priority.toLowerCase() as "low" | "medium" | "high" | "urgent",
            notes: "Nexbiy staff are actively reviewing your report.",
            notifyReporter: true,
          }).then(() => {
            setInspectingReport(null);
            toast.success("Reporter notified", {description: report.reporter});
          }).catch((error) => {
            toast.danger("Notification failed", {description: error instanceof Error ? error.message : "Please try again."});
          });
        }}
      />
      <ProtectedActionModal action={protectedAction} onClose={() => setProtectedAction(null)} />
      <MfaSetupModal
        isOpen={showMfaSetup}
        onClose={() => setShowMfaSetup(false)}
        onComplete={() => {
          setMfaEnrolled(true);
          setShowMfaSetup(false);
          toast.success("Two-factor authentication enabled");
        }}
      />
    </div>
  );
}

function AdminSidebar({ section, reportCount, reviewCount, verificationCount, onNavigate }: {
  section: AdminSection;
  reportCount: number;
  reviewCount: number;
  verificationCount: number;
  onNavigate: (section: AdminSection) => void;
}) {
  return (
    <aside className="min-w-0 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
      <Card className="nexus-card h-full overflow-hidden">
        <Card.Content className="flex h-full gap-2 overflow-x-auto p-3 lg:flex-col lg:overflow-y-auto">
          <div className="hidden items-center gap-3 border-b border-border px-2 pb-4 lg:flex">
            <span className="flex size-9 items-center justify-center rounded-xl bg-danger/10 text-danger"><Gavel className="size-4" /></span>
            <div><p className="text-sm font-bold">Admin workspace</p><p className="text-[11px] text-muted">Full platform control</p></div>
          </div>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="contents lg:block">
              <p className="mt-3 hidden px-3 text-[10px] font-bold tracking-[0.16em] text-muted uppercase lg:block">{group.label}</p>
              <div className="contents lg:mt-1 lg:grid lg:gap-1">
                {group.items.map(({ id, label, icon: Icon }) => {
                  const badge = id === "reports" ? reportCount : id === "review" ? reviewCount : id === "verification" ? verificationCount : 0;
                  return (
                    <Button
                      key={id}
                      className="shrink-0 justify-start lg:w-full"
                      size="sm"
                      variant={section === id ? "primary" : "ghost"}
                      onPress={() => onNavigate(id)}
                    >
                      <Icon className="size-4" />
                      {label}
                      {badge ? <span className="ml-auto rounded-full bg-danger px-1.5 text-[10px] text-white">{badge}</span> : null}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-auto hidden rounded-xl border border-border bg-default/30 p-3 lg:block">
            <div className="flex items-center gap-2 text-xs font-semibold"><LockKeyhole className="size-3.5 text-success" />Protected session</div>
            <p className="mt-1 text-[11px] leading-4 text-muted">High-risk actions require the administrator’s 2FA code.</p>
          </div>
        </Card.Content>
      </Card>
    </aside>
  );
}

function SectionHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-muted">{description}</p></div>
      {action}
    </div>
  );
}

function TimeRangeControl({ value, onChange }: { value: TimeRange; onChange: (value: TimeRange) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-default/60 p-1">
      {RANGE_OPTIONS.map((item) => (
        <Button key={item.id} size="sm" variant={value === item.id ? "primary" : "ghost"} onPress={() => onChange(item.id)}>
          {item.label}
        </Button>
      ))}
    </div>
  );
}

function OverviewSection({ counts, moderation, rangeMetrics, onNavigate }: {
  counts: { live: number; users: number; reports: number; verification: number };
  moderation: ModerationRequest[];
  rangeMetrics: Record<TimeRange, RangeMetrics>;
  onNavigate: (section: AdminSection) => void;
}) {
  const [range, setRange] = useState<TimeRange>("24h");
  const metrics = rangeMetrics[range];
  const stats = [
    { label: "Live listings", value: counts.live, detail: "Servers and bots discoverable", icon: Server, color: "bg-accent/10 text-accent" },
    { label: "Platform users", value: counts.users, detail: `${metrics.signups} joined in this period`, icon: Users, color: "bg-violet-500/10 text-violet-400" },
    { label: "Open reports", value: counts.reports, detail: `${moderation.filter((item) => item.urgency === "Urgent").length} urgent request`, icon: ShieldAlert, color: "bg-danger/10 text-danger" },
    { label: "Verification queue", value: counts.verification, detail: "Manual decisions required", icon: BadgeCheck, color: "bg-success/10 text-success" },
    { label: "Traffic", value: metrics.visits > 50000 ? "Heavy" : metrics.visits > 10000 ? "High" : "Moderate", detail: `${formatCount(metrics.visits)} visits`, icon: Activity, color: "bg-warning/10 text-warning" },
  ];

  function exportAnalytics() {
    const rows = [
      ["range", range],
      ["visits", metrics.visits],
      ["platform_actions", metrics.actions],
      ["reports", metrics.reports],
      ["signups", metrics.signups],
    ];
    downloadCsv(`nexbiy-admin-${range}.csv`, rows);
    toast.success("Analytics exported", { description: `${range} command overview` });
  }

  return (
    <div>
      <SectionHeading
        title="Main command overview"
        description="Live platform state, moderation pressure, and operational activity."
        action={<div className="flex flex-wrap gap-2"><TimeRangeControl value={range} onChange={setRange} /><Button size="sm" variant="secondary" onPress={exportAnalytics}><Download className="size-4" />Export</Button></div>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <Card key={item.label} className="nexus-card-elevated">
            <Card.Content className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-medium text-muted">{item.label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{item.value}</p></div>
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}><item.icon className="size-4" /></span>
              </div>
              <p className="mt-3 text-[11px] text-muted">{item.detail}</p>
            </Card.Content>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
        <Card className="nexus-card">
          <Card.Header className="flex-row items-start justify-between gap-4 p-5 pb-2">
            <div><Card.Title>Platform activity</Card.Title><Card.Description>{formatCount(metrics.actions)} commands and listing interactions in the selected period.</Card.Description></div>
            <Chip size="sm" color="success" variant="soft"><Chip.Label>Live</Chip.Label></Chip>
          </Card.Header>
          <Card.Content className="p-5 pt-3">
            <div className="grid h-52 grid-cols-12 items-end gap-2 border-b border-border px-2 pb-3">
              {metrics.points.map((point, index) => (
                <div key={`${range}-${index}`} className="group relative h-full">
                  <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-accent/75 transition-[height,background-color] duration-500 group-hover:bg-accent" style={{ height: `${point}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <MiniMetric label="Visits" value={formatCount(metrics.visits)} />
              <MiniMetric label="Actions" value={formatCount(metrics.actions)} />
              <MiniMetric label="Reports" value={String(metrics.reports)} />
              <MiniMetric label="Signups" value={formatCount(metrics.signups)} />
            </div>
          </Card.Content>
        </Card>

        <Card className="nexus-card">
          <Card.Header className="p-5 pb-2"><Card.Title>Quick controls</Card.Title><Card.Description>Operational shortcuts</Card.Description></Card.Header>
          <Card.Content className="grid gap-2 p-5 pt-2">
            <QuickControl icon={Pencil} label="Manage listings" onPress={() => onNavigate("listings")} />
            <QuickControl icon={Star} label="Control featured slots" onPress={() => onNavigate("featured")} />
            <QuickControl icon={Flag} label="Reports" onPress={() => onNavigate("reports")} />
            <QuickControl icon={TicketCheck} label="Support tickets" onPress={() => onNavigate("support")} />
            <QuickControl icon={HeartPulse} label="Site health" onPress={() => onNavigate("health")} />
          </Card.Content>
        </Card>
      </div>

      <Card className="nexus-card mt-4">
        <Card.Header className="p-5 pb-2"><Card.Title>Queued moderator requests</Card.Title><Card.Description>Ordered by urgency and submission time.</Card.Description></Card.Header>
        <Card.Content className="p-5 pt-2">
          <div className="grid gap-2">
            {moderation.map((request) => (
              <button key={request.id} type="button" className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-default/50" onClick={() => onNavigate(request.kind === "Rewards abuse" ? "rewards" : "reports")}>
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${request.urgency === "Urgent" ? "bg-danger/12 text-danger" : "bg-warning/10 text-warning"}`}><FileWarning className="size-4" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{request.title}</p><p className="truncate text-xs text-muted">{request.kind} · {request.requestedBy} · {request.age}</p></div>
                <Chip size="sm" color={priorityColor(request.urgency)} variant="soft"><Chip.Label>{request.urgency}</Chip.Label></Chip>
                <ChevronRight className="size-4 text-muted" />
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

function ListingsSection({ listings, onEdit, onDelete, onStatus, onToggleVerified, onToggleSafeBadge, onToggleFeatured }: {
  listings: AdminListing[];
  onEdit: (listing: AdminListing) => void;
  onDelete: (listing: AdminListing) => void;
  onStatus: (listing: AdminListing, status: ListingStatus) => void;
  onToggleVerified: (listing: AdminListing) => void;
  onToggleSafeBadge: (listing: AdminListing) => void;
  onToggleFeatured: (listing: AdminListing) => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<AdminListing | null>(null);
  const filtered = listings.filter((listing) => (type === "all" || listing.type === type) && `${listing.name} ${listing.owner} ${listing.category}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <SectionHeading title="Listings control" description="Inspect placement, trust, reach, reports, votes, and platform status for every listing." action={<Chip variant="soft"><Chip.Label>{filtered.length} listings</Chip.Label></Chip>} />
      <Card className="nexus-card overflow-hidden">
        <Card.Content className="p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <SearchField className="flex-1" value={query} onChange={setQuery}>
              <Label className="sr-only">Search listings</Label>
              <SearchField.Group><SearchField.SearchIcon /><SearchField.Input placeholder="Search listing, owner, category, or ID" /><SearchField.ClearButton /></SearchField.Group>
            </SearchField>
            <Select className="md:w-44" selectedKey={type} onSelectionChange={(key) => setType(String(key))}>
              <Label className="sr-only">Listing type</Label>
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover><ListBox><ListBox.Item id="all">All listings</ListBox.Item><ListBox.Item id="server">Servers</ListBox.Item><ListBox.Item id="bot">Bots</ListBox.Item></ListBox></Select.Popover>
            </Select>
          </div>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="All Nexbiy listings" className="min-w-[1080px]">
                <Table.Header>
                  <Table.Column isRowHeader>Listing</Table.Column><Table.Column>Owner</Table.Column><Table.Column>Status</Table.Column><Table.Column>Reach</Table.Column><Table.Column>Trust</Table.Column><Table.Column>Placement</Table.Column><Table.Column className="text-end">Actions</Table.Column>
                </Table.Header>
                <Table.Body>
                  {filtered.map((listing) => (
                    <Table.Row key={listing.key} id={listing.key}>
                      <Table.Cell>
                        <button type="button" className="flex items-center gap-3 text-left" onClick={() => setSelected(listing)}>
                          <span className={`flex size-9 items-center justify-center rounded-xl ${listing.type === "bot" ? "bg-violet-500/10 text-violet-400" : "bg-accent/10 text-accent"}`}>{listing.type === "bot" ? <Bot className="size-4" /> : <Server className="size-4" />}</span>
                          <span>
                            <span className="flex items-center gap-1.5 font-semibold">
                              {listing.name}
                              {listing.safeBadge ? <ShieldCheck className="size-3.5 text-success" aria-label="Safe reputation badge" /> : null}
                            </span>
                            <span className="block text-xs text-muted">{listing.category} · {listing.type}</span>
                          </span>
                        </button>
                      </Table.Cell>
                      <Table.Cell><p className="text-sm">{listing.owner}</p><p className="text-xs text-muted">{listing.ownerId}</p></Table.Cell>
                      <Table.Cell><StatusChip status={listing.status} /></Table.Cell>
                      <Table.Cell>{formatCount(listing.reach)}</Table.Cell>
                      <Table.Cell><TrustChip value={listing.trust} /></Table.Cell>
                      <Table.Cell>{listing.featured ? <Chip size="sm" color="warning" variant="soft"><Chip.Label>Featured #{listing.placement}</Chip.Label></Chip> : <span className="text-sm text-muted">Organic</span>}</Table.Cell>
                      <Table.Cell>
                        <div className="flex min-w-[16rem] justify-end gap-1">
                          <Button size="sm" variant="ghost" onPress={() => setSelected(listing)}><Eye className="size-4" />Inspect</Button>
                          <Button isIconOnly size="sm" variant="ghost" aria-label={`Edit ${listing.name}`} onPress={() => onEdit(listing)}><Pencil className="size-4" /></Button>
                          <Button isIconOnly size="sm" variant="ghost" aria-label={`Pause ${listing.name}`} onPress={() => onStatus(listing, listing.status === "Paused" ? "Live" : "Paused")}><Pause className="size-4" /></Button>
                          <Button isIconOnly size="sm" variant="ghost" aria-label={`Delete ${listing.name}`} onPress={() => onDelete(listing)}><Trash2 className="size-4 text-danger" /></Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>
      </Card>

      <Modal.Backdrop isOpen={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <Modal.Container size="lg"><Modal.Dialog className="sm:max-w-3xl"><Modal.CloseTrigger />
          <Modal.Header><Modal.Heading>Listing command panel</Modal.Heading></Modal.Header>
          <Modal.Body className="space-y-4">
            {selected ? (
              <>
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-default/30 p-4 sm:flex-row sm:items-center">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent">{selected.type === "bot" ? <Bot className="size-5" /> : <Server className="size-5" />}</span>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">{selected.name}</h3><StatusChip status={selected.status} />{selected.safeBadge ? <Chip size="sm" color="success" variant="soft"><ShieldCheck className="size-3.5" /><Chip.Label>Safe reputation</Chip.Label></Chip> : null}</div><p className="text-sm text-muted">{selected.owner} · {selected.ownerId}</p></div>
                  <LinkButton href={listingUrl(selected)} target="_blank" variant="secondary"><Eye className="size-4" />View page</LinkButton>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCell label="Created" value={selected.created} /><InfoCell label="Last update" value={selected.updated} /><InfoCell label="Reports" value={String(selected.reports)} /><InfoCell label="Trust score" value={`${selected.trust}/100`} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoCell label="Votes · 1 hour" value={String(selected.votes["1h"])} /><InfoCell label="Votes · 6 hours" value={String(selected.votes["6h"])} /><InfoCell label="Votes · 24 hours" value={String(selected.votes["24h"])} />
                </div>
                <div className="rounded-2xl border border-border p-4"><p className="text-sm font-semibold">Quick actions</p><div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onPress={() => onEdit(selected)}><Pencil className="size-4" />Edit metadata</Button>
                  <Button size="sm" variant="secondary" onPress={() => onToggleVerified(selected)}><BadgeCheck className="size-4" />{selected.verified ? "Remove verification" : "Nexbiy verify"}</Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => {
                      onToggleSafeBadge(selected);
                      setSelected({ ...selected, safeBadge: !selected.safeBadge });
                    }}
                  >
                    <ShieldCheck className="size-4" />
                    {selected.safeBadge ? "Remove Safe badge" : "Award Safe badge"}
                  </Button>
                  <Button size="sm" variant="secondary" onPress={() => onToggleFeatured(selected)}><Star className="size-4" />{selected.featured ? "Remove featured" : "Feature listing"}</Button>
                  <Button size="sm" variant="secondary" onPress={() => onStatus(selected, "Pending review")}>Pending review</Button>
                  <Button size="sm" variant="secondary" onPress={() => onStatus(selected, "Live")}>Set live</Button>
                  <Button size="sm" variant="danger" onPress={() => onStatus(selected, "Suspended")}><Ban className="size-4" />Suspend</Button>
                </div></div>
              </>
            ) : null}
          </Modal.Body>
          <Modal.Footer><Button variant="tertiary" onPress={() => setSelected(null)}>Close</Button>{selected ? <Button variant="danger" onPress={() => onDelete(selected)}><Trash2 className="size-4" />Delete listing</Button> : null}</Modal.Footer>
        </Modal.Dialog></Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}

function UsersSection({ users, onInspect, onModerate }: {
  users: AdminUser[];
  onInspect: (user: AdminUser) => void;
  onModerate: (user: AdminUser) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = users.filter((user) => `${user.name} ${user.handle} ${user.discordId} ${user.role}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <SectionHeading title="User management" description="Discord identity, roles, activity, enforcement history, and account-level safety controls." />
      <Card className="nexus-card overflow-hidden"><Card.Content className="p-4">
        <SearchField className="mb-4 max-w-2xl" value={query} onChange={setQuery}>
          <Label className="sr-only">Search users</Label><SearchField.Group><SearchField.SearchIcon /><SearchField.Input placeholder="Search username, Discord ID, role, or status" /><SearchField.ClearButton /></SearchField.Group>
        </SearchField>
        <Table><Table.ScrollContainer><Table.Content aria-label="Nexbiy users" className="min-w-[1080px]">
          <Table.Header><Table.Column isRowHeader>User</Table.Column><Table.Column>Discord ID</Table.Column><Table.Column>Role</Table.Column><Table.Column>Status</Table.Column><Table.Column>Listings</Table.Column><Table.Column>Joined</Table.Column><Table.Column>Longest activity</Table.Column><Table.Column className="text-end">Actions</Table.Column></Table.Header>
          <Table.Body>{filtered.map((user) => (
            <Table.Row key={user.id} id={user.id}>
              <Table.Cell><div className="flex items-center gap-3"><Avatar className="size-9"><Avatar.Image src={user.avatar} alt="" /><Avatar.Fallback>{initials(user.name)}</Avatar.Fallback></Avatar><div><p className="font-semibold">{user.name}</p><p className="text-xs text-muted">{user.handle} · {user.online ? "Online" : "Offline"}</p></div></div></Table.Cell>
              <Table.Cell className="font-mono text-xs">{user.discordId}</Table.Cell>
              <Table.Cell><Chip size="sm" color={user.role === "CEO" || user.role === "Admin" ? "accent" : "default"} variant="soft"><Chip.Label>{user.role}</Chip.Label></Chip></Table.Cell>
              <Table.Cell><UserStatusChip status={user.status} /></Table.Cell>
              <Table.Cell>{user.listings}{user.listingsFrozen ? <p className="text-[10px] text-danger">Frozen</p> : null}</Table.Cell>
              <Table.Cell className="text-sm text-muted">{user.joined}</Table.Cell>
              <Table.Cell className="text-sm">{user.longestActivity}</Table.Cell>
              <Table.Cell><div className="flex min-w-[13rem] justify-end gap-1">
                <Button size="sm" variant="ghost" onPress={() => onInspect(user)}><Eye className="size-4" />Inspect</Button>
                {user.role !== "CEO" ? <Button size="sm" variant="secondary" onPress={() => onModerate(user)}><Gavel className="size-4 text-warning" />Hammer</Button> : null}
              </div></Table.Cell>
            </Table.Row>
          ))}</Table.Body>
        </Table.Content></Table.ScrollContainer></Table>
      </Card.Content></Card>
      <Card className="nexus-card mt-4"><Card.Header className="p-5 pb-2"><Card.Title>Hammer actions</Card.Title><Card.Description>Account enforcement controls. Permanent actions are 2FA protected.</Card.Description></Card.Header><Card.Content className="grid gap-3 p-5 pt-2 sm:grid-cols-2 xl:grid-cols-4">
        <ActionCard icon={Pause} title="Freeze listings" detail="Immediately hide every listing owned by a selected user." />
        <ActionCard icon={BellRing} title="Account notice" detail="Display a persistent moderation alert on the user account." />
        <ActionCard icon={RefreshCw} title="Reset restrictions" detail="Restore account and listing access after a completed review." />
        <ActionCard icon={LockKeyhole} title="Protected actions" detail="Ban and data deletion require admin 2FA confirmation." />
      </Card.Content></Card>
    </div>
  );
}

function ReportsSection({ reports, onInspect, onAction }: {
  reports: AdminReport[];
  onInspect: (report: AdminReport) => void;
  onAction: (
    report: AdminReport,
    input: {
      status: "triaged" | "investigating" | "resolved" | "dismissed";
      severity?: "low" | "medium" | "high" | "urgent";
      notes: string;
      notifyReporter?: boolean;
    },
  ) => Promise<void>;
}) {
  const [range, setRange] = useState<TimeRange>("24h");
  const maxHours = range === "1h" ? 1 : range === "6h" ? 6 : range === "24h" ? 24 : range === "7d" ? 168 : 720;
  const filtered = reports.filter((report) => report.ageHours <= maxHours);
  return (
    <div>
      <SectionHeading title="Reports and moderation" description="User-selected categories and custom context provide the evidence needed for a consistent decision." action={<TimeRangeControl value={range} onChange={setRange} />} />
      <Card className="nexus-card overflow-hidden"><Card.Content className="p-4">
        <Table><Table.ScrollContainer><Table.Content aria-label="User reports" className="min-w-[1000px]">
          <Table.Header><Table.Column isRowHeader>Reported listing</Table.Column><Table.Column>Category</Table.Column><Table.Column>Reporter</Table.Column><Table.Column>Owner ID</Table.Column><Table.Column>Age</Table.Column><Table.Column>Urgency</Table.Column><Table.Column>Status</Table.Column><Table.Column className="text-end">Actions</Table.Column></Table.Header>
          <Table.Body>{filtered.map((report) => (
            <Table.Row key={report.id} id={report.id}>
              <Table.Cell><button type="button" className="text-left" onClick={() => onInspect(report)}><span className="block font-semibold">{report.target}</span><span className="block text-xs text-muted">{report.reason}</span></button></Table.Cell>
              <Table.Cell>{report.category}</Table.Cell><Table.Cell>{report.reporter}</Table.Cell><Table.Cell className="font-mono text-xs">{report.ownerId}</Table.Cell><Table.Cell>{report.age}</Table.Cell>
              <Table.Cell><Chip size="sm" color={priorityColor(report.priority)} variant="soft"><Chip.Label>{report.priority}</Chip.Label></Chip></Table.Cell>
              <Table.Cell>{report.status}</Table.Cell>
              <Table.Cell><div className="flex min-w-[15rem] justify-end gap-1"><Button size="sm" variant="ghost" onPress={() => onInspect(report)}>Review</Button><Button isIconOnly size="sm" variant="ghost" aria-label="Notify reporter" onPress={() => void onAction(report, {status: "investigating", severity: report.priority.toLowerCase() as "low" | "medium" | "high" | "urgent", notes: "Nexbiy staff are actively reviewing your report.", notifyReporter: true}).then(() => toast.success("Reporter notified", {description: report.reporter})).catch((error) => toast.danger("Report update failed", {description: error instanceof Error ? error.message : "Please try again."}))}><BellRing className="size-4" /></Button><Button isIconOnly size="sm" variant="ghost" aria-label="Pass to moderator" onPress={() => void onAction(report, {status: "investigating", severity: report.priority.toLowerCase() as "low" | "medium" | "high" | "urgent", notes: "Passed to the moderation investigation queue."}).catch((error) => toast.danger("Report update failed", {description: error instanceof Error ? error.message : "Please try again."}))}><UserCog className="size-4" /></Button><Button isIconOnly size="sm" variant="ghost" aria-label="Dismiss report" onPress={() => void onAction(report, {status: "dismissed", severity: report.priority.toLowerCase() as "low" | "medium" | "high" | "urgent", notes: "Report dismissed after staff review."}).then(() => toast.success("Report dismissed")).catch((error) => toast.danger("Report dismissal failed", {description: error instanceof Error ? error.message : "Administrator access is required."}))}><X className="size-4" /></Button></div></Table.Cell>
            </Table.Row>
          ))}</Table.Body>
        </Table.Content></Table.ScrollContainer></Table>
      </Card.Content></Card>
    </div>
  );
}

function PendingReviewSection({ listings, onEdit, onStatus, onProtected }: {
  listings: AdminListing[];
  onEdit: (listing: AdminListing) => void;
  onStatus: (listing: AdminListing, status: ListingStatus, challenge?: string) => void;
  onProtected: (action: ProtectedAction) => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "server" | "bot">("all");
  const [selected, setSelected] = useState<AdminListing | null>(null);
  const pending = listings.filter((listing) => listing.status === "Pending review" && (type === "all" || listing.type === type) && `${listing.name} ${listing.owner} ${listing.category}`.toLowerCase().includes(query.toLowerCase()));
  const serverCount = listings.filter((listing) => listing.status === "Pending review" && listing.type === "server").length;
  const botCount = listings.filter((listing) => listing.status === "Pending review" && listing.type === "bot").length;

  function approve(listing: AdminListing) {
    onStatus(listing, "Live");
    setSelected(null);
    toast.success("Listing approved", { description: `${listing.name} is now live.` });
  }

  function reject(listing: AdminListing) {
    onProtected({
      title: "Reject listing submission",
      description: `Reject ${listing.name} and prevent it from becoming publicly discoverable. This decision is recorded and requires 2FA.`,
      confirmation: listing.name,
      scope: "reject_listing",
      run: (challenge) => {
        onStatus(listing, "Rejected", challenge);
        setSelected(null);
        toast.success("Submission rejected", { description: listing.name });
      },
    });
  }

  return (
    <div>
      <SectionHeading title="Pending listing review" description="Review new server and bot submissions before they become publicly discoverable." action={<div className="flex rounded-xl bg-default/60 p-1"><Button size="sm" variant={type === "all" ? "primary" : "ghost"} onPress={() => setType("all")}>All</Button><Button size="sm" variant={type === "server" ? "primary" : "ghost"} onPress={() => setType("server")}>Servers</Button><Button size="sm" variant={type === "bot" ? "primary" : "ghost"} onPress={() => setType("bot")}>Bots</Button></div>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total waiting" value={String(serverCount + botCount)} icon={Clock3} />
        <MetricCard label="Server submissions" value={String(serverCount)} icon={Server} />
        <MetricCard label="Bot submissions" value={String(botCount)} icon={Bot} />
      </div>
      <Card className="nexus-card overflow-hidden"><Card.Content className="p-4">
        <SearchField className="mb-4 max-w-2xl" value={query} onChange={setQuery}>
          <Label className="sr-only">Search pending listings</Label>
          <SearchField.Group><SearchField.SearchIcon /><SearchField.Input placeholder="Search submission, owner, or category" /><SearchField.ClearButton /></SearchField.Group>
        </SearchField>
        <Table><Table.ScrollContainer><Table.Content aria-label="Pending listing submissions" className="min-w-[980px]">
          <Table.Header><Table.Column isRowHeader>Listing</Table.Column><Table.Column>Owner</Table.Column><Table.Column>Category</Table.Column><Table.Column>Trust</Table.Column><Table.Column>Reports</Table.Column><Table.Column>Last update</Table.Column><Table.Column className="text-end">Decision</Table.Column></Table.Header>
          <Table.Body>{pending.map((listing) => (
            <Table.Row key={listing.key} id={listing.key}>
              <Table.Cell><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-warning/10 text-warning">{listing.type === "server" ? <Server className="size-4" /> : <Bot className="size-4" />}</span><div><button type="button" className="font-semibold" onClick={() => setSelected(listing)}>{listing.name}</button><p className="text-xs text-muted capitalize">{listing.type} · submitted {listing.created}</p></div></div></Table.Cell>
              <Table.Cell><p className="font-medium">{listing.owner}</p><p className="font-mono text-[11px] text-muted">{listing.ownerId}</p></Table.Cell>
              <Table.Cell>{listing.category}</Table.Cell>
              <Table.Cell><Chip size="sm" color={listing.trust >= 85 ? "success" : listing.trust >= 70 ? "warning" : "danger"} variant="soft"><Chip.Label>{listing.trust}%</Chip.Label></Chip></Table.Cell>
              <Table.Cell>{listing.reports}</Table.Cell><Table.Cell className="text-sm text-muted">{listing.updated}</Table.Cell>
              <Table.Cell><div className="flex min-w-[17rem] justify-end gap-1"><Button size="sm" variant="ghost" onPress={() => setSelected(listing)}>Review</Button><Button size="sm" variant="secondary" onPress={() => { onStatus(listing, "Pending review"); toast.success("Changes requested", { description: `Owner of ${listing.name} was notified.` }); }}>Request changes</Button><Button size="sm" variant="primary" onPress={() => approve(listing)}><CircleCheck className="size-4" />Approve</Button></div></Table.Cell>
            </Table.Row>
          ))}</Table.Body>
        </Table.Content></Table.ScrollContainer></Table>
      </Card.Content></Card>

      <Modal.Backdrop isOpen={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <Modal.Container size="lg"><Modal.Dialog className="sm:max-w-3xl"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Submission decision</Modal.Heading></Modal.Header>
          <Modal.Body className="space-y-4">{selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-default/25 p-4"><div><div className="flex items-center gap-2"><h3 className="text-lg font-bold">{selected.name}</h3><Chip size="sm" variant="soft"><Chip.Label className="capitalize">{selected.type}</Chip.Label></Chip></div><p className="mt-1 text-sm text-muted">{selected.owner} · {selected.ownerId}</p></div><LinkButton href={listingUrl(selected)} target="_blank" variant="secondary"><Eye className="size-4" />Preview page</LinkButton></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ReviewCheck title="Ownership identity" detail="Discord owner and imported listing match." passed />
                <ReviewCheck title="Invite and activity" detail="Public destination responds and activity data is present." passed={selected.type === "bot" || selected.trust >= 75} />
                <ReviewCheck title="Metadata quality" detail="Name, category, and descriptions are complete." passed={selected.description.length >= 40} />
                <ReviewCheck title="Media safety" detail="Icon and banner are ready for moderation." passed />
                <ReviewCheck title="Trust signals" detail={`${selected.trust}% trust score with ${selected.reports} existing reports.`} passed={selected.trust >= 70 && selected.reports < 3} />
                <ReviewCheck title="Policy scan" detail="Automated content and permission checks completed." passed={selected.reports === 0} />
              </div>
              <div className="rounded-xl border border-border p-4"><p className="text-sm font-semibold">Moderator notes</p><TextArea className="mt-2" rows={3} placeholder="Record private review notes or changes required from the owner." /></div>
            </>
          ) : null}</Modal.Body>
          <Modal.Footer><Button variant="tertiary" onPress={() => setSelected(null)}>Close</Button>{selected ? <><Button variant="secondary" onPress={() => onEdit(selected)}><Pencil className="size-4" />Edit listing</Button><Button variant="secondary" onPress={() => { onStatus(selected, "Pending review"); toast.success("Changes requested", { description: `Owner of ${selected.name} was notified.` }); }}>Request changes</Button><Button variant="danger" onPress={() => reject(selected)}><CircleX className="size-4" />Reject</Button><Button variant="primary" onPress={() => approve(selected)}><CircleCheck className="size-4" />Approve</Button></> : null}</Modal.Footer>
        </Modal.Dialog></Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}

function ReviewCheck({ title, detail, passed }: { title: string; detail: string; passed: boolean }) {
  return <div className={`rounded-xl border p-3 ${passed ? "border-success/20 bg-success/5" : "border-warning/25 bg-warning/5"}`}><div className="flex items-center gap-2"><span className={passed ? "text-success" : "text-warning"}>{passed ? <CircleCheck className="size-4" /> : <ShieldAlert className="size-4" />}</span><p className="text-sm font-semibold">{title}</p></div><p className="mt-1 text-xs leading-5 text-muted">{detail}</p></div>;
}

function VerificationSection({ requests, setRequests, setListings, record }: {
  requests: VerificationRequest[];
  setRequests: React.Dispatch<React.SetStateAction<VerificationRequest[]>>;
  setListings: React.Dispatch<React.SetStateAction<AdminListing[]>>;
  record: (action: string, target: string, severity?: AuditEntry["severity"]) => void;
}) {
  function decide(request: VerificationRequest, approved: boolean) {
    setRequests((current) => current.filter((item) => item.id !== request.id));
    setListings((current) => current.map((listing) => listing.key === request.listingKey ? { ...listing, verified: approved, status: approved ? "Live" : listing.status } : listing));
    record(approved ? "Approved verification" : "Declined verification", request.name, "Warning");
    toast.success(approved ? "Verification approved" : "Verification declined", { description: request.name });
  }
  return (
    <div><SectionHeading title="Verification queue" description="Nexbiy badges are granted only after automated eligibility and manual ownership review." />
      <div className="space-y-3">{requests.map((request) => (
        <Card key={request.id} className="nexus-card-elevated"><Card.Content className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><BadgeCheck className="size-5" /></span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{request.name}</h3><Chip size="sm" variant="soft"><Chip.Label>{request.type}</Chip.Label></Chip></div><p className="mt-1 text-sm text-muted">{request.eligibility}</p><p className="mt-1 text-xs text-muted">Submitted {request.submitted}</p></div>
          <div className="flex gap-2"><Button variant="tertiary" onPress={() => decide(request, false)}><X className="size-4" />Decline</Button><Button variant="primary" onPress={() => decide(request, true)}><BadgeCheck className="size-4" />Approve badge</Button></div>
        </Card.Content></Card>
      ))}{requests.length === 0 ? <EmptyState icon={BadgeCheck} title="Verification queue is clear" detail="No badge requests currently need a decision." /> : null}</div>
    </div>
  );
}

function RewardsSection({ accounts, setAccounts, record }: {
  accounts: RewardAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<RewardAccount[]>>;
  record: (action: string, target: string, severity?: AuditEntry["severity"]) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = accounts.filter((account) => account.name.toLowerCase().includes(query.toLowerCase()));
  function update(account: RewardAccount, updates: Partial<RewardAccount>, action: string) {
    setAccounts((current) => current.map((item) => item.id === account.id ? { ...item, ...updates } : item));
    record(action, account.name, account.risk === "High" ? "Critical" : "Warning");
    toast.success(action, { description: account.name });
  }
  return (
    <div>
      <SectionHeading title="Rewards security" description="Detect referral manipulation, linked secondary accounts, burst signups, and daily-limit abuse." />
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Points issued" value={formatCount(accounts.reduce((sum, item) => sum + item.points, 0))} icon={Sparkles} />
        <MetricCard label="Qualified referrals" value={formatCount(accounts.reduce((sum, item) => sum + item.qualified, 0))} icon={Users} />
        <MetricCard label="Risk review" value={String(accounts.filter((item) => item.risk !== "Clear").length)} icon={ShieldAlert} />
      </div>
      <Card className="nexus-card mt-4 overflow-hidden"><Card.Content className="p-4">
        <SearchField className="mb-4 max-w-xl" value={query} onChange={setQuery}><Label className="sr-only">Search reward accounts</Label><SearchField.Group><SearchField.SearchIcon /><SearchField.Input placeholder="Search referral owner" /><SearchField.ClearButton /></SearchField.Group></SearchField>
        <Table><Table.ScrollContainer><Table.Content aria-label="Referral reward accounts" className="min-w-[900px]">
          <Table.Header><Table.Column isRowHeader>Owner</Table.Column><Table.Column>Referrals</Table.Column><Table.Column>Qualified</Table.Column><Table.Column>Balance</Table.Column><Table.Column>Risk</Table.Column><Table.Column>Security signals</Table.Column><Table.Column className="text-end">Actions</Table.Column></Table.Header>
          <Table.Body>{filtered.map((account) => (
            <Table.Row key={account.id} id={account.id}>
              <Table.Cell><p className="font-semibold">{account.name}</p>{account.suspended ? <p className="text-xs text-danger">Program suspended</p> : null}</Table.Cell>
              <Table.Cell>{account.referrals}</Table.Cell><Table.Cell>{account.qualified}</Table.Cell><Table.Cell>{account.points} points</Table.Cell>
              <Table.Cell><Chip size="sm" color={account.risk === "High" ? "danger" : account.risk === "Review" ? "warning" : "success"} variant="soft"><Chip.Label>{account.risk}</Chip.Label></Chip></Table.Cell>
              <Table.Cell><p className="max-w-72 truncate text-xs text-muted">{account.signals.join(" · ") || "No suspicious signals"}</p></Table.Cell>
              <Table.Cell><div className="flex min-w-[18rem] justify-end gap-1"><Button size="sm" variant="secondary" onPress={() => update(account, { points: Math.max(0, account.points - 5) }, "Adjusted balance -5")}>-5</Button><Button size="sm" variant="secondary" onPress={() => update(account, { points: account.points + 5 }, "Adjusted balance +5")}>+5</Button><Button size="sm" variant={account.suspended ? "secondary" : "danger"} onPress={() => update(account, { suspended: !account.suspended }, account.suspended ? "Restored referral access" : "Suspended referral access")}>{account.suspended ? "Restore" : "Suspend"}</Button></div></Table.Cell>
            </Table.Row>
          ))}</Table.Body>
        </Table.Content></Table.ScrollContainer></Table>
      </Card.Content></Card>
      <Card className="nexus-card mt-4"><Card.Header className="p-5 pb-2"><Card.Title>Automated abuse defenses</Card.Title><Card.Description>Recommended production checks represented in this mock control center.</Card.Description></Card.Header><Card.Content className="grid gap-3 p-5 pt-2 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard icon={ShieldCheck} title="Device fingerprinting" detail="Detect repeated signups from the same browser or device." />
        <ActionCard icon={Activity} title="Velocity rules" detail="Flag bursts that exceed natural referral behavior." />
        <ActionCard icon={Users} title="Account linking" detail="Compare Discord identity, IP groups, and account age." />
        <ActionCard icon={LockKeyhole} title="Immutable ledger" detail="Record point grants and adjustments for later audit." />
      </Card.Content></Card>
    </div>
  );
}

function FeaturedSection({ listings, onToggleFeatured, onAddVotes }: {
  listings: AdminListing[];
  onToggleFeatured: (listing: AdminListing, enabled: boolean) => void;
  onAddVotes: (listing: AdminListing) => void;
}) {
  const [type, setType] = useState<"server" | "bot">("server");
  const [query, setQuery] = useState("");
  const typeListings = listings.filter((listing) => listing.type === type);
  const promoted = typeListings.filter((listing) => listing.featured).sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99));
  const candidates = typeListings.filter((listing) => !listing.featured && listing.status === "Live" && `${listing.name} ${listing.category} ${listing.owner}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  function feature(key: string) {
    const target = listings.find((item) => item.key === key);
    if (!target) return;
    onToggleFeatured(target, true);
    setQuery("");
  }
  return (
    <div>
      <SectionHeading title="Featured discovery control" description="Servers and bots have separate placement rules and ordering." action={<div className="flex rounded-xl bg-default/60 p-1"><Button size="sm" variant={type === "server" ? "primary" : "ghost"} onPress={() => setType("server")}>Servers</Button><Button size="sm" variant={type === "bot" ? "primary" : "ghost"} onPress={() => setType("bot")}>Bots</Button></div>} />
      <Card className="nexus-card"><Card.Content className="p-5">
        <SearchField className="max-w-3xl" value={query} onChange={setQuery}>
          <Label>{type === "server" ? "Search servers to feature" : "Search bots to recommend"}</Label>
          <SearchField.Group><SearchField.SearchIcon /><SearchField.Input placeholder="Search by listing, category, or owner" /><SearchField.ClearButton /></SearchField.Group>
        </SearchField>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {query.trim() ? candidates.map((listing) => (
            <div key={listing.key} className="flex items-center gap-3 rounded-xl border border-border bg-default/25 p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">{listing.type === "server" ? <Server className="size-4" /> : <Bot className="size-4" />}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{listing.name}</p><p className="truncate text-xs text-muted">{listing.category} · {listing.owner}</p></div>
              <Button size="sm" variant="primary" onPress={() => feature(listing.key)}><Star className="size-4" />Add</Button>
            </div>
          )) : <p className="text-sm text-muted">Start typing to find an eligible live listing.</p>}
          {query.trim() && !candidates.length ? <p className="text-sm text-muted">No eligible live listings match this search.</p> : null}
        </div>
        <p className="mt-3 text-xs text-muted">{type === "server" ? "Positions 1–4 control the first four server slots on Explore." : "Positions 1–3 control the Recommended bots row."}</p>
      </Card.Content></Card>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {promoted.map((listing, index) => (
          <Card key={listing.key} className="nexus-card-elevated"><Card.Content className="p-5">
            <div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning"><Star className="size-5" /></span><Chip size="sm" color="warning" variant="soft"><Chip.Label>Position {index + 1}</Chip.Label></Chip></div>
            <h3 className="mt-4 font-bold">{listing.name}</h3><p className="mt-1 text-sm text-muted">{formatCount(listing.reach)} reach · {listing.votes["24h"]} votes today</p>
            <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onPress={() => onAddVotes(listing)}><LockKeyhole className="size-4" />+10 votes</Button><Button size="sm" variant="tertiary" onPress={() => onToggleFeatured(listing, false)}>Remove</Button></div>
          </Card.Content></Card>
        ))}
      </div>
    </div>
  );
}

function ModeratorsSection({ moderators, setModerators, record }: {
  moderators: Moderator[];
  setModerators: React.Dispatch<React.SetStateAction<Moderator[]>>;
  record: (action: string, target: string, severity?: AuditEntry["severity"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["Manage reports"]);
  const options = ["Manage reports", "Manage listings", "Limited user actions", "Verification", "Rewards review"];
  function add() {
    if (!name.trim() || !discordId.trim()) return toast.warning("Add a name and Discord ID");
    const moderator: Moderator = { id: crypto.randomUUID(), name, discordId, role: "Moderator", status: "Active", lastActive: "Invited now", permissions };
    setModerators((current) => [...current, moderator]);
    record("Added moderator", name, "Warning");
    setOpen(false); setName(""); setDiscordId(""); setPermissions(["Manage reports"]);
    toast.success("Moderator access created", { description: name });
  }
  return (
    <div>
      <SectionHeading title="Moderator access" description="Assign staff to narrowly scoped operational areas. Permanent admin powers remain unavailable to moderators." action={<Button variant="primary" onPress={() => setOpen(true)}><UserPlus className="size-4" />Add moderator</Button>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{moderators.map((moderator) => (
        <Card key={moderator.id} className="nexus-card-elevated"><Card.Content className="p-5">
          <div className="flex items-start gap-3"><Avatar className="size-10"><Avatar.Fallback className="bg-accent/10 text-accent">{initials(moderator.name)}</Avatar.Fallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-bold">{moderator.name}</h3><Chip size="sm" color={moderator.role === "Admin" ? "accent" : "default"} variant="soft"><Chip.Label>{moderator.role}</Chip.Label></Chip></div><p className="text-xs text-muted">{moderator.discordId} · {moderator.lastActive}</p></div></div>
          <div className="mt-4 flex flex-wrap gap-1.5">{moderator.permissions.map((permission) => <Chip key={permission} size="sm" variant="soft"><Chip.Label>{permission}</Chip.Label></Chip>)}</div>
          {moderator.role !== "Admin" ? <Button className="mt-4" size="sm" variant={moderator.status === "Disabled" ? "secondary" : "danger"} onPress={() => { const status = moderator.status === "Disabled" ? "Active" : "Disabled"; setModerators((current) => current.map((item) => item.id === moderator.id ? { ...item, status } : item)); record(`${status === "Disabled" ? "Disabled" : "Restored"} moderator`, moderator.name, "Warning"); }}>{moderator.status === "Disabled" ? "Restore access" : "Disable access"}</Button> : null}
        </Card.Content></Card>
      ))}</div>
      <Card className="nexus-card mt-4"><Card.Header className="p-5 pb-2"><Card.Title>Permission boundaries</Card.Title></Card.Header><Card.Content className="grid gap-3 p-5 pt-2 md:grid-cols-3"><ActionCard icon={Flag} title="Reports" detail="Review, flag, notify reporters, pass cases, and recommend outcomes." /><ActionCard icon={Users} title="Limited user action" detail="Temporary suspension, alerts, and escalation to an administrator." /><ActionCard icon={LockKeyhole} title="Admin-only" detail="Delete data, delete listings, permanent bans, staff access, and security settings." /></Card.Content></Card>

      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}><Modal.Container size="md"><Modal.Dialog><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Add moderator</Modal.Heading></Modal.Header><Modal.Body className="space-y-4">
        <TextField value={name} onChange={setName}><Label>Name</Label><Input placeholder="Moderator name" /></TextField>
        <TextField value={discordId} onChange={setDiscordId}><Label>Discord user ID</Label><Input placeholder="123456789012345678" /></TextField>
        <div><p className="mb-2 text-sm font-semibold">Assigned permissions</p><div className="grid gap-2">{options.map((option) => <Checkbox key={option} isSelected={permissions.includes(option)} onChange={(selected) => setPermissions((current) => selected ? [...current, option] : current.filter((item) => item !== option))}><Checkbox.Content className="rounded-xl border border-border p-3"><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><span className="text-sm">{option}</span></Checkbox.Content></Checkbox>)}</div></div>
      </Modal.Body><Modal.Footer><Button variant="tertiary" onPress={() => setOpen(false)}>Cancel</Button><Button variant="primary" onPress={add}>Create access</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
    </div>
  );
}

function SupportSection({ tickets, setTickets, record }: {
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  record: (action: string, target: string, severity?: AuditEntry["severity"]) => void;
}) {
  function close(ticket: SupportTicket) {
    setTickets((current) => current.filter((item) => item.id !== ticket.id));
    record("Resolved support ticket", ticket.subject);
    toast.success("Ticket resolved", { description: ticket.user });
  }
  return (
    <div><SectionHeading title="Support tickets" description="Handle owner problems before they become moderation or trust issues." action={<Chip color="warning" variant="soft"><Chip.Label>{tickets.length} active</Chip.Label></Chip>} />
      <div className="space-y-3">{tickets.map((ticket) => (
        <Card key={ticket.id} className="nexus-card-elevated"><Card.Content className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Inbox className="size-4" /></span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><h3 className="font-bold">{ticket.subject}</h3><Chip size="sm" color={priorityColor(ticket.priority)} variant="soft"><Chip.Label>{ticket.priority}</Chip.Label></Chip></div><p className="mt-1 text-sm text-muted">{ticket.user} · {ticket.status} · {ticket.age}</p></div>
          <div className="flex gap-2"><Button size="sm" variant="secondary" onPress={() => toast.success("Reply composer opened")}>Reply</Button><Button size="sm" variant="primary" onPress={() => close(ticket)}>Resolve</Button></div>
        </Card.Content></Card>
      ))}</div>
    </div>
  );
}

function HealthSection() {
  const systems = [
    { name: "Web application", status: "Operational", latency: "84 ms", uptime: "99.99%" },
    { name: "Discord OAuth", status: "Operational", latency: "142 ms", uptime: "99.96%" },
    { name: "Widget verifier", status: "Degraded", latency: "690 ms", uptime: "98.72%" },
    { name: "Media delivery", status: "Operational", latency: "61 ms", uptime: "99.98%" },
    { name: "Search index", status: "Operational", latency: "93 ms", uptime: "99.94%" },
  ];
  return (
    <div><SectionHeading title="Site health" description="Mock service uptime, latency, incidents, and integration status." action={<Button size="sm" variant="secondary" onPress={() => toast.success("Health checks refreshed")}><RefreshCw className="size-4" />Refresh checks</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Uptime · 30d" value="99.97%" icon={HeartPulse} /><MetricCard label="API latency" value="118 ms" icon={Activity} /><MetricCard label="Error rate" value="0.18%" icon={ShieldAlert} /><MetricCard label="Active incidents" value="1" icon={FileWarning} /></div>
      <Card className="nexus-card mt-4"><Card.Header className="p-5 pb-2"><Card.Title>Services</Card.Title></Card.Header><Card.Content className="divide-y divide-border p-5 pt-2">{systems.map((system) => <div key={system.name} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-semibold">{system.name}</p><p className="text-xs text-muted">{system.latency} average latency</p></div><Chip size="sm" color={system.status === "Operational" ? "success" : "warning"} variant="soft"><Chip.Label>{system.status}</Chip.Label></Chip><p className="text-sm tabular-nums text-muted">{system.uptime}</p></div>)}</Card.Content></Card>
    </div>
  );
}

function AnnouncementsSection({ record }: { record: (action: string, target: string, severity?: AuditEntry["severity"]) => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  function publish() {
    if (!title.trim() || !message.trim()) return toast.warning("Add a title and message");
    record("Published announcement", title);
    toast.success("Announcement published", { description: audience === "all" ? "All users" : audience });
    setTitle(""); setMessage("");
  }
  return (
    <div><SectionHeading title="Global announcements" description="Send platform updates, account alerts, and targeted owner notices." />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="nexus-card-elevated"><Card.Header className="p-5 pb-2"><Card.Title>Compose announcement</Card.Title><Card.Description>Delivered to the Nexbiy inbox.</Card.Description></Card.Header><Card.Content className="space-y-4 p-5 pt-3">
          <TextField value={title} onChange={setTitle}><Label>Title</Label><Input placeholder="Platform safety update" /></TextField>
          <TextField value={message} onChange={setMessage}><Label>Message</Label><TextArea rows={5} placeholder="Write a clear update…" /></TextField>
          <Select selectedKey={audience} onSelectionChange={(key) => setAudience(String(key))}><Label>Audience</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox><ListBox.Item id="all">All users</ListBox.Item><ListBox.Item id="server owners">Server owners</ListBox.Item><ListBox.Item id="bot developers">Bot developers</ListBox.Item><ListBox.Item id="flagged accounts">Flagged accounts</ListBox.Item><ListBox.Item id="moderators">Moderators</ListBox.Item></ListBox></Select.Popover></Select>
          <Button variant="primary" onPress={publish}><Megaphone className="size-4" />Publish</Button>
        </Card.Content></Card>
        <Card className="nexus-card"><Card.Header className="p-5 pb-2"><Card.Title>Recent announcements</Card.Title></Card.Header><Card.Content className="space-y-3 p-5 pt-2">{["Verification eligibility updated", "Referral Rewards available", "Scheduled maintenance complete"].map((item, index) => <div key={item} className="flex gap-3 rounded-xl border border-border p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><BellRing className="size-4" /></span><div><p className="text-sm font-semibold">{item}</p><p className="mt-1 text-xs text-muted">{index + 1} day{index ? "s" : ""} ago · All users</p></div></div>)}</Card.Content></Card>
      </div>
    </div>
  );
}

function AuditSection({ entries }: { entries: AuditEntry[] }) {
  function exportLog() {
    downloadCsv("nexbiy-admin-audit.csv", [["action", "target", "actor", "time", "severity"], ...entries.map((item) => [item.action, item.target, item.actor, item.time, item.severity])]);
  }
  return (
    <div><SectionHeading title="Immutable audit log" description="Every staff decision and high-risk action is recorded for accountability." action={<Button size="sm" variant="secondary" onPress={exportLog}><Download className="size-4" />Export log</Button>} />
      <Card className="nexus-card"><Card.Content className="divide-y divide-border p-5">{entries.map((entry) => <div key={entry.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center"><span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${entry.severity === "Critical" ? "bg-danger/10 text-danger" : entry.severity === "Warning" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"}`}><Activity className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{entry.action}</p><p className="text-xs text-muted">{entry.target} · by {entry.actor}</p></div><Chip size="sm" color={entry.severity === "Critical" ? "danger" : entry.severity === "Warning" ? "warning" : "default"} variant="soft"><Chip.Label>{entry.severity}</Chip.Label></Chip><p className="text-xs text-muted">{entry.time}</p></div>)}</Card.Content></Card>
    </div>
  );
}

function ListingEditModal({ listing, onClose, onSave }: { listing: AdminListing | null; onClose: () => void; onSave: (listing: AdminListing) => void }) {
  const [draft, setDraft] = useState<AdminListing | null>(null);
  const active = draft?.key === listing?.key ? draft : listing;
  function update<K extends keyof AdminListing>(key: K, value: AdminListing[K]) {
    setDraft((current) => {
      const base = current?.key === listing?.key ? current : listing;
      return base ? { ...base, [key]: value } : current;
    });
  }
  return (
    <Modal.Backdrop isOpen={Boolean(listing)} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container size="lg"><Modal.Dialog className="sm:max-w-2xl"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Edit listing</Modal.Heading></Modal.Header>
        <Modal.Body className="space-y-5">{active ? (
          <>
            <div className="rounded-xl border border-border bg-default/30 p-4"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{active.name}</h3><Chip size="sm" variant="soft"><Chip.Label className="capitalize">{active.type}</Chip.Label></Chip><StatusChip status={active.status} /></div><p className="mt-1 text-xs text-muted">Owner: {active.owner} · {active.ownerId}</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><TextField value={active.name} onChange={(value) => update("name", value)}><Label>Listing name</Label><Input /></TextField><TextField value={active.category} onChange={(value) => update("category", value)}><Label>Category</Label><Input /></TextField></div>
            <TextField value={active.description} onChange={(value) => update("description", value)}><Label>Description</Label><TextArea rows={4} /></TextField>
            <p className="rounded-xl border border-border bg-default/25 p-3 text-xs leading-5 text-muted">
              Status, verification, reputation, and featured placement are controlled through the audited quick actions on the listings table.
            </p>
          </>
        ) : null}</Modal.Body>
        <Modal.Footer><Button variant="tertiary" onPress={onClose}>Cancel</Button><Button variant="primary" onPress={() => active && onSave(active)}><Check className="size-4" />Save changes</Button></Modal.Footer>
      </Modal.Dialog></Modal.Container>
    </Modal.Backdrop>
  );
}

function UserHammerModal({ user, onClose, onAction, onProtected }: {
  user: AdminUser | null;
  onClose: () => void;
  onAction: (user: AdminUser, body: Record<string, unknown>, challenge?: string) => Promise<void>;
  onProtected: (action: ProtectedAction) => void;
}) {
  const [duration, setDuration] = useState("24 hours");
  const [notice, setNotice] = useState("");
  const [notification, setNotification] = useState("");
  const [internalNote, setInternalNote] = useState("");

  async function sendNotification() {
    if (!user || notification.trim().length < 3) return toast.warning("Write the notification first");
    await onAction(user, {
      action: "notify",
      title: "Message from Nexbiy staff",
      message: notification.trim(),
      actionUrl: "/dashboard",
    });
    setNotification("");
  }

  async function applyNotice() {
    if (!user || notice.trim().length < 3) return toast.warning("Write the account notice first");
    await onAction(user, {
      action: "notify",
      title: "Account notice",
      message: notice.trim(),
      actionUrl: "/dashboard",
    });
    setNotice("");
  }

  return (
    <Modal.Backdrop isOpen={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container size="lg"><Modal.Dialog className="sm:max-w-4xl"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Moderator hammer</Modal.Heading></Modal.Header>
        <Modal.Body className="space-y-4">{user ? (
          <>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-warning/25 bg-warning/5 p-4">
              <Avatar className="size-12"><Avatar.Image src={user.avatar} alt="" /><Avatar.Fallback>{initials(user.name)}</Avatar.Fallback></Avatar>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{user.name}</h3><UserStatusChip status={user.status} />{user.listingsFrozen ? <Chip size="sm" color="danger" variant="soft"><Chip.Label>Listings frozen</Chip.Label></Chip> : null}</div><p className="mt-1 text-xs text-muted">{user.discordId} · {user.flags} flags · {user.listings} listings</p></div>
              <Gavel className="size-6 text-warning" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border p-4">
                <h4 className="font-semibold">Temporary enforcement</h4><p className="mt-1 text-xs text-muted">Reversible moderator actions for active investigations.</p>
                <Select className="mt-4" selectedKey={duration} onSelectionChange={(key) => setDuration(String(key))}><Label>Suspension duration</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{["1 hour", "6 hours", "24 hours", "3 days", "7 days", "30 days"].map((item) => <ListBox.Item key={item} id={item}>{item}</ListBox.Item>)}</ListBox></Select.Popover></Select>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onPress={() => void onAction(user, {action: user.listingsFrozen ? "unfreeze_listings" : "freeze_listings", reason: user.listingsFrozen ? "Listings returned to review after staff restoration" : "Listings frozen during staff investigation"})}><Pause className="size-4" />{user.listingsFrozen ? "Unfreeze listings" : "Freeze listings"}</Button>
                  <Button size="sm" variant="secondary" onPress={() => void onAction(user, {action: "notify", title: "Account review notice", message: "Your Nexbiy account is currently under staff review.", actionUrl: "/dashboard"})}><ShieldAlert className="size-4" />Send review notice</Button>
                  <Button size="sm" variant="danger" onPress={() => void onAction(user, {action: "suspend", durationHours: duration === "1 hour" ? 1 : duration === "6 hours" ? 6 : duration === "24 hours" ? 24 : duration === "3 days" ? 72 : duration === "7 days" ? 168 : 720, reason: `Account suspended for ${duration} from the admin dashboard`})}><Gavel className="size-4" />Suspend {duration}</Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <h4 className="font-semibold">Case management</h4><p className="mt-1 text-xs text-muted">Build the moderation record and escalate concerning behavior.</p>
                <TextField className="mt-4" value={internalNote} onChange={setInternalNote}><Label>Private moderator note</Label><TextArea rows={3} placeholder="Evidence, observed behavior, or next review step" /></TextField>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onPress={() => { void onAction(user, {action: "flag", reason: internalNote.trim() || "User flagged for staff review"}); setInternalNote(""); }}><Flag className="size-4" />Add flag</Button>
                  <Button size="sm" variant="secondary" onPress={() => { void onAction(user, {action: "flag", reason: internalNote.trim() || "Account escalated for administrator review"}); setInternalNote(""); }}><UserCog className="size-4" />Escalate to admin</Button>
                  <Button size="sm" variant="secondary" onPress={() => void onAction(user, {action: "restore", reason: "Account restrictions restored after staff review"})}><RefreshCw className="size-4" />Restore account</Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <h4 className="font-semibold">Account notice</h4><p className="mt-1 text-xs text-muted">Persistent text displayed inside the user’s Nexbiy account.</p>
                <TextField className="mt-4" value={notice} onChange={setNotice}><Label>Notice content</Label><TextArea rows={3} placeholder="Explain the issue, expected action, and appeal path." /></TextField>
                <Button className="mt-3" size="sm" variant="secondary" onPress={() => void applyNotice()}><BellRing className="size-4" />Apply account notice</Button>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <h4 className="font-semibold">Send notification</h4><p className="mt-1 text-xs text-muted">Choose the exact message delivered to the user’s Nexbiy inbox.</p>
                <TextField className="mt-4" value={notification} onChange={setNotification}><Label>Notification content</Label><TextArea rows={3} placeholder="Write the custom moderation message…" /></TextField>
                <Button className="mt-3" size="sm" variant="primary" onPress={() => void sendNotification()}><BellRing className="size-4" />Send notification</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-danger/25 bg-danger/5 p-4">
              <div><h4 className="font-semibold text-danger">Administrator-only actions</h4><p className="mt-1 text-xs text-muted">Permanent actions require confirmation text and the administrator’s 2FA code.</p></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="danger" onPress={() => onProtected({ title: "Indefinitely suspend user", description: `${user.name}'s account and listings will be locked until an administrator restores them.`, confirmation: user.name, scope: "ban_user", run: (challenge) => onAction(user, {action: "ban", reason: "Indefinite administrator suspension"}, challenge) })}><Ban className="size-4" />Indefinite suspension</Button>
                <Button size="sm" variant="danger" onPress={() => onProtected({ title: "Delete user data", description: `Delete ${user.name}'s profile and remove their listings from Nexbiy.`, confirmation: user.name, scope: "delete_user", run: (challenge) => onAction(user, {action: "delete_user", reason: "User data deleted by a super administrator"}, challenge) })}><Trash2 className="size-4" />Delete user data</Button>
              </div>
            </div>
          </>
        ) : null}</Modal.Body>
        <Modal.Footer><Button variant="tertiary" onPress={onClose}>Close workspace</Button></Modal.Footer>
      </Modal.Dialog></Modal.Container>
    </Modal.Backdrop>
  );
}

function UserInspectModal({ user, onClose }: {
  user: AdminUser | null;
  onClose: () => void;
}) {
  return (
    <Modal.Backdrop isOpen={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container size="lg"><Modal.Dialog className="sm:max-w-3xl"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>User inspection</Modal.Heading></Modal.Header>
        <Modal.Body className="space-y-4">{user ? (
          <>
            <div className="flex items-center gap-4 rounded-2xl border border-border p-4"><Avatar className="size-14"><Avatar.Image src={user.avatar} alt="" /><Avatar.Fallback>{initials(user.name)}</Avatar.Fallback></Avatar><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">{user.name}</h3><UserStatusChip status={user.status} /></div><p className="text-sm text-muted">{user.handle} · {user.online ? "Online now" : "Offline"}</p></div></div>
            <div className="grid gap-3 sm:grid-cols-2"><InfoCell label="Nexbiy user ID" value={user.id} /><InfoCell label="Discord ID" value={user.discordId} /><InfoCell label="Listings" value={String(user.listings)} /><InfoCell label="Joined" value={user.joined} /><InfoCell label="Longest activity" value={user.longestActivity} /><InfoCell label="Previous suspension" value={user.suspendedBefore ? "Yes" : "No"} /></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm font-semibold">Moderation record</p><p className="mt-1 text-sm text-muted">{user.flags} account flag{user.flags === 1 ? "" : "s"} · {user.notice}</p></div>
            {user.role === "CEO" ? <div className="rounded-xl border border-accent/25 bg-accent/5 p-4 text-sm text-muted">The CEO account cannot be restricted from this workspace.</div> : null}
          </>
        ) : null}</Modal.Body>
        <Modal.Footer><Button variant="tertiary" onPress={onClose}>Close</Button></Modal.Footer>
      </Modal.Dialog></Modal.Container>
    </Modal.Backdrop>
  );
}

function ReportInspectModal({ report, onClose, onPriority, onNotify }: {
  report: AdminReport | null;
  onClose: () => void;
  onPriority: (report: AdminReport, priority: Urgency) => void;
  onNotify: (report: AdminReport) => void;
}) {
  return (
    <Modal.Backdrop isOpen={Boolean(report)} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container size="lg"><Modal.Dialog className="sm:max-w-2xl"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Report investigation</Modal.Heading></Modal.Header>
        <Modal.Body className="space-y-4">{report ? (
          <>
            <div className="rounded-2xl border border-border bg-default/30 p-4"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{report.target}</h3><Chip size="sm" color={priorityColor(report.priority)} variant="soft"><Chip.Label>{report.priority}</Chip.Label></Chip></div><p className="mt-1 text-sm text-muted">{report.category} · reported by {report.reporter}</p></div>
            <div><p className="text-sm font-semibold">Reason</p><p className="mt-1 text-sm text-muted">{report.reason}</p></div>
            <div><p className="text-sm font-semibold">Reporter context</p><p className="mt-1 rounded-xl border border-border p-3 text-sm leading-6 text-muted">{report.context}</p></div>
            <div className="grid gap-3 sm:grid-cols-3"><InfoCell label="Owner ID" value={report.ownerId} /><InfoCell label="Listing status" value="Live" /><InfoCell label="Report age" value={report.age} /></div>
            <LinkButton href={report.targetType === "server" ? `/server/${report.targetSlug}` : `/bots/${report.targetSlug}`} target="_blank" variant="secondary"><Eye className="size-4" />Open reported listing</LinkButton>
            <div><p className="mb-2 text-sm font-semibold">Set urgency</p><div className="flex flex-wrap gap-2">{(["Low", "Medium", "High", "Urgent"] as Urgency[]).map((priority) => <Button key={priority} size="sm" variant={report.priority === priority ? "primary" : "secondary"} onPress={() => onPriority(report, priority)}>{priority}</Button>)}</div></div>
          </>
        ) : null}</Modal.Body>
        <Modal.Footer><Button variant="tertiary" onPress={onClose}>Close</Button>{report ? <Button variant="primary" onPress={() => onNotify(report)}><BellRing className="size-4" />Notify reporter</Button> : null}</Modal.Footer>
      </Modal.Dialog></Modal.Container>
    </Modal.Backdrop>
  );
}

function ProtectedActionModal({ action, onClose }: { action: ProtectedAction | null; onClose: () => void }) {
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function confirm() {
    if (!action || confirmation !== action.confirmation || !/^\d{6}$/.test(code)) {
      return toast.danger("2FA confirmation failed", {description: "Check the authenticator code and confirmation text."});
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/mfa/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({code, scope: action.scope}),
      });
      const result = await response.json() as {challenge?: string; error?: string};
      if (!response.ok || !result.challenge) {
        const description = result.error === "mfa_enrollment_required"
          ? "Enroll an authenticator from the staff security setup before using protected actions."
          : "The authenticator code is invalid or expired.";
        throw new Error(description);
      }
      await action.run(result.challenge);
      setCode("");
      setConfirmation("");
      onClose();
    } catch (error) {
      toast.danger("Protected action failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Modal.Backdrop isOpen={Boolean(action)} isDismissable={false}>
      <Modal.Container size="md"><Modal.Dialog><Modal.CloseTrigger onPress={onClose} /><Modal.Header><Modal.Heading>{action?.title}</Modal.Heading></Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="flex gap-3 rounded-xl border border-danger/25 bg-danger/5 p-4"><ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" /><div><p className="text-sm font-semibold">Protected administrator action</p><p className="mt-1 text-sm leading-6 text-muted">{action?.description}</p></div></div>
          <TextField value={confirmation} onChange={setConfirmation}><Label>Type “{action?.confirmation}” to confirm</Label><Input /></TextField>
          <TextField value={code} onChange={setCode}><Label>Administrator 2FA code</Label><Input type="password" inputMode="numeric" placeholder="6-digit code" /></TextField>
          <p className="text-xs text-muted">Enter the current code from the authenticator connected to your Nexbiy staff account.</p>
        </Modal.Body>
        <Modal.Footer><Button variant="tertiary" isDisabled={isSubmitting} onPress={onClose}>Cancel</Button><Button variant="danger" isPending={isSubmitting} onPress={() => void confirm()}><LockKeyhole className="size-4" />Confirm protected action</Button></Modal.Footer>
      </Modal.Dialog></Modal.Container>
    </Modal.Backdrop>
  );
}

function MfaSetupModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || secret) return;
    setIsLoading(true);
    void fetch("/api/admin/mfa/enroll", {method: "POST"})
      .then(async (response) => {
        const payload = await response.json() as {secret?: string; error?: string};
        if (!response.ok || !payload.secret) throw new Error(payload.error || "mfa_enrollment_failed");
        setSecret(payload.secret);
      })
      .catch((error) => {
        toast.danger("Could not start 2FA setup", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
        onClose();
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, onClose, secret]);

  async function verify() {
    if (!/^\d{6}$/.test(code)) {
      toast.danger("Enter the 6-digit code from your authenticator");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/mfa/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({code, scope: "mfa_enrollment"}),
      });
      const payload = await response.json() as {error?: string};
      if (!response.ok) throw new Error(payload.error || "invalid_mfa_code");
      setCode("");
      onComplete();
    } catch (error) {
      toast.danger("Authenticator code was not accepted", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal.Backdrop isOpen={isOpen} isDismissable={false}>
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.CloseTrigger onPress={onClose} />
          <Modal.Header>
            <Modal.Heading>Set up administrator 2FA</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="space-y-4">
            <div className="rounded-2xl border border-border bg-default/30 p-4">
              <p className="text-sm font-semibold">1. Add Nexbiy to your authenticator</p>
              <p className="mt-1 text-xs leading-5 text-muted">Choose manual setup in your authenticator app and enter this private key.</p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background p-3">
                <code className="min-w-0 flex-1 break-all text-sm font-semibold tracking-wide">
                  {isLoading && !secret ? "Creating secure key…" : secret}
                </code>
                <Button
                  isIconOnly
                  aria-label="Copy authenticator key"
                  size="sm"
                  variant="tertiary"
                  isDisabled={!secret}
                  onPress={() => {
                    void navigator.clipboard.writeText(secret);
                    toast.success("Authenticator key copied");
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <TextField value={code} onChange={setCode}>
              <Label>2. Enter the current 6-digit code</Label>
              <Input inputMode="numeric" autoComplete="one-time-code" placeholder="000000" />
            </TextField>
            <p className="text-xs leading-5 text-muted">Keep this key private. Protected moderation and deletion actions will require a fresh authenticator code.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" isDisabled={isLoading} onPress={onClose}>Close</Button>
            <Button variant="primary" isPending={isLoading} onPress={() => void verify()}>
              <ShieldCheck className="size-4" />
              Enable 2FA
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function StatusChip({ status }: { status: ListingStatus }) {
  return <Chip size="sm" color={status === "Live" ? "success" : status === "Pending review" ? "warning" : status === "Suspended" || status === "Rejected" ? "danger" : "default"} variant="soft"><Chip.Label>{status}</Chip.Label></Chip>;
}

function UserStatusChip({ status }: { status: UserStatus }) {
  return <Chip size="sm" color={status === "Active" ? "success" : status === "Restricted" ? "warning" : "danger"} variant="soft"><Chip.Label>{status}</Chip.Label></Chip>;
}

function TrustChip({ value }: { value: number }) {
  return <Chip size="sm" color={value >= 90 ? "success" : value >= 75 ? "warning" : "danger"} variant="soft"><Chip.Label>{value}/100</Chip.Label></Chip>;
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return <Card className="nexus-card-elevated"><Card.Content className="flex items-center gap-4 p-5"><span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="size-5" /></span><div><p className="text-sm text-muted">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p></div></Card.Content></Card>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-default/40 p-3"><p className="text-xs text-muted">{label}</p><p className="mt-1 font-bold tabular-nums">{value}</p></div>;
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-default/30 p-3"><p className="text-[11px] font-medium text-muted">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>;
}

function ActionCard({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return <div className="rounded-xl border border-border p-4"><span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="size-4" /></span><p className="mt-3 text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted">{detail}</p></div>;
}

function QuickControl({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  return <Button variant="secondary" className="justify-start" onPress={onPress}><Icon className="size-4" />{label}<ChevronRight className="ml-auto size-4" /></Button>;
}

function EmptyState({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return <Card className="nexus-card"><Card.Content className="flex min-h-56 flex-col items-center justify-center p-8 text-center"><Icon className="size-8 text-success" /><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-sm text-muted">{detail}</p></Card.Content></Card>;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
