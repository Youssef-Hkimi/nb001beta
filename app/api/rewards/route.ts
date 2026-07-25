import {NextRequest} from "next/server";

import {apiErrorResponse, requireSession} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const db = getSupabaseAdmin();
    const day = new Date().toISOString().slice(0, 10);
    const {data: existingReferralCode, error: referralCodeError} = await db
      .from("referral_codes")
      .select("code,is_active,suspended_at")
      .eq("owner_id", session.userId)
      .maybeSingle();
    if (referralCodeError) throw referralCodeError;
    let referralCode = existingReferralCode;
    if (!referralCode) {
      const base = session.user.username
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 20) || "member";
      const code = `${base}-${session.userId.replace(/-/g, "").slice(0, 6)}`;
      const {data, error} = await db
        .from("referral_codes")
        .insert({owner_id: session.userId, code})
        .select("code,is_active,suspended_at")
        .single();
      if (error) throw error;
      referralCode = data;
    }
    const [{data: balance}, {data: referrals}, {data: allocations}, {data: listings}] = await Promise.all([
      db.from("growth_point_balances").select("*").eq("user_id", session.userId).maybeSingle(),
      db.from("referral_events")
        .select("id,status,risk_score,qualified_at,created_at,receiver:profiles!referral_events_receiver_id_fkey(username,display_name,avatar_url)")
        .eq("referrer_id", session.userId)
        .order("created_at", {ascending: false})
        .limit(100),
      db.from("growth_point_allocations")
        .select("points")
        .eq("user_id", session.userId)
        .eq("allocation_day", day),
      db.from("listings")
        .select("id,name,type,status")
        .eq("owner_id", session.userId)
        .eq("status", "live")
        .order("name"),
    ]);
    const spentToday = (allocations || []).reduce((sum, row) => sum + row.points, 0);
    return Response.json({
      balance: balance || {issued_points: 0, allocated_points: 0, available_points: 0},
      dailyRemaining: Math.max(0, 10 - spentToday),
      referralCode,
      referrals: referrals || [],
      listings: listings || [],
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
