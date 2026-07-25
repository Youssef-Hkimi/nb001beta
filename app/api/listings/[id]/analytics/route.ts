import {NextRequest} from "next/server";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const session = await requireSession(request);
    const {id} = await context.params;
    const days = Math.min(Math.max(Number(request.nextUrl.searchParams.get("days")) || 30, 1), 90);
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const db = getSupabaseAdmin();
    const {data: listing, error: listingError} = await db
      .from("listings")
      .select("id,views_count,clicks_count,votes_count")
      .eq("id", id)
      .eq("owner_id", session.userId)
      .neq("status", "deleted")
      .maybeSingle();
    if (listingError) throw listingError;
    if (!listing) throw new ApiError(404, "listing_not_found");

    const {data: events, error} = await db
      .from("analytics_events")
      .select("event_type,occurred_at")
      .eq("listing_id", id)
      .gte("occurred_at", since)
      .order("occurred_at")
      .limit(10_000);
    if (error) throw error;
    const byDay = new Map<string, {date: string; views: number; inviteClicks: number; linkCopies: number; votes: number}>();
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - offset);
      const key = date.toISOString().slice(0, 10);
      byDay.set(key, {date: key, views: 0, inviteClicks: 0, linkCopies: 0, votes: 0});
    }
    for (const event of events || []) {
      const date = event.occurred_at.slice(0, 10);
      const point = byDay.get(date) || {date, views: 0, inviteClicks: 0, linkCopies: 0, votes: 0};
      if (event.event_type === "view") point.views += 1;
      if (event.event_type === "invite_click") point.inviteClicks += 1;
      if (event.event_type === "link_copy") point.linkCopies += 1;
      if (event.event_type === "vote") point.votes += 1;
      byDay.set(date, point);
    }
    return Response.json({
      totals: {
        views: listing.views_count,
        inviteClicks: listing.clicks_count,
        votes: listing.votes_count,
        linkCopies: (events || []).filter((event) => event.event_type === "link_copy").length,
      },
      series: [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)),
      days,
    }, {headers: {"Cache-Control": "no-store"}});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
