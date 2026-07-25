import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const schema = z.object({action: z.enum(["pause", "resume"])});

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const session = await requireSession(request);
    const {id} = await context.params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(400, "invalid_listing_action");

    const db = getSupabaseAdmin();
    const {data: listing, error: readError} = await db
      .from("listings")
      .select("id,status")
      .eq("id", id)
      .eq("owner_id", session.userId)
      .neq("status", "deleted")
      .maybeSingle();
    if (readError) throw readError;
    if (!listing) throw new ApiError(404, "listing_not_found");

    const nextStatus = parsed.data.action === "pause"
      ? "paused"
      : listing.status === "paused"
        ? "pending_review"
        : listing.status;
    const {data, error} = await db
      .from("listings")
      .update({status: nextStatus})
      .eq("id", id)
      .eq("owner_id", session.userId)
      .select("*")
      .single();
    if (error) throw error;
    return Response.json({listing: data});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
