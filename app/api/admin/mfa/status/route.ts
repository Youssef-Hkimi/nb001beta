import {NextRequest} from "next/server";

import {apiErrorResponse, requireStaff} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaff(request);
    const {data: staff, error} = await getSupabaseAdmin()
      .from("staff_members")
      .select("mfa_secret_ciphertext,mfa_enrolled_at")
      .eq("user_id", session.userId)
      .maybeSingle();
    if (error) throw error;
    return Response.json({
      configured: Boolean(staff?.mfa_secret_ciphertext),
      enrolled: Boolean(staff?.mfa_enrolled_at),
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
