import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {enforceRateLimit, getRequestFingerprint} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const acceptSchema = z.object({code: z.string().trim().min(3).max(32)});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    await enforceRateLimit(request, "accept-referral", 5, 24 * 60 * 60, session.userId);
    const parsed = acceptSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({error: "invalid_referral"}, {status: 400});
    const db = getSupabaseAdmin();
    const {data: code} = await db
      .from("referral_codes")
      .select("id,owner_id,is_active,suspended_at")
      .eq("code", parsed.data.code)
      .maybeSingle();
    if (!code || !code.is_active || code.suspended_at) throw new ApiError(404, "referral_not_available");
    if (code.owner_id === session.userId) throw new ApiError(409, "self_referral_not_allowed");
    const fingerprint = getRequestFingerprint(request);
    const {data: reusedFingerprint} = await db
      .from("referral_events")
      .select("id")
      .eq("receiver_fingerprint_hash", fingerprint.ipHash)
      .neq("receiver_id", session.userId)
      .limit(1);
    const riskReasons = reusedFingerprint?.length ? ["shared_network_fingerprint"] : [];
    const riskScore = riskReasons.length ? 45 : 0;
    const {data, error} = await db
      .from("referral_events")
      .insert({
        code_id: code.id,
        referrer_id: code.owner_id,
        receiver_id: session.userId,
        receiver_fingerprint_hash: fingerprint.ipHash,
        risk_score: riskScore,
        risk_reasons: riskReasons,
      })
      .select("id,status,risk_score,created_at")
      .single();
    if (error?.code === "23505") throw new ApiError(409, "referral_already_used");
    if (error) throw error;
    return Response.json({referral: data}, {status: 201});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
