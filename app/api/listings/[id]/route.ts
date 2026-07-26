import {NextRequest} from "next/server";

import {apiErrorResponse, ApiError, requireSession} from "@/lib/server/auth";
import {updateListingSchema} from "@/lib/server/listing-schema";
import {addPublicMediaUrls} from "@/lib/server/listing-media";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const {id} = await context.params;
    let query = getSupabaseAdmin()
      .from("listings")
      .select("*,listing_media(*),profiles!listings_owner_id_fkey(username,display_name,avatar_url)")
      .in("status", ["live", "pending_review"])
      .eq("visibility", "public")
      .is("deleted_at", null);
    query = /^[0-9a-f-]{36}$/i.test(id) ? query.eq("id", id) : query.eq("slug", id);
    const {data, error} = await query.maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, "listing_not_found");
    return Response.json({listing: addPublicMediaUrls(data)});
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const session = await requireSession(request);
    const {id} = await context.params;
    const parsed = updateListingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({error: "invalid_listing", fields: parsed.error.flatten().fieldErrors}, {status: 400});
    }
    const input = parsed.data;
    const patch = {
      ...(input.name !== undefined ? {name: input.name} : {}),
      ...(input.shortDescription !== undefined ? {short_description: input.shortDescription} : {}),
      ...(input.longDescription !== undefined ? {long_description: input.longDescription} : {}),
      ...(input.category !== undefined ? {category: input.category} : {}),
      ...(input.tags !== undefined ? {tags: input.tags} : {}),
      ...(input.featureIds !== undefined ? {feature_ids: input.featureIds} : {}),
      ...(input.language !== undefined ? {language: input.language} : {}),
      ...(input.region !== undefined ? {region: input.region} : {}),
      ...(input.inviteUrl !== undefined ? {invite_url: input.inviteUrl} : {}),
      ...(input.supportUrl !== undefined ? {support_url: input.supportUrl || null} : {}),
      ...(input.websiteUrl !== undefined ? {website_url: input.websiteUrl || null} : {}),
      ...(input.githubUrl !== undefined ? {github_url: input.githubUrl || null} : {}),
      ...(input.botPrefix !== undefined ? {bot_prefix: input.botPrefix} : {}),
      ...(input.botCommands !== undefined ? {bot_commands: input.botCommands} : {}),
      ...(input.premium !== undefined ? {premium: input.premium} : {}),
      ...(input.bannerColor !== undefined ? {banner_color: input.bannerColor} : {}),
      status: "pending_review" as const,
    };
    const {data, error} = await getSupabaseAdmin()
      .from("listings")
      .update(patch)
      .eq("id", id)
      .eq("owner_id", session.userId)
      .neq("status", "deleted")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, "listing_not_found");
    return Response.json({listing: data});
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: {params: Promise<{id: string}>}) {
  try {
    const session = await requireSession(request);
    const {id} = await context.params;
    const db = getSupabaseAdmin();
    const {data, error} = await db.rpc("hard_delete_owned_listing", {
      p_listing_id: id,
      p_owner_id: session.userId,
    });
    if (error) throw error;
    const result = data as {
      deleted?: boolean;
      media?: Array<{bucket?: string; objectPath?: string}>;
    } | null;
    if (!result?.deleted) throw new ApiError(404, "listing_not_found");

    const mediaByBucket = new Map<string, string[]>();
    for (const media of result.media || []) {
      if (!media.bucket || !media.objectPath) continue;
      mediaByBucket.set(media.bucket, [
        ...(mediaByBucket.get(media.bucket) || []),
        media.objectPath,
      ]);
    }
    const cleanupResults = await Promise.allSettled(
      [...mediaByBucket].map(([bucket, paths]) => db.storage.from(bucket).remove(paths)),
    );
    cleanupResults.forEach((cleanup, index) => {
      if (cleanup.status === "rejected") {
        console.error("listing_media_cleanup_failed", {
          listingId: id,
          bucket: [...mediaByBucket.keys()][index],
          error: cleanup.reason,
        });
      }
    });

    return Response.json({ok: true});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
