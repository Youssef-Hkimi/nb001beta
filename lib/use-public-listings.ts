"use client";

import {useEffect, useState} from "react";

import {
  apiListingToBot,
  apiListingToServer,
  type ApiListing,
} from "@/lib/real-listings";
import type {BotListing, ServerListing} from "@/lib/types";

function useListings<T>(type: "server" | "bot", mapper: (listing: ApiListing) => T) {
  const [listings, setListings] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const response = await fetch(`/api/listings?type=${type}&limit=40`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json() as {listings?: ApiListing[]; error?: string};
        if (!response.ok) throw new Error(result.error || "listings_load_failed");
        setListings((result.listings || []).map(mapper));
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "listings_load_failed");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [mapper, type]);

  return {listings, loading, error};
}

export function usePublicServerListings() {
  return useListings<ServerListing>("server", apiListingToServer);
}

export function usePublicBotListings() {
  return useListings<BotListing>("bot", apiListingToBot);
}
