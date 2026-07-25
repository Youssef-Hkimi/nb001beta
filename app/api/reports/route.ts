import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const reportSchema = z.object({
  listingId: z.string().uuid().optional(),
  reportedUserId: z.string().uuid().optional(),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(2000),
}).refine((value) => value.listingId || value.reportedUserId, {
  message: "A listing or user is required",
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    await enforceRateLimit(request, "create-report", 5, 60 * 60, session.userId);
    const {data, error} = await getSupabaseAdmin()
      .from("reports")
      .select("id,listing_id,reported_user_id,category,description,status,severity,created_at,updated_at")
      .eq("reporter_id", session.userId)
      .order("created_at", {ascending: false})
      .limit(50);
    if (error) throw error;
    return Response.json({reports: data});
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const parsed = reportSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({error: "invalid_report"}, {status: 400});
    const db = getSupabaseAdmin();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const {count} = await db
      .from("reports")
      .select("id", {count: "exact", head: true})
      .eq("reporter_id", session.userId)
      .gte("created_at", oneHourAgo);
    if ((count || 0) >= 5) throw new ApiError(429, "report_rate_limit");
    const {data, error} = await db
      .from("reports")
      .insert({
        reporter_id: session.userId,
        listing_id: parsed.data.listingId || null,
        reported_user_id: parsed.data.reportedUserId || null,
        category: parsed.data.category,
        description: parsed.data.description,
      })
      .select("id,status,created_at")
      .single();
    if (error) throw error;
    return Response.json({report: data}, {status: 201});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
