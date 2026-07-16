import type { DashboardListing, ListingSafetyStatus, ListingStatus } from "@/lib/types";

const STORAGE_KEY = "nexus_listing_status_overrides";

export type ListingStatusOverride = {
  id: string;
  status: ListingStatus;
  updated?: string;
  name?: string;
  type?: DashboardListing["type"];
  category?: string;
  description?: string;
  bannerHue?: string;
  safetyStatus?: ListingSafetyStatus;
};

export function readStatusOverrides(): ListingStatusOverride[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ListingStatusOverride[];
  } catch {
    return [];
  }
}

export function writeStatusOverride(override: ListingStatusOverride) {
  if (typeof window === "undefined") return;
  const current = readStatusOverrides().filter((o) => o.id !== override.id);
  current.unshift(override);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, 40)));
  } catch {
    // ignore
  }
}

export function mergeListingStatuses(rows: DashboardListing[]): DashboardListing[] {
  const overrides = readStatusOverrides();
  if (!overrides.length) return rows;

  const byId = new Map(overrides.map((o) => [o.id, o]));
  const merged = rows.map((row) => {
    const o = byId.get(row.id);
    if (!o) return row;
    return {
      ...row,
      status: o.status,
      safetyStatus: o.safetyStatus ?? "PENDING_REVIEW",
      updated: o.updated ?? row.updated,
    };
  });

  // Append newly published listings not already in the table
  for (const o of overrides) {
    if (merged.some((r) => r.id === o.id)) continue;
    if (!o.name || !o.type) continue;
    merged.unshift({
      id: o.id,
      name: o.name,
      type: o.type,
      status: o.status,
      views: 0,
      clicks: 0,
      updated: o.updated ?? "Just now",
      category: o.category ?? "General",
      description: o.description ?? "",
      bannerHue: o.bannerHue ?? "220",
      safetyStatus: o.safetyStatus ?? "PENDING_REVIEW",
    });
  }

  return merged;
}
