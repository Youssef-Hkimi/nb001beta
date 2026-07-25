import "server-only";

import sharp from "sharp";

import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

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
    .upload(objectPath, output, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: true,
    });
  if (uploadError) throw uploadError;
  const {error: mediaError} = await db.from("listing_media").insert({
    listing_id: input.listingId,
    kind: "icon",
    bucket: "listing-icons",
    object_path: objectPath,
    mime_type: "image/webp",
    byte_size: output.byteLength,
    width: 512,
    height: 512,
    position: 0,
  });
  if (mediaError) throw mediaError;
  return db.storage.from("listing-icons").getPublicUrl(objectPath).data.publicUrl;
}

export function addPublicMediaUrls<
  T extends {listing_media?: Array<{id?: string; bucket: string; object_path: string}>},
>(
  listing: T,
) {
  const db = getSupabaseAdmin();
  return {
    ...listing,
    listing_media: (listing.listing_media || []).map((media) => ({
      ...media,
      // Route media through Nexbiy so browser/CDN policy changes cannot break
      // owner uploads that are valid in Supabase Storage.
      url: media.id
        ? `/api/media/${media.id}`
        : db.storage.from(media.bucket).getPublicUrl(media.object_path).data.publicUrl,
    })),
  };
}
