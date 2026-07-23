"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { BotOwnerDashboard } from "@/components/dashboard/bot-owner-dashboard";
import { DashboardNav } from "@/components/dashboard/dashboard-sidebar";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";
import { RewardsLanding } from "@/components/dashboard/rewards-landing";
import { ServerOwnerDashboard } from "@/components/dashboard/server-owner-dashboard";
import { UserSettings } from "@/components/dashboard/user-settings";
import { LinkButton } from "@/components/ui/link-button";
import { useAuth } from "@/lib/auth/auth-context";

type DashboardSection = "overview" | "servers" | "bots" | "rewards" | "settings";

export default function DashboardPage() {
  const [section, setSection] = useState<DashboardSection>("overview");
  const { user } = useAuth();

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      setSection(hash === "servers" || hash === "bots" || hash === "rewards" || hash === "settings" ? hash : "overview");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div className="space-y-8">
      <div className="lg:hidden"><DashboardNav /></div>

      {section === "overview" ? (
        <OverviewDashboard username={user?.displayName ?? user?.username ?? "Alex"} />
      ) : null}

      {section === "servers" ? (
        <ServerOwnerDashboard />
      ) : null}

      {section === "bots" ? (
        <BotOwnerDashboard />
      ) : null}

      {section === "rewards" ? (
        <RewardsLanding />
      ) : null}

      {section === "settings" ? (
        <div id="settings" className="space-y-6">
          <PageHeader title="Settings" description="Manage how your profile appears across Nexbiy." />
          <UserSettings />
        </div>
      ) : null}
    </div>
  );
}

function PageHeader({ title, description, actionLabel, actionHref }: { title: string; description: string; actionLabel?: string; actionHref?: string }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1><p className="mt-1 max-w-3xl text-muted">{description}</p></div>{actionLabel && actionHref ? <LinkButton href={actionHref}><Plus className="size-4" />{actionLabel}</LinkButton> : null}</div>;
}
