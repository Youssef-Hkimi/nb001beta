import {NextRequest} from "next/server";
import sharp from "sharp";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {getListingMediaPublicUrl} from "@/lib/server/listing-media";
import {enforceRateLimit} from "@/lib/server/security";
import {bufferToStorageBlob} from "@/lib/server/storage-upload";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const mediaConfig = {
  icon: {bucket: "listing-icons", width: 512, height: 512, maxBytes: 5 * 1024 * 1024},
  banner: {bucket: "listing-banners", width: 960, height: 320, maxBytes: 10 * 1024 * 1024},
  gallery: {bucket: "bot-gallery", width: 1280, height: 720, maxBytes: 10 * 1024 * 1024},
} as const;

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const session = await requireSession(request);
    await enforceRateLimit(request, "upload-listing-media", 20, 60 * 60, session.userId);
    const {id} = await context.params;
    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "") as keyof typeof mediaConfig;
    const position = Math.max(0, Math.min(Number(form.get("position")) || 0, 5));
    if (!(file instanceof File) || !(kind in mediaConfig)) {
      throw new ApiError(400, "invalid_media_request");
    }
    const config = mediaConfig[kind];
    if (!acceptedTypes.has(file.type) || file.size < 1 || file.size > config.maxBytes) {
      throw new ApiError(400, "invalid_media_file");
    }

    const db = getSupabaseAdmin();
    const {data: listing} = await db
      .from("listings")
      .select("id,type")
      .eq("id", id)
      .eq("owner_id", session.userId)
      .neq("status", "deleted")
      .maybeSingle();
    if (!listing) throw new ApiError(404, "listing_not_found");
    if (kind === "gallery" && listing.type !== "bot") {
      throw new ApiError(400, "gallery_is_bot_only");
    }

    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input, {failOn: "error", limitInputPixels: 40_000_000})
      .rotate()
      .resize(config.width, config.height, {
        fit: "cover",
        position: "attention",
        withoutEnlargement: false,
      })
      .webp({quality: 88, effort: 4})
      .toBuffer();
    const objectPath = `${session.userId}/${id}/${kind}-${position}.webp`;

    const {error: uploadError} = await db.storage
      .from(config.bucket)
      .upload(objectPath, bufferToStorageBlob(output, "image/webp"), {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: true,
      });
    if (uploadError) throw uploadError;

    let deleteQuery = db.from("listing_media").delete().eq("listing_id", id).eq("kind", kind);
    if (kind === "gallery") deleteQuery = deleteQuery.eq("position", position);
    const {error: deleteError} = await deleteQuery;
    if (deleteError) throw deleteError;

    const {data: media, error: mediaError} = await db
      .from("listing_media")
      .insert({
        listing_id: id,
        kind,
        bucket: config.bucket,
        object_path: objectPath,
        mime_type: "image/webp",
        byte_size: output.byteLength,
        width: config.width,
        height: config.height,
        position,
      })
      .select("*")
      .single();
    if (mediaError) throw mediaError;
    return Response.json(
      {
        media,
        url: getListingMediaPublicUrl({
          id: media.id,
          bucket: config.bucket,
          object_path: objectPath,
        }),
      },
      {status: 201},
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
