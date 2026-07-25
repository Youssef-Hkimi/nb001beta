import { notFound } from "next/navigation";

import { ServerDetailClient } from "@/components/server/server-detail-client";
import {apiListingToServerDetail} from "@/lib/real-listings";
import {getPublicListing} from "@/lib/server/public-listings";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ServerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getPublicListing("server", slug);
  if (!listing) notFound();
  const server = apiListingToServerDetail(listing);

  return <ServerDetailClient server={server} />;
}
