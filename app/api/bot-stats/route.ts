import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, ApiError} from "@/lib/server/auth";
import {hashBotStatsToken} from "@/lib/server/bot-stats";
import {enforceRateLimit} from "@/lib/server/security";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reportSchema = z.object({
  serverCount: z.number().int().min(0).max(100_000_000),
});

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
    if (!token.startsWith("nbx_stats_")) throw new ApiError(401, "invalid_stats_token");

    const tokenHash = hashBotStatsToken(token);
    await enforceRateLimit(request, "bot-stats-report", 120, 60 * 60, tokenHash);

    const parsed = reportSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(400, "invalid_server_count");

    const {data, error} = await getSupabaseAdmin().rpc("report_bot_server_count", {
      p_token_hash: tokenHash,
      p_server_count: parsed.data.serverCount,
    });
    if (error) {
      if (error.message.includes("invalid_stats_token")) {
        throw new ApiError(401, "invalid_stats_token");
      }
      if (error.message.includes("stats_rate_limited")) {
        throw new ApiError(429, "stats_rate_limited");
      }
      throw error;
    }

    return Response.json(data, {headers: {"Cache-Control": "no-store"}});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
