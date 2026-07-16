import { notFound } from "next/navigation";

import { BotDetailView } from "@/components/bot/bot-detail-view";
import { BOTS, getBotBySlug } from "@/lib/data/bots";

export function generateStaticParams() {
  return BOTS.map((bot) => ({ slug: bot.slug }));
}

export default async function BotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bot = getBotBySlug(slug);
  if (!bot) notFound();
  return <BotDetailView bot={bot} />;
}
