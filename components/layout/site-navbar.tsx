"use client";

import { Avatar, Button, Drawer, Dropdown, SearchField, toast } from "@heroui/react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
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
  const { user, isAuthenticated, requireAuth, logout } = useAuth();
  const accountName = user?.displayName ?? user?.username;

  function goDashboard() {
    requireAuth(() => router.push("/dashboard"));
  }

  function goCreateListing() {
    requireAuth(() => router.push("/dashboard/new"));
  }

  return (
    <header className="navbar-shell sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Link href="/explore" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#629BF8] to-[#82B0F9] text-white shadow-sm">
            <Sparkles className="size-4" />
          </span>
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
          <div className="hidden w-48 md:block lg:w-56">
            <SearchField aria-label="Search Nexus" className="w-full">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </div>

          <ThemeToggle />

          {isAuthenticated && user ? (
            <Dropdown>
              <Dropdown.Trigger
                aria-label="Account menu"
                className="hidden items-center gap-2 rounded-full border border-border bg-default/50 py-1 pr-2.5 pl-1 sm:inline-flex"
              >
                <Avatar className="size-8">
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
                <SearchField aria-label="Search Nexus" className="mb-3 w-full">
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search servers & bots..." />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
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
