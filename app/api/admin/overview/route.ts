import {NextRequest} from "next/server";

import {apiErrorResponse, requireStaff} from "@/lib/server/auth";
import {addPublicMediaUrls} from "@/lib/server/listing-media";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function relativeTime(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function roleLabel(role: string) {
  if (role === "super_admin") return "CEO";
  if (role === "admin") return "Admin";
  if (role === "moderator") return "Moderator";
  return "Owner";
}

const RANGE_WINDOWS = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);
    const db = getSupabaseAdmin();
    const [
      listingResult,
      profileResult,
      discordResult,
      reportResult,
      moderationResult,
      auditResult,
      analyticsResult,
    ] = await Promise.all([
      db
        .from("listings")
        .select("*,listing_media(*)")
        .is("deleted_at", null)
        .order("updated_at", {ascending: false})
        .limit(500),
      db.from("profiles").select("*").neq("status", "deleted").order("joined_at", {ascending: false}).limit(500),
      db.from("discord_accounts").select("*").limit(500),
      db.from("reports").select("*").order("created_at", {ascending: false}).limit(500),
      db
        .from("moderation_cases")
        .select("*")
        .in("status", ["open", "reviewing", "escalated"])
        .order("created_at", {ascending: false})
        .limit(100),
      db.from("admin_audit_log").select("*").order("created_at", {ascending: false}).limit(100),
      db
        .from("analytics_events")
        .select("event_type,occurred_at")
        .gte("occurred_at", new Date(Date.now() - RANGE_WINDOWS["30d"]).toISOString())
        .order("occurred_at", {ascending: true})
        .limit(20_000),
    ]);

    for (const result of [
      listingResult,
      profileResult,
      discordResult,
      reportResult,
      moderationResult,
      auditResult,
      analyticsResult,
    ]) {
      if (result.error) throw result.error;
    }

    const rawListings = listingResult.data || [];
    const profiles = profileResult.data || [];
    const discordAccounts = discordResult.data || [];
    const rawReports = reportResult.data || [];
    const analyticsEvents = analyticsResult.data || [];
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
    const discordByUserId = new Map(discordAccounts.map((account) => [account.user_id, account]));
    const listingById = new Map(rawListings.map((listing) => [listing.id, listing]));
    const reportCountByListing = new Map<string, number>();
    const listingCountByOwner = new Map<string, number>();

    for (const listing of rawListings) {
      listingCountByOwner.set(listing.owner_id, (listingCountByOwner.get(listing.owner_id) || 0) + 1);
    }
    for (const report of rawReports) {
      if (report.listing_id) {
        reportCountByListing.set(report.listing_id, (reportCountByListing.get(report.listing_id) || 0) + 1);
      }
    }

    const listings = await Promise.all(rawListings.map(async (listing) => {
      const owner = profileById.get(listing.owner_id);
      const withMedia = addPublicMediaUrls(listing);
      const status = listing.status === "pending_review" || listing.status === "draft"
        ? "Pending review"
        : titleCase(listing.status);
      return {
        key: listing.id,
        slug: listing.slug,
        name: listing.name,
        type: listing.type,
        description: listing.short_description,
        category: listing.category,
        owner: owner?.display_name || owner?.username || "Unknown owner",
        ownerId: listing.owner_id,
        status,
        verified: listing.verified_badge,
        safeBadge: listing.safe_badge,
        featured: listing.featured,
        placement: listing.featured_rank,
        reach: listing.type === "server" ? listing.member_count : listing.active_server_count,
        trust: Number(listing.reputation_score || 0),
        created: new Date(listing.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        updated: relativeTime(listing.updated_at),
        reports: reportCountByListing.get(listing.id) || 0,
        votes: {"1h": 0, "6h": 0, "24h": Number(listing.votes_count || 0)},
        iconUrl: withMedia.listing_media?.find((media: {kind: string; url?: string}) => media.kind === "icon")?.url || null,
      };
    }));

    const users = profiles.map((profile) => {
      const discord = discordByUserId.get(profile.id);
      const isOnline = Date.now() - new Date(profile.last_seen_at).getTime() < 15 * 60_000;
      return {
        id: profile.id,
        discordId: discord?.discord_user_id || "Not linked",
        name: profile.display_name,
        handle: `@${profile.username}`,
        avatar: profile.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png",
        role: roleLabel(profile.role),
        status: profile.status === "suspended" ? "Suspended" : "Active",
        listings: listingCountByOwner.get(profile.id) || 0,
        joined: new Date(profile.joined_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        longestActivity: relativeTime(profile.last_seen_at),
        online: isOnline,
        flags: rawReports.filter((report) => report.reported_user_id === profile.id).length,
        suspendedBefore: profile.status === "suspended",
        notice: profile.status === "suspended" ? "Account suspended" : "None",
        listingsFrozen: rawListings.some(
          (listing) => listing.owner_id === profile.id && listing.status === "suspended",
        ),
      };
    });

    const reports = rawReports.map((report) => {
      const listing = report.listing_id ? listingById.get(report.listing_id) : null;
      const reporter = profileById.get(report.reporter_id);
      const targetProfile = report.reported_user_id ? profileById.get(report.reported_user_id) : null;
      const ageHours = Math.max(0, (Date.now() - new Date(report.created_at).getTime()) / 3_600_000);
      return {
        id: report.id,
        target: listing?.name || targetProfile?.display_name || "Removed target",
        targetSlug: listing?.slug || "",
        targetType: listing?.type || "server",
        ownerId: listing?.owner_id || report.reported_user_id || "",
        reason: report.category,
        category: report.category,
        context: report.description,
        reporter: reporter ? `@${reporter.username}` : "Unknown reporter",
        priority: titleCase(report.severity),
        ageHours,
        age: relativeTime(report.created_at),
        status: report.status === "triaged" || report.status === "investigating"
          ? "Flagged"
          : report.status === "resolved" || report.status === "dismissed"
            ? "Passed"
            : "Open",
      };
    });

    const moderation = (moderationResult.data || []).map((item) => ({
      id: item.id,
      title: item.summary,
      kind: item.listing_id ? "Listing safety" : "User safety",
      urgency: titleCase(item.severity),
      requestedBy: item.assigned_to
        ? profileById.get(item.assigned_to)?.display_name || "Staff"
        : "Unassigned",
      age: relativeTime(item.created_at),
    }));

    const audit = (auditResult.data || []).map((entry) => ({
      id: String(entry.id),
      action: titleCase(entry.action),
      target: entry.target_id || entry.target_type,
      actor: entry.actor_id
        ? profileById.get(entry.actor_id)?.display_name || "Staff"
        : "System",
      time: relativeTime(entry.created_at),
      severity: /delete|suspend/i.test(entry.action)
        ? "Critical"
        : /status|report|feature|badge/i.test(entry.action)
          ? "Warning"
          : "Info",
    }));

    const rangeMetrics = Object.fromEntries(
      Object.entries(RANGE_WINDOWS).map(([range, duration]) => {
        const start = Date.now() - duration;
        const events = analyticsEvents.filter(
          (event) => new Date(event.occurred_at).getTime() >= start,
        );
        const rangeReports = rawReports.filter(
          (report) => new Date(report.created_at).getTime() >= start,
        );
        const rangeProfiles = profiles.filter(
          (profile) => new Date(profile.joined_at).getTime() >= start,
        );
        const points = Array.from({length: 12}, (_, index) => {
          const bucketStart = start + (duration * index) / 12;
          const bucketEnd = start + (duration * (index + 1)) / 12;
          return events.filter((event) => {
            const timestamp = new Date(event.occurred_at).getTime();
            return timestamp >= bucketStart && timestamp < bucketEnd;
          }).length;
        });
        const peak = Math.max(1, ...points);

        return [range, {
          visits: events.filter((event) => event.event_type === "view").length,
          actions: events.filter((event) => event.event_type !== "view").length,
          reports: rangeReports.length,
          signups: rangeProfiles.length,
          points: points.map((value) => Math.max(value ? 8 : 0, Math.round((value / peak) * 100))),
        }];
      }),
    );

    return Response.json({
      counts: {
        liveListings: rawListings.filter((listing) => listing.status === "live").length,
        platformUsers: profiles.filter((profile) => profile.status === "active").length,
        openReports: rawReports.filter((report) => ["open", "triaged", "investigating"].includes(report.status)).length,
        verificationQueue: rawListings.filter((listing) => listing.status === "pending_review").length,
        moderationQueue: moderation.length,
      },
      listings,
      users,
      reports,
      moderation,
      audit,
      rangeMetrics,
    }, {
      headers: {"Cache-Control": "private, no-store"},
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
