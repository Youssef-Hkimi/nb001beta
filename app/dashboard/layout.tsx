"use client";

import { DashboardNav } from "@/components/dashboard/dashboard-sidebar";
import { RequireAuth } from "@/components/auth/require-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1680px] grid-cols-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-7">
        <div className="hidden lg:block">
          <DashboardNav />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </RequireAuth>
  );
}
