"use client";

import {useEffect, useState} from "react";

export type DashboardOverviewData = {
  rangeDays: number;
  totals: {
    views: number;
    inviteClicks: number;
    votes: number;
    listings: number;
    live: number;
    drafts: number;
    conversionRate: number;
  };
  period: {
    views: number;
    clicks: number;
    interactions: number;
    deltas: {views: number; clicks: number; interactions: number};
  };
  series: {date: string; views: number; clicks: number; interactions: number}[];
  onboarding: {notifications: boolean; listing: boolean; media: boolean; votes: boolean};
};

export function useDashboardOverview(days: number) {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/dashboard/overview?days=${days}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json() as DashboardOverviewData & {error?: string};
        if (!response.ok) throw new Error(result.error || "overview_load_failed");
        setData(result);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "overview_load_failed");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [days]);

  return {data, loading, error};
}
