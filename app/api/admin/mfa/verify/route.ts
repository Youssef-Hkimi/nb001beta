import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError, requireStaff} from "@/lib/server/auth";
import {
  createTotp,
  decryptMfaSecret,
  issueAdminChallenge,
} from "@/lib/server/admin-security";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const verifySchema = z.object({
  code: z.string().regex(/^\d{6}$/),
  scope: z.string().trim().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaff(request);
    await enforceRateLimit(request, "admin-mfa-verify", 10, 10 * 60, session.userId);
    const parsed = verifySchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({error: "invalid_mfa_code"}, {status: 400});
    const db = getSupabaseAdmin();
    const {data: staff} = await db
      .from("staff_members")
      .select("mfa_secret_ciphertext,mfa_enrolled_at")
      .eq("user_id", session.userId)
      .maybeSingle();
    if (!staff?.mfa_secret_ciphertext) throw new ApiError(409, "mfa_enrollment_required");
    const totp = createTotp(session.user.username, decryptMfaSecret(staff.mfa_secret_ciphertext));
    if (totp.validate({token: parsed.data.code, window: 1}) === null) {
      throw new ApiError(403, "invalid_mfa_code");
    }
    if (!staff.mfa_enrolled_at) {
      await db
        .from("staff_members")
        .update({mfa_enrolled_at: new Date().toISOString()})
        .eq("user_id", session.userId);
    }
    const challenge = await issueAdminChallenge(session, parsed.data.scope, request);
    return Response.json({challenge, expiresIn: 300});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
