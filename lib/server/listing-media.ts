import "server-only";

import sharp from "sharp";

import {bufferToStorageBlob} from "@/lib/server/storage-upload";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export function getListingMediaPublicUrl(media: {
  id?: string;
  bucket: string;
  object_path: string;
}) {
  const db = getSupabaseAdmin();
  const publicUrl = db.storage.from(media.bucket).getPublicUrl(media.object_path).data.publicUrl;
  return media.id ? `${publicUrl}?v=${encodeURIComponent(media.id)}` : publicUrl;
}

export async function importDiscordGuildIcon(input: {
  userId: string;
  listingId: string;
  guildId: string;
  iconHash: string | null;
}) {
  if (!input.iconHash || !/^(?:a_)?[A-Za-z0-9_]+$/.test(input.iconHash)) return null;
  const extension = input.iconHash.startsWith("a_") ? "gif" : "png";
  const response = await fetch(
    `https://cdn.discordapp.com/icons/${input.guildId}/${input.iconHash}.${extension}?size=512`,
    {cache: "no-store", signal: AbortSignal.timeout(8_000)},
  );
  if (!response.ok) return null;
  const size = Number(response.headers.get("content-length") || 0);
  if (size > 5 * 1024 * 1024) return null;
  const source = Buffer.from(await response.arrayBuffer());
  if (!source.byteLength || source.byteLength > 5 * 1024 * 1024) return null;
  const output = await sharp(source, {failOn: "error", limitInputPixels: 40_000_000})
    .rotate()
    .resize(512, 512, {fit: "cover", position: "attention"})
    .webp({quality: 88, effort: 4})
    .toBuffer();
  const db = getSupabaseAdmin();
  const objectPath = `${input.userId}/${input.listingId}/icon-0.webp`;
  const {error: uploadError} = await db.storage
    .from("listing-icons")
    .upload(objectPath, bufferToStorageBlob(output, "image/webp"), {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: true,
    });
  if (uploadError) throw uploadError;
  const {error: deleteError} = await db
    .from("listing_media")
    .delete()
    .eq("listing_id", input.listingId)
    .eq("kind", "icon");
  if (deleteError) throw deleteError;

  const {data: media, error: mediaError} = await db
    .from("listing_media")
    .insert({
      listing_id: input.listingId,
      kind: "icon",
      bucket: "listing-icons",
      object_path: objectPath,
      mime_type: "image/webp",
      byte_size: output.byteLength,
      width: 512,
      height: 512,
      position: 0,
    })
    .select("id")
    .single();
  if (mediaError) throw mediaError;
  return getListingMediaPublicUrl({
    id: media.id,
    bucket: "listing-icons",
    object_path: objectPath,
  });
}

export function addPublicMediaUrls<
  T extends {listing_media?: Array<{id?: string; bucket: string; object_path: string}>},
>(
  listing: T,
) {
  return {
    ...listing,
    listing_media: (listing.listing_media || []).map((media) => ({
      ...media,
      url: getListingMediaPublicUrl(media),
    })),
  };
}
