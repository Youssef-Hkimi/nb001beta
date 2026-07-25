import {NextRequest} from "next/server";
import * as OTPAuth from "otpauth";

import {apiErrorResponse, ApiError, requireStaff} from "@/lib/server/auth";
import {createTotp, encryptMfaSecret} from "@/lib/server/admin-security";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaff(request);
    await enforceRateLimit(request, "admin-mfa-enroll", 3, 60 * 60, session.userId);
    const db = getSupabaseAdmin();
    const {data: staff} = await db
      .from("staff_members")
      .select("mfa_enrolled_at")
      .eq("user_id", session.userId)
      .maybeSingle();
    if (!staff) throw new ApiError(403, "staff_record_required");
    if (staff.mfa_enrolled_at) throw new ApiError(409, "mfa_already_enrolled");
    const secret = new OTPAuth.Secret({size: 20}).base32;
    const totp = createTotp(session.user.username, secret);
    const {error} = await db
      .from("staff_members")
      .update({mfa_secret_ciphertext: encryptMfaSecret(secret)})
      .eq("user_id", session.userId);
    if (error) throw error;
    return Response.json({secret, uri: totp.toString()});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
