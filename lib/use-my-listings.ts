"use client";

import {useCallback, useEffect, useState} from "react";

import type {ApiListing} from "@/lib/real-listings";

export function useMyListings() {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/listings?mine=1&limit=40", {cache: "no-store"});
      const result = await response.json() as {listings?: ApiListing[]; error?: string};
      if (!response.ok) throw new Error(result.error || "listings_load_failed");
      setListings(result.listings || []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "listings_load_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {listings, loading, error, refresh};
}
