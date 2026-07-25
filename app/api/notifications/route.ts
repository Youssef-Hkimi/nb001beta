import {NextRequest} from "next/server";

import {apiErrorResponse, requireSession} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const {data, error} = await getSupabaseAdmin()
      .from("notifications")
      .select("id,type,title,body,action_url,read_at,created_at")
      .eq("user_id", session.userId)
      .order("created_at", {ascending: false})
      .limit(30);
    if (error) throw error;
    return Response.json({
      notifications: data || [],
      unreadCount: (data || []).filter((item) => !item.read_at).length,
    }, {headers: {"Cache-Control": "no-store"}});
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json() as {id?: string; all?: boolean};
    let query = getSupabaseAdmin()
      .from("notifications")
      .update({read_at: new Date().toISOString()})
      .eq("user_id", session.userId);
    if (!body.all) {
      if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) {
        return Response.json({error: "invalid_notification"}, {status: 400});
      }
      query = query.eq("id", body.id);
    }
    const {error} = await query;
    if (error) throw error;
    return Response.json({ok: true});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
