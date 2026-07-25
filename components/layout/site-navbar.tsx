"use client";

import { Avatar, Button, Drawer, Dropdown, toast } from "@heroui/react";
import {
  Bell,
  Gift,
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
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DiscordMark } from "@/components/ui/discord-mark";
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

const REWARDS_ITEM = {
  href: "/rewards",
  label: "Rewards",
  match: (p: string) => p.startsWith("/rewards"),
};

export function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    action_url: string | null;
    read_at: string | null;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, isReady, logout } = useAuth();
  const accountName = user?.displayName ?? user?.username;
  const inboxEnabled = user?.inboxNotifications !== false;
  const visibleNavItems =
    isReady && !isAuthenticated
      ? [...NAV_ITEMS.slice(0, 3), REWARDS_ITEM, ...NAV_ITEMS.slice(3)]
      : NAV_ITEMS;

  useEffect(() => {
    if (!isAuthenticated || !inboxEnabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const controller = new AbortController();
    void fetch("/api/notifications", {cache: "no-store", signal: controller.signal})
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as {
          notifications?: typeof notifications;
          unreadCount?: number;
        };
        setNotifications(result.notifications || []);
        setUnreadCount(result.unreadCount || 0);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [inboxEnabled, isAuthenticated]);

  function notificationIcon(type: string) {
    if (type.includes("vote")) return <ThumbsUp className="size-4 text-accent" />;
    if (type.includes("announcement")) return <Megaphone className="size-4 text-violet-400" />;
    return <ShieldCheck className="size-4 text-emerald-500" />;
  }

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
          <span className="text-lg font-bold tracking-tight text-foreground">Nexbiy</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-5 lg:flex">
          {visibleNavItems.map((item) => {
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
                  {unreadCount > 0 ? <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent ring-2 ring-background" /> : null}
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end" className="w-[min(92vw,23rem)]">
                  <Dropdown.Menu
                    aria-label="Inbox notifications"
                    onAction={(key) => {
                      const selected = notifications.find((item) => item.id === String(key));
                      if (!selected) return;
                      if (!selected.read_at) {
                        setNotifications((items) => items.map((item) => (
                          item.id === selected.id ? {...item, read_at: new Date().toISOString()} : item
                        )));
                        setUnreadCount((count) => Math.max(0, count - 1));
                        void fetch("/api/notifications", {
                          method: "PATCH",
                          headers: {"Content-Type": "application/json"},
                          body: JSON.stringify({id: selected.id}),
                        });
                      }
                      if (selected.action_url?.startsWith("/")) router.push(selected.action_url);
                    }}
                  >
                    {notifications.length ? notifications.map((item) => (
                      <Dropdown.Item key={item.id} id={item.id} textValue={item.title}>
                        {notificationIcon(item.type)}
                        <div className={item.read_at ? "opacity-70" : ""}>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="line-clamp-2 text-xs text-muted">{item.body}</p>
                        </div>
                      </Dropdown.Item>
                    )) : (
                      <Dropdown.Item id="empty" textValue="No notifications" isDisabled>
                        <Bell className="size-4 text-muted" />
                        <p className="text-sm text-muted">
                          {inboxEnabled ? "No notifications yet." : "Inbox notifications are disabled."}
                        </p>
                      </Dropdown.Item>
                    )}
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
                    if (key === "admin") router.push("/admin");
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
                  <Dropdown.Item id="admin" textValue="Admin panel">
                    <ShieldCheck className="size-4" />
                    Admin panel
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
              <DiscordMark className="size-4" />
              Login with Discord
            </Button>
          )}

          <Button
            isIconOnly
            aria-label="Open menu"
            className="shrink-0"
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
                {visibleNavItems.map((item) => {
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
                      {item.label === "Rewards" ? <Gift className="size-4" /> : null}
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
                      variant="secondary"
                      onPress={() => {
                        setMobileOpen(false);
                        router.push("/admin");
                      }}
                    >
                      <ShieldCheck className="size-4" />
                      Admin panel
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
                    <DiscordMark className="size-4" />
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
