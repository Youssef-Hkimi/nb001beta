"use client";

import { Avatar, Button, Drawer, Dropdown, toast } from "@heroui/react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  PlusCircle,
  Search,
  ShieldCheck,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { IconifyIcon } from "@/components/ui/iconify-icon";
import { useAuth } from "@/lib/auth/auth-context";
import { initials } from "@/lib/format";

const NAV_ITEMS = [
  { href: "/explore", label: "Explore", match: (p: string) => p.startsWith("/explore") },
  { href: "/server", label: "Servers", match: (p: string) => p.startsWith("/server") },
  { href: "/bots", label: "Bots", match: (p: string) => p.startsWith("/bots") },
  {
    href: "/dashboard",
    label: "Dashboard",
    match: (p: string) => p.startsWith("/dashboard"),
  },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const accountName = user?.displayName ?? user?.username;
  const inboxEnabled = user?.inboxNotifications !== false;

  function goDashboard() {
    if (isAuthenticated) router.push("/dashboard");
    else router.push("/login?next=/dashboard");
  }

  function goCreateListing() {
    if (isAuthenticated) router.push("/dashboard/new");
    else router.push("/login?next=/dashboard/new");
  }

  return (
    <header className="navbar-shell sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Link href="/explore" className="flex shrink-0 items-center gap-2.5">
          <Image src="/nexus-logo.jpg" alt="" width={36} height={36} priority className="size-9 rounded-xl object-cover" />
          <span className="text-lg font-bold tracking-tight text-foreground">Nexus</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            if (item.href === "/dashboard") {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={goDashboard}
                  className={`nav-link ${active ? "nav-link-active" : ""}`}
                >
                  {item.label}
                </button>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              <Dropdown>
                <Dropdown.Trigger
                  aria-label="Open inbox"
                  className="relative inline-flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-default hover:text-foreground"
                >
                  <Bell className="size-5" />
                  {inboxEnabled ? <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent ring-2 ring-background" /> : null}
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end" className="w-[min(92vw,23rem)]">
                  <Dropdown.Menu
                    aria-label="Inbox notifications"
                    onAction={(key) => {
                      if (key === "listing") router.push("/dashboard");
                      if (key === "likes") router.push("/dashboard?tab=servers");
                      if (key === "announcement") router.push("/verification");
                    }}
                  >
                    <Dropdown.Item id="listing" textValue="Listing approved">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      <div><p className="text-sm font-medium">Nexus Hub is live</p><p className="text-xs text-muted">Your listing passed the latest status check.</p></div>
                    </Dropdown.Item>
                    <Dropdown.Item id="likes" textValue="Like milestone">
                      <ThumbsUp className="size-4 text-accent" />
                      <div><p className="text-sm font-medium">New like milestone</p><p className="text-xs text-muted">Lofi Girl reached 10K likes.</p></div>
                    </Dropdown.Item>
                    <Dropdown.Item id="announcement" textValue="Nexus announcement">
                      <Megaphone className="size-4 text-violet-400" />
                      <div><p className="text-sm font-medium">Nexus announcement</p><p className="text-xs text-muted">Verification eligibility has been updated.</p></div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
              <Dropdown>
              <Dropdown.Trigger
                aria-label="Account menu"
                className="hidden items-center gap-2 rounded-full border border-border bg-default/50 py-1 pr-2.5 pl-1 sm:inline-flex"
              >
                <Avatar className="size-8">
                  {user.avatarUrl ? <Avatar.Image alt="" src={user.avatarUrl} /> : null}
                  <Avatar.Fallback className="bg-accent/20 text-xs font-bold text-accent">
                    {initials(accountName ?? user.username)}
                  </Avatar.Fallback>
                </Avatar>
                <span className="max-w-[7rem] truncate text-sm font-medium text-foreground">
                  {accountName}
                </span>
              </Dropdown.Trigger>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === "dashboard") router.push("/dashboard");
                    if (key === "create") router.push("/dashboard/new");
                    if (key === "logout") {
                      logout();
                      toast.success("Signed out");
                      if (pathname.startsWith("/dashboard")) router.push("/explore");
                    }
                  }}
                >
                  <Dropdown.Item id="dashboard" textValue="Dashboard">
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item id="create" textValue="Create listing">
                    <PlusCircle className="size-4" />
                    Create listing
                  </Dropdown.Item>
                  <Dropdown.Item id="logout" textValue="Log out" variant="danger">
                    <LogOut className="size-4" />
                    Log out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
              </Dropdown>
            </>
          ) : (
            <Button className="hidden sm:inline-flex" onPress={() => router.push("/login")}>
              <IconifyIcon icon="ic:baseline-discord" className="size-4" />
              Login with Discord
            </Button>
          )}

          <Button
            isIconOnly
            aria-label="Open menu"
            className="lg:hidden"
            variant="ghost"
            onPress={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <Drawer>
        <Drawer.Backdrop isOpen={mobileOpen} onOpenChange={setMobileOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="w-[min(100vw,20rem)]">
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Menu</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        if (item.href === "/dashboard") goDashboard();
                        else router.push(item.href);
                      }}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                        active
                          ? "bg-accent/15 text-accent"
                          : "text-foreground hover:bg-default"
                      }`}
                    >
                      {item.label === "Dashboard" ? <LayoutDashboard className="size-4" /> : null}
                      {item.label === "Explore" ? <Search className="size-4" /> : null}
                      {item.label}
                    </button>
                  );
                })}

                {isAuthenticated && user ? (
                  <>
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
                      <UserRound className="size-4 text-accent" />
                      <span className="text-sm font-medium">{accountName}</span>
                    </div>
                    <Button
                      className="mt-2 w-full"
                      variant="secondary"
                      onPress={() => {
                        setMobileOpen(false);
                        goCreateListing();
                      }}
                    >
                      <PlusCircle className="size-4" />
                      Create listing
                    </Button>
                    <Button
                      className="w-full"
                      variant="danger"
                      onPress={() => {
                        setMobileOpen(false);
                        logout();
                        toast.success("Signed out");
                        router.push("/explore");
                      }}
                    >
                      <LogOut className="size-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button
                    className="mt-3 w-full"
                    onPress={() => {
                      setMobileOpen(false);
                      router.push("/login");
                    }}
                  >
                    <IconifyIcon icon="ic:baseline-discord" className="size-4" />
                    Login with Discord
                  </Button>
                )}
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </header>
  );
}
