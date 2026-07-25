import {NextRequest} from "next/server";

import {apiErrorResponse, requireSession} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EventRow = {event_type: string; occurred_at: string};

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const days = Math.min(Math.max(Number(request.nextUrl.searchParams.get("days")) || 30, 7), 90);
    const now = new Date();
    const currentStart = new Date(now.getTime() - days * 86_400_000);
    const previousStart = new Date(currentStart.getTime() - days * 86_400_000);
    const db = getSupabaseAdmin();

    const [{data: listings, error: listingsError}, {data: profile, error: profileError}] = await Promise.all([
      db
        .from("listings")
        .select("id,status,views_count,clicks_count,votes_count")
        .eq("owner_id", session.userId)
        .neq("status", "deleted"),
      db
        .from("profiles")
        .select("notification_preferences")
        .eq("id", session.userId)
        .maybeSingle(),
    ]);
    if (listingsError) throw listingsError;
    if (profileError) throw profileError;

    const listingRows = listings || [];
    const listingIds = listingRows.map((listing) => listing.id);
    let events: EventRow[] = [];
    let media: {listing_id: string; kind: string}[] = [];

    if (listingIds.length) {
      const [{data: eventRows, error: eventsError}, {data: mediaRows, error: mediaError}] = await Promise.all([
        db
          .from("analytics_events")
          .select("event_type,occurred_at")
          .in("listing_id", listingIds)
          .gte("occurred_at", previousStart.toISOString())
          .order("occurred_at")
          .limit(20_000),
        db
          .from("listing_media")
          .select("listing_id,kind")
          .in("listing_id", listingIds),
      ]);
      if (eventsError) throw eventsError;
      if (mediaError) throw mediaError;
      events = (eventRows || []) as EventRow[];
      media = mediaRows || [];
    }

    const currentEvents = events.filter((event) => new Date(event.occurred_at) >= currentStart);
    const previousEvents = events.filter((event) => {
      const occurredAt = new Date(event.occurred_at);
      return occurredAt >= previousStart && occurredAt < currentStart;
    });
    const count = (rows: EventRow[], eventTypes: string[]) =>
      rows.filter((event) => eventTypes.includes(event.event_type)).length;

    const currentViews = count(currentEvents, ["view"]);
    const currentClicks = count(currentEvents, ["invite_click"]);
    const currentInteractions = count(currentEvents, ["invite_click", "link_copy", "vote"]);
    const previousViews = count(previousEvents, ["view"]);
    const previousClicks = count(previousEvents, ["invite_click"]);
    const previousInteractions = count(previousEvents, ["invite_click", "link_copy", "vote"]);

    const series = Array.from({length: days}, (_, index) => {
      const date = new Date(currentStart);
      date.setUTCDate(date.getUTCDate() + index + 1);
      const key = dateKey(date);
      const dayEvents = currentEvents.filter((event) => event.occurred_at.slice(0, 10) === key);
      return {
        date: key,
        views: count(dayEvents, ["view"]),
        clicks: count(dayEvents, ["invite_click"]),
        interactions: count(dayEvents, ["invite_click", "link_copy", "vote"]),
      };
    });

    const lifetimeViews = listingRows.reduce((sum, listing) => sum + Number(listing.views_count || 0), 0);
    const lifetimeClicks = listingRows.reduce((sum, listing) => sum + Number(listing.clicks_count || 0), 0);
    const lifetimeVotes = listingRows.reduce((sum, listing) => sum + Number(listing.votes_count || 0), 0);
    const liveCount = listingRows.filter(
      (listing) => listing.status === "live" || listing.status === "pending_review",
    ).length;
    const draftCount = listingRows.filter((listing) => listing.status === "draft").length;
    const mediaByListing = new Map<string, Set<string>>();
    for (const item of media) {
      const kinds = mediaByListing.get(item.listing_id) || new Set<string>();
      kinds.add(item.kind);
      mediaByListing.set(item.listing_id, kinds);
    }
    const hasCompleteMedia = [...mediaByListing.values()].some(
      (kinds) => kinds.has("icon") && kinds.has("banner"),
    );
    const preferences = (profile?.notification_preferences || {}) as Record<string, boolean>;

    return Response.json({
      rangeDays: days,
      totals: {
        views: lifetimeViews,
        inviteClicks: lifetimeClicks,
        votes: lifetimeVotes,
        listings: listingRows.length,
        live: liveCount,
        drafts: draftCount,
        conversionRate: lifetimeViews ? Math.round((lifetimeClicks / lifetimeViews) * 1000) / 10 : 0,
      },
      period: {
        views: currentViews,
        clicks: currentClicks,
        interactions: currentInteractions,
        deltas: {
          views: percentChange(currentViews, previousViews),
          clicks: percentChange(currentClicks, previousClicks),
          interactions: percentChange(currentInteractions, previousInteractions),
        },
      },
      series,
      onboarding: {
        notifications: Boolean(preferences.inbox),
        listing: listingRows.length > 0,
        media: hasCompleteMedia,
        votes: lifetimeVotes >= 10,
      },
    }, {headers: {"Cache-Control": "no-store"}});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
