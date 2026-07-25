import {NextRequest} from "next/server";

import {DISCORD_SESSION_COOKIE, getDiscordSession} from "@/lib/auth/discord-session";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: {params: Promise<{id: string}>},
) {
  const {id} = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({error: "invalid_media_id"}, {status: 400});
  }

  const db = getSupabaseAdmin();
  const {data: media, error: mediaError} = await db
    .from("listing_media")
    .select("id,listing_id,bucket,object_path,mime_type")
    .eq("id", id)
    .maybeSingle();
  if (mediaError) throw mediaError;
  if (!media) return Response.json({error: "media_not_found"}, {status: 404});

  const {data: listing, error: listingError} = await db
    .from("listings")
    .select("owner_id,status,visibility,deleted_at")
    .eq("id", media.listing_id)
    .maybeSingle();
  if (listingError) throw listingError;
  if (!listing) return Response.json({error: "listing_not_found"}, {status: 404});

  const isPublic =
    !listing.deleted_at &&
    listing.visibility === "public" &&
    (listing.status === "live" || listing.status === "pending_review");

  if (!isPublic) {
    const session = await getDiscordSession(
      request.cookies.get(DISCORD_SESSION_COOKIE)?.value,
    );
    const canRead =
      session &&
      (session.userId === listing.owner_id ||
        session.role === "moderator" ||
        session.role === "admin" ||
        session.role === "super_admin");
    if (!canRead) return Response.json({error: "media_not_found"}, {status: 404});
  }

  const {data: file, error: downloadError} = await db.storage
    .from(media.bucket)
    .download(media.object_path);
  if (downloadError || !file) {
    return Response.json({error: "media_unavailable"}, {status: 404});
  }

  return new Response(await file.arrayBuffer(), {
    headers: {
      "Content-Type": media.mime_type || file.type || "application/octet-stream",
      "Cache-Control": isPublic
        ? "public, max-age=3600, stale-while-revalidate=86400"
        : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
