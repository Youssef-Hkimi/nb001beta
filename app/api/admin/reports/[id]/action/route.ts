import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError, requireStaff} from "@/lib/server/auth";
import {auditAdminAction} from "@/lib/server/admin-security";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const reportActionSchema = z.object({
  status: z.enum(["triaged", "investigating", "resolved", "dismissed"]),
  severity: z.enum(["low", "medium", "high", "urgent"]).optional(),
  notes: z.string().trim().min(3).max(2000),
  notifyReporter: z.boolean().default(false),
});

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const session = await requireStaff(request);
    await enforceRateLimit(request, "admin-report-action", 60, 60, session.userId);
    const {id} = await context.params;
    const parsed = reportActionSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({error: "invalid_report_action"}, {status: 400});
    if (parsed.data.status === "dismissed" && session.role === "moderator") {
      throw new ApiError(403, "admin_required_to_dismiss");
    }
    const db = getSupabaseAdmin();
    const {data: report} = await db
      .from("reports")
      .select("reporter_id")
      .eq("id", id)
      .maybeSingle();
    if (!report) throw new ApiError(404, "report_not_found");
    const terminal = ["resolved", "dismissed"].includes(parsed.data.status);
    const {error} = await db
      .from("reports")
      .update({
        status: parsed.data.status,
        ...(parsed.data.severity ? {severity: parsed.data.severity} : {}),
        resolution_notes: parsed.data.notes,
        ...(terminal ? {resolved_by: session.userId, resolved_at: new Date().toISOString()} : {}),
      })
      .eq("id", id);
    if (error) throw error;
    if (parsed.data.notifyReporter) {
      await db.from("notifications").insert({
        user_id: report.reporter_id,
        type: "report_update",
        title: "Your report has been updated",
        body: parsed.data.notes,
        action_url: "/dashboard",
      });
    }
    await auditAdminAction(session, "update_report", "report", id, parsed.data.notes, parsed.data);
    return Response.json({ok: true});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
