import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, requireSession} from "@/lib/server/auth";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const draftSchema = z.object({
  type: z.enum(["server", "bot"]),
  payload: z.record(z.string(), z.unknown()),
}).refine((value) => JSON.stringify(value.payload).length <= 100_000, {
  message: "Draft is too large",
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const type = request.nextUrl.searchParams.get("type");
    let query = getSupabaseAdmin()
      .from("listing_drafts")
      .select("id,type,payload,updated_at")
      .eq("owner_id", session.userId);
    if (type === "server" || type === "bot") query = query.eq("type", type);
    const {data, error} = await query.order("updated_at", {ascending: false});
    if (error) throw error;
    return Response.json({drafts: data || []}, {headers: {"Cache-Control": "no-store"}});
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(request);
    await enforceRateLimit(request, "save-draft", 30, 60, session.userId);
    const parsed = draftSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({error: "invalid_draft"}, {status: 400});
    const {data, error} = await getSupabaseAdmin()
      .from("listing_drafts")
      .upsert({
        owner_id: session.userId,
        type: parsed.data.type,
        payload: parsed.data.payload,
      }, {onConflict: "owner_id,type"})
      .select("id,type,updated_at")
      .single();
    if (error) throw error;
    return Response.json({draft: data});
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const type = request.nextUrl.searchParams.get("type");
    if (type !== "server" && type !== "bot") {
      return Response.json({error: "invalid_draft_type"}, {status: 400});
    }
    const {error} = await getSupabaseAdmin()
      .from("listing_drafts")
      .delete()
      .eq("owner_id", session.userId)
      .eq("type", type);
    if (error) throw error;
    return Response.json({ok: true});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
