import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const allocationSchema = z.object({
  listingId: z.string().uuid(),
  points: z.number().int().min(1).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    await enforceRateLimit(request, "allocate-growth-points", 20, 24 * 60 * 60, session.userId);
    const parsed = allocationSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({error: "invalid_allocation"}, {status: 400});
    const db = getSupabaseAdmin();
    const {data: listing} = await db
      .from("listings")
      .select("id")
      .eq("id", parsed.data.listingId)
      .eq("owner_id", session.userId)
      .eq("status", "live")
      .maybeSingle();
    if (!listing) throw new ApiError(404, "eligible_listing_not_found");
    const {data, error} = await db
      .from("growth_point_allocations")
      .insert({
        user_id: session.userId,
        listing_id: parsed.data.listingId,
        points: parsed.data.points,
      })
      .select("*")
      .single();
    if (error?.message.includes("daily_growth_point_limit")) {
      throw new ApiError(409, "daily_growth_point_limit");
    }
    if (error?.message.includes("insufficient_growth_points")) {
      throw new ApiError(409, "insufficient_growth_points");
    }
    if (error) throw error;
    return Response.json({allocation: data}, {status: 201});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
