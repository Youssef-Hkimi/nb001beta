import {cookies} from "next/headers";
import {notFound, redirect} from "next/navigation";

import {BotDetailView} from "@/components/bot/bot-detail-view";
import {ServerDetailClient} from "@/components/server/server-detail-client";
import {
  apiListingToBot,
  apiListingToServerDetail,
} from "@/lib/real-listings";
import {
  DISCORD_SESSION_COOKIE,
  getDiscordSession,
} from "@/lib/auth/discord-session";
import {getOwnerListing} from "@/lib/server/public-listings";

export const dynamic = "force-dynamic";

export default async function OwnerListingPreviewPage({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  const sessionToken = (await cookies()).get(DISCORD_SESSION_COOKIE)?.value;
  const session = await getDiscordSession(sessionToken);
  if (!session) redirect(`/login?next=${encodeURIComponent(`/dashboard/preview/${id}`)}`);

  const listing = await getOwnerListing(id, session.userId);
  if (!listing) notFound();

  if (listing.type === "server") {
    return <ServerDetailClient server={apiListingToServerDetail(listing)} previewMode />;
  }

  return <BotDetailView bot={apiListingToBot(listing)} previewMode />;
}
