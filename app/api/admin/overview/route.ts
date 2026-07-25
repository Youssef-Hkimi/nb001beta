import {NextRequest} from "next/server";

import {apiErrorResponse, requireStaff} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);
    const db = getSupabaseAdmin();
    const [
      liveListings,
      platformUsers,
      openReports,
      reviewQueue,
      moderationQueue,
    ] = await Promise.all([
      db.from("listings").select("id", {count: "exact", head: true}).eq("status", "live"),
      db.from("profiles").select("id", {count: "exact", head: true}).eq("status", "active"),
      db.from("reports").select("id", {count: "exact", head: true}).in("status", ["open", "triaged", "investigating"]),
      db.from("listings").select("id", {count: "exact", head: true}).eq("status", "pending_review"),
      db.from("moderation_cases").select("id", {count: "exact", head: true}).in("status", ["open", "reviewing", "escalated"]),
    ]);
    return Response.json({
      liveListings: liveListings.count || 0,
      platformUsers: platformUsers.count || 0,
      openReports: openReports.count || 0,
      verificationQueue: reviewQueue.count || 0,
      moderationQueue: moderationQueue.count || 0,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
