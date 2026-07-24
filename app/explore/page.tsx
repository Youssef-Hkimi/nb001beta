"use client";

import { Dropdown, toast } from "@heroui/react";
import { ChevronDown, ListPlus, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ServerCard } from "@/components/cards/server-card";
import { AnimatedTagMarquee } from "@/components/explore/animated-tag-marquee";
import { ExploreSidebar } from "@/components/explore/explore-sidebar";
import { FAQSection } from "@/components/explore/faq-section";
import { FeatureOverviewSection } from "@/components/explore/feature-overview-section";
import { HeroSection } from "@/components/explore/hero-section";
import { NexusFooter } from "@/components/layout/nexus-footer";
import { SERVERS } from "@/lib/data/servers";
import { isPubliclyDiscoverable } from "@/lib/listing-safety";

const INITIAL_VISIBLE = 6;
const LOAD_MORE_COUNT = 4;

export default function ExplorePage() {
  // Empty string = show all; tag click filters the grid
  const [category, setCategory] = useState("");
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const router = useRouter();

  const filteredServers = useMemo(() => {
    const publicServers = SERVERS.filter(isPubliclyDiscoverable);
    const list = !category
      ? publicServers
      : publicServers.filter(
          (s) =>
            s.category === category ||
            s.tags.some((t) => t.toLowerCase() === category.toLowerCase()) ||
            s.name.toLowerCase().includes(category.toLowerCase()),
        );

    // Featured first so explore still leads with hand-picked communities
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [category]);

  const servers = filteredServers.slice(0, visible);
  const remaining = Math.max(0, filteredServers.length - visible);
  const hasMore = remaining > 0;

  function handleCategoryChange(next: string) {
    setCategory(next);
    setVisible(INITIAL_VISIBLE);
  }

  function loadMore() {
    const next = Math.min(visible + LOAD_MORE_COUNT, filteredServers.length);
    const added = next - visible;
    setVisible(next);
    toast.success(added === 1 ? "Loaded 1 more server" : `Loaded ${added} more servers`);
  }

  return (
    <div className="theme-surface min-h-screen">
      <HeroSection />

      <div className="server-listing-shell relative z-10 pt-4 pb-16 md:pt-6">
        <div className="mb-12 md:mb-14">
          <AnimatedTagMarquee activeTag={category} onTagClick={handleCategoryChange} />
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0">
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Featured & Trending Servers
              </h2>
              <p className="mt-1 text-sm text-muted">
                Hand-picked communities worth joining right now
              </p>
            </div>

            <div className="server-listing-grid">
              {servers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>

            {filteredServers.length > INITIAL_VISIBLE ? (
              <div className="mt-8 flex flex-col items-center gap-2.5">
                <Dropdown>
                  {/* Dropdown.Trigger already renders a button — do not nest Button */}
                  <Dropdown.Trigger
                    aria-label="Browse more servers"
                    className="button button--secondary inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold"
                  >
                    Browse more
                    <ChevronDown className="size-4 opacity-80" aria-hidden />
                  </Dropdown.Trigger>
                  <Dropdown.Popover placement="bottom">
                    <Dropdown.Menu
                      onAction={(key) => {
                        if (key === "more" && hasMore) loadMore();
                        if (key === "catalog") router.push("/server");
                      }}
                    >
                      <Dropdown.Item
                        id="more"
                        textValue="Load more servers"
                        isDisabled={!hasMore}
                      >
                        <ListPlus className="size-4" />
                        Load more servers
                        {hasMore ? (
                          <span className="ml-auto text-xs text-muted">
                            +{Math.min(LOAD_MORE_COUNT, remaining)}
                          </span>
                        ) : null}
                      </Dropdown.Item>
                      <Dropdown.Item id="catalog" textValue="View full catalog">
                        <Server className="size-4" />
                        View full server catalog
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>

                <p className="text-xs text-muted">
                  Showing {servers.length} of {filteredServers.length} servers
                </p>
              </div>
            ) : null}
          </section>

          <div className="xl:pt-12">
            <ExploreSidebar />
          </div>
        </div>
      </div>

      <FeatureOverviewSection />
      <FAQSection />
      <NexusFooter />
    </div>
  );
}
