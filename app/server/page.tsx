"use client";

import {
  Button,
  Drawer,
  Label,
  ListBox,
  Pagination,
  SearchField,
  Select,
  Switch,
  toast,
} from "@heroui/react";
import { Filter, Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ServerCard } from "@/components/cards/server-card";
import { CategoryChips } from "@/components/filters/category-chips";
import {
  ListingFilters,
  type FilterState,
} from "@/components/filters/listing-filters";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import {
  ACTIVITY_LEVELS,
  LANGUAGES,
  SERVER_CATEGORIES,
  SERVER_SIZES,
  SORT_OPTIONS,
  TRENDING_TAGS,
} from "@/lib/data/categories";
import { usePublicServerListings } from "@/lib/use-public-listings";

const defaultFilters: FilterState = {
  categories: [],
  language: "All",
  size: "All",
  activity: "All",
  tags: [],
  verifiedOnly: false,
};

function sizeBucket(members: number) {
  if (members < 50_000) return "Small";
  if (members < 150_000) return "Medium";
  if (members < 500_000) return "Large";
  return "Huge";
}

export default function ServerPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("trending");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(24);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    listings: publicServers,
    loading: listingsLoading,
    error: listingsError,
  } = usePublicServerListings();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [search, category, sort, filters]);

  const filtered = useMemo(() => {
    let list = [...publicServers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (category !== "All") {
      list = list.filter((s) => s.category === category);
    }

    if (filters.categories.length) {
      list = list.filter((s) => filters.categories.includes(s.category));
    }

    if (filters.language !== "All") {
      list = list.filter((s) => s.language === filters.language);
    }

    if (filters.size !== "All") {
      list = list.filter((s) => sizeBucket(s.members) === filters.size);
    }

    if (filters.activity !== "All") {
      list = list.filter(
        (s) => s.activity === filters.activity.toLowerCase(),
      );
    }

    if (filters.tags.length) {
      list = list.filter((s) => filters.tags.some((t) => s.tags.includes(t)));
    }

    if (filters.verifiedOnly) {
      list = list.filter((s) => s.verified);
    }

    if (sort === "members") {
      list.sort((a, b) => b.members - a.members);
    } else if (sort === "newest") {
      list.reverse();
    }

    return list;
  }, [publicServers, search, category, sort, filters]);

  // Paginate through the currently visible slice of results
  const pageSize = 15;
  const pool = filtered.slice(0, visible);
  const totalPages = Math.max(1, Math.ceil(pool.length / pageSize));
  const pageItems = pool.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="theme-surface min-h-screen">
      <div className="border-b border-border/70 bg-nexus-soft/60 dark:bg-[var(--nexus-dark-soft)]/40">
        <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Explore Discord Servers
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Find active communities for gaming, anime, study, tech, music, creators, and more.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <SearchField
                aria-label="Search servers"
                className="w-full max-w-xl"
                value={search}
                onChange={setSearch}
              >
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search servers..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>

              <div className="flex flex-wrap items-center gap-2">
                <LinkButton href="/dashboard/new">
                  <Plus className="size-4" />
                  Add Your Server
                </LinkButton>

                <Select
                  className="w-44"
                  selectedKey={sort}
                  onSelectionChange={(key) => setSort(String(key))}
                >
                  <Label className="sr-only">Sort</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {SORT_OPTIONS.filter((o) => o.id !== "votes").map((opt) => (
                        <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                          {opt.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
                  <span className="text-sm text-foreground">Verified only</span>
                  <Switch
                    aria-label="Verified only"
                    isSelected={filters.verifiedOnly}
                    onChange={(v) => setFilters((f) => ({ ...f, verifiedOnly: v }))}
                  >
                    <Switch.Content>
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Content>
                  </Switch>
                </div>

                <Button
                  className="lg:hidden"
                  variant="secondary"
                  onPress={() => setFilterOpen(true)}
                >
                  <SlidersHorizontal className="size-4" />
                  Filters
                </Button>
              </div>
            </div>

            <CategoryChips
              items={SERVER_CATEGORIES}
              active={category}
              onChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="server-listing-shell grid grid-cols-1 gap-8 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <ListingFilters
            categories={SERVER_CATEGORIES}
            languages={LANGUAGES}
            sizes={SERVER_SIZES}
            activities={ACTIVITY_LEVELS}
            tags={TRENDING_TAGS}
            value={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          />
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Showing <span className="font-medium text-foreground">{pageItems.length}</span> of{" "}
              {filtered.length} servers
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="lg:hidden"
              onPress={() => setFilterOpen(true)}
            >
              <Filter className="size-4" />
              Refine
            </Button>
          </div>

          {loading || listingsLoading ? (
            <div className="server-listing-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : listingsError ? (
            <EmptyState
              title="Servers could not be loaded"
              description="Please refresh and try again."
              actionLabel="Refresh"
              onAction={() => window.location.reload()}
            />
          ) : pageItems.length === 0 ? (
            <EmptyState
              title="No servers match"
              description="Clear filters or try a different category."
              actionLabel="Reset filters"
              onAction={() => {
                setFilters(defaultFilters);
                setCategory("All");
                setSearch("");
                toast("Filters reset");
              }}
            />
          ) : (
            <div className="server-listing-grid">
              {pageItems.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            {visible < filtered.length ? (
              <Button
                variant="secondary"
                onPress={() => {
                  setVisible((v) => v + 6);
                  toast.success("Loaded more servers");
                }}
              >
                Load more
              </Button>
            ) : null}

            <Pagination>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page === 1}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <Pagination.PreviousIcon />
                    Prev
                  </Pagination.Previous>
                </Pagination.Item>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Pagination.Item key={p}>
                    <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                ))}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={page === totalPages}
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </div>
        </div>
      </div>

      <Drawer>
        <Drawer.Backdrop isOpen={filterOpen} onOpenChange={setFilterOpen}>
          <Drawer.Content placement="left">
            <Drawer.Dialog className="w-[min(100vw,22rem)]">
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Filters</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <ListingFilters
                  categories={SERVER_CATEGORIES}
                  languages={LANGUAGES}
                  sizes={SERVER_SIZES}
                  activities={ACTIVITY_LEVELS}
                  tags={TRENDING_TAGS}
                  value={filters}
                  onChange={(next) => {
                    setFilters(next);
                    setPage(1);
                  }}
                />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
