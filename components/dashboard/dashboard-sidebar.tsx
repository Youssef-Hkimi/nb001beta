"use client";

import { Bot, Gem, LayoutDashboard, PlusCircle, Server, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "servers", label: "My Servers", icon: Server },
  { id: "bots", label: "My Bots", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const { user } = useAuth();
  const studioName = user ? `${user.displayName ?? user.username}'s Studio` : "Creator Studio";

  useEffect(() => {
    const syncSection = () => {
      const next = window.location.hash.slice(1);
      setActiveSection(SECTIONS.some((item) => item.id === next) ? next : "overview");
    };
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  function openSection(section: string) {
    setActiveSection(section);
    if (pathname === "/dashboard") {
      window.history.replaceState(null, "", `/dashboard#${section}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      return;
    }
    router.push(`/dashboard#${section}`);
  }

  return (
    <aside className="nexus-card sticky top-24 h-fit space-y-1 rounded-2xl p-3">
      <div className="mb-3 px-2 py-2">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Workspace</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{studioName}</p>
      </div>

      {SECTIONS.slice(0, 3).map((item) => {
        const Icon = item.icon;
        const active = pathname === "/dashboard" && activeSection === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => openSection(item.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
              active ? "bg-accent/15 text-accent" : "text-foreground hover:bg-default"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </button>
        );
      })}

      <Link
        href="/dashboard/new"
        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
          pathname.startsWith("/dashboard/new")
            ? "bg-accent text-white shadow-sm"
            : "text-foreground hover:bg-default"
        }`}
      >
        <PlusCircle className="size-4 shrink-0" />
        Create Listing
      </Link>

      {SECTIONS.slice(3).map((item) => {
        const Icon = item.icon;
        const active = pathname === "/dashboard" && activeSection === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => openSection(item.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
              active ? "bg-accent/15 text-accent" : "text-foreground hover:bg-default"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </button>
        );
      })}

      {pathname === "/dashboard" && activeSection === "overview" ? (
        <div className="mt-10 hidden rounded-2xl border border-border bg-default/30 p-4 text-center lg:block">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Gem className="size-6" />
          </span>
          <p className="mt-3 text-sm font-bold text-foreground">Upgrade to Pro</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">Unlock advanced analytics, custom branding, and more.</p>
          <Link href="/dashboard#settings" className="button button--secondary mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl text-xs font-semibold text-accent">
            Upgrade Now
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
