import { Card } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";

import { DASHBOARD_STATS } from "@/lib/data/dashboard";

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {DASHBOARD_STATS.map((stat) => (
        <Card key={stat.id} className="nexus-card hover-lift gap-2 p-4">
          <p className="text-xs font-medium text-muted">{stat.label}</p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              <ArrowUpRight className="size-3.5" />
              {stat.delta}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
