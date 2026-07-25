"use client";

import { Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";

import { ServerDetailView } from "@/components/server/server-detail-view";
import type { ServerDetail } from "@/lib/types";

function ServerDetailSkeleton() {
  return (
    <div className="theme-surface min-h-screen">
      <Skeleton className="h-48 w-full rounded-none md:h-56" />
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 md:px-6 lg:px-8">
        <div className="flex items-end gap-4">
          <Skeleton className="size-24 rounded-3xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-full max-w-xl rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServerDetailClient({
  server,
  previewMode = false,
}: {
  server: ServerDetail;
  previewMode?: boolean;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 250);
    return () => clearTimeout(t);
  }, [server.slug]);

  if (!ready) {
    return <ServerDetailSkeleton />;
  }

  return <ServerDetailView server={server} previewMode={previewMode} />;
}
