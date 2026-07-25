import {NextRequest} from "next/server";
import {z} from "zod";

import {apiErrorResponse, requireSession} from "@/lib/server/auth";
import {getSupabaseAdmin} from "@/lib/server/supabase-admin";

export const runtime = "nodejs";

const profileSchema = z.object({
  bio: z.string().trim().max(120),
  inboxNotifications: z.boolean(),
  notificationPreferences: z.object({
    listingUpdates: z.boolean(),
    likeMilestones: z.boolean(),
    announcements: z.boolean(),
  }),
  socials: z.object({
    x: z.string().trim().max(50),
    github: z.string().trim().max(50),
    roblox: z.string().trim().max(50),
  }),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({error: "invalid_profile"}, {status: 400});
    }
    const input = parsed.data;
    const {error} = await getSupabaseAdmin()
      .from("profiles")
      .update({
        bio: input.bio,
        socials: input.socials,
        notification_preferences: {
          inbox: input.inboxNotifications,
          listingUpdates: input.notificationPreferences.listingUpdates,
          voteMilestones: input.notificationPreferences.likeMilestones,
          announcements: input.notificationPreferences.announcements,
        },
      })
      .eq("id", session.userId);
    if (error) throw error;
    return Response.json({ok: true});
  } catch (error) {
    return apiErrorResponse(error);
  }
}
