"use client";

import {useEffect, useState} from "react";

export type ListingAnalyticsResponse = {
  totals: {
    views: number;
    inviteClicks: number;
    votes: number;
    linkCopies: number;
  };
  series: Array<{
    date: string;
    views: number;
    inviteClicks: number;
    linkCopies: number;
    votes: number;
  }>;
  days: number;
};

export function useListingAnalytics(listingId: string | null | undefined, days: number) {
  const [data, setData] = useState<ListingAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/listings/${listingId}/analytics?days=${days}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("analytics_unavailable");
        return response.json() as Promise<ListingAnalyticsResponse>;
      })
      .then((payload) => setData(payload))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError("Analytics could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [days, listingId]);

  return {data, loading, error};
}
