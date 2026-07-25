import { notFound } from "next/navigation";

import { BotDetailView } from "@/components/bot/bot-detail-view";
import {apiListingToBot} from "@/lib/real-listings";
import {getPublicListing} from "@/lib/server/public-listings";

export const dynamic = "force-dynamic";

export default async function BotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getPublicListing("bot", slug);
  if (!listing) notFound();
  const bot = apiListingToBot(listing);
  return <BotDetailView bot={bot} />;
}
