import type { Metadata } from "next";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { Providers } from "@/components/providers";
import { WidgetSetupReminderAlert } from "@/components/dashboard/widget-setup-reminder";

import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus — Discord Server & Bot Discovery",
  description:
    "Explore thousands of Discord servers and bots. Join communities, find tools, and grow your server on Nexus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">
        <Providers>
          <SiteNavbar />
          <WidgetSetupReminderAlert />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
