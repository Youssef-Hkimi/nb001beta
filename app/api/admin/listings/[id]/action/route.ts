import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError, requireStaff} from "@/lib/server/auth";
import {auditAdminAction, requireAdminChallenge} from "@/lib/server/admin-security";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("edit_listing"),
    name: z.string().trim().min(2).max(100),
    shortDescription: z.string().trim().min(10).max(240),
    category: z.string().trim().min(2).max(80),
    reason: z.string().trim().min(3).max(2000),
  }),
  z.object({
    action: z.literal("set_status"),
    status: z.enum(["pending_review", "live", "paused", "suspended", "rejected", "deleted"]),
    reason: z.string().trim().min(3).max(2000),
  }),
  z.object({
    action: z.enum(["verified_badge", "safe_badge", "featured"]),
    enabled: z.boolean(),
    reason: z.string().trim().min(3).max(2000),
  }),
  z.object({
    action: z.literal("adjust_votes"),
    amount: z.number().int().min(-10).max(10).refine((amount) => amount !== 0),
    reason: z.string().trim().min(3).max(2000),
  }),
]);

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const session = await requireStaff(request);
    await enforceRateLimit(request, "admin-listing-action", 60, 60, session.userId);
    const {id} = await context.params;
    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({error: "invalid_admin_action"}, {status: 400});
    const input = parsed.data;
    const db = getSupabaseAdmin();
    let patch: Record<string, unknown> = {};

    if (input.action === "edit_listing") {
      patch = {
        name: input.name,
        short_description: input.shortDescription,
        category: input.category,
      };
    } else if (input.action === "set_status") {
      if (input.status === "deleted") {
        if (!["admin", "super_admin"].includes(session.role)) throw new ApiError(403, "admin_required");
        await requireAdminChallenge(request, session, "delete_listing");
      } else if (input.status === "rejected") {
        await requireAdminChallenge(request, session, "reject_listing");
      }
      patch = {
        status: input.status,
        moderation_reason: input.reason,
        ...(input.status === "live" ? {published_at: new Date().toISOString()} : {}),
        ...(input.status === "deleted" ? {deleted_at: new Date().toISOString()} : {}),
      };
    } else if (input.action === "adjust_votes") {
      if (!["admin", "super_admin"].includes(session.role)) throw new ApiError(403, "admin_required");
      await requireAdminChallenge(request, session, "adjust_votes");
      const {data: listing} = await db.from("listings").select("votes_count").eq("id", id).maybeSingle();
      if (!listing) throw new ApiError(404, "listing_not_found");
      patch = {votes_count: Math.max(0, listing.votes_count + input.amount)};
    } else {
      if (!["admin", "super_admin"].includes(session.role)) throw new ApiError(403, "admin_required");
      await requireAdminChallenge(request, session, `set_${input.action}`);
      patch = {[input.action]: input.enabled};
    }

    const {data, error} = await db
      .from("listings")
      .update(patch)
      .eq("id", id)
      .neq("status", "deleted")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, "listing_not_found");
    await auditAdminAction(session, input.action, "listing", id, input.reason, input);
    return Response.json({listing: data});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
