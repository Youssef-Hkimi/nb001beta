import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError, requireStaff} from "@/lib/server/auth";
import {auditAdminAction, requireAdminChallenge} from "@/lib/server/admin-security";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const userActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("notify"),
    title: z.string().trim().min(1).max(140),
    message: z.string().trim().min(1).max(2000),
    actionUrl: z
      .string()
      .trim()
      .max(500)
      .refine(
        (value) => /^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value),
        "invalid_action_url",
      )
      .optional(),
  }),
  z.object({
    action: z.enum(["suspend", "freeze_listings", "unfreeze_listings", "flag"]),
    reason: z.string().trim().min(3).max(2000),
    durationHours: z.number().int().min(1).max(24 * 365).optional(),
  }),
  z.object({
    action: z.enum(["restore", "ban", "delete_user"]),
    reason: z.string().trim().min(3).max(2000),
  }),
]);

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const session = await requireStaff(request);
    await enforceRateLimit(request, "admin-user-action", 30, 60, session.userId);
    const {id} = await context.params;
    if (id === session.userId) throw new ApiError(409, "self_admin_action_blocked");
    const parsed = userActionSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({error: "invalid_admin_action"}, {status: 400});
    const input = parsed.data;
    const db = getSupabaseAdmin();

    if (input.action === "notify") {
      const {error} = await db.from("notifications").insert({
        user_id: id,
        type: "staff_notice",
        title: input.title,
        body: input.message,
        action_url: input.actionUrl || null,
      });
      if (error) throw error;
      await auditAdminAction(session, "notify_user", "user", id, input.message);
      return Response.json({ok: true});
    }

    if (input.action === "delete_user") {
      if (session.role !== "super_admin") throw new ApiError(403, "super_admin_required");
      await requireAdminChallenge(request, session, "delete_user");
      await db.from("listings").update({status: "deleted", deleted_at: new Date().toISOString()}).eq("owner_id", id);
      const {error} = await db.from("profiles").update({status: "deleted"}).eq("id", id);
      if (error) throw error;
    } else if (input.action === "ban") {
      if (!["admin", "super_admin"].includes(session.role)) throw new ApiError(403, "admin_required");
      await requireAdminChallenge(request, session, "ban_user");
      const {error: profileError} = await db
        .from("profiles")
        .update({status: "suspended", suspended_until: null})
        .eq("id", id);
      if (profileError) throw profileError;
      const {error: listingError} = await db
        .from("listings")
        .update({status: "suspended", moderation_reason: input.reason})
        .eq("owner_id", id)
        .neq("status", "deleted");
      if (listingError) throw listingError;
    } else if (input.action === "suspend") {
      const until = input.durationHours
        ? new Date(Date.now() + input.durationHours * 60 * 60 * 1000).toISOString()
        : null;
      const {error} = await db.from("profiles").update({status: "suspended", suspended_until: until}).eq("id", id);
      if (error) throw error;
    } else if (input.action === "freeze_listings") {
      const {error} = await db
        .from("listings")
        .update({status: "suspended", moderation_reason: input.reason})
        .eq("owner_id", id)
        .neq("status", "deleted");
      if (error) throw error;
    } else if (input.action === "unfreeze_listings") {
      const {error} = await db
        .from("listings")
        .update({status: "pending_review", moderation_reason: input.reason})
        .eq("owner_id", id)
        .eq("status", "suspended");
      if (error) throw error;
    } else if (input.action === "flag") {
      const {data: moderationCase, error} = await db
        .from("moderation_cases")
        .insert({
          user_id: id,
          severity: "high",
          status: "escalated",
          assigned_to: session.userId,
          summary: input.reason,
        })
        .select("id")
        .single();
      if (error) throw error;
      await db.from("moderation_actions").insert({
        case_id: moderationCase.id,
        actor_id: session.userId,
        target_user_id: id,
        action: "flag",
        reason: input.reason,
      });
    } else {
      const {error} = await db.from("profiles").update({status: "active", suspended_until: null}).eq("id", id);
      if (error) throw error;
    }

    await auditAdminAction(session, input.action, "user", id, input.reason, input);
    return Response.json({ok: true});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
