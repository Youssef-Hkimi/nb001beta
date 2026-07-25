"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AUTH_STORAGE_KEY } from "@/lib/data/mock-user";
import type { AuthUser, DiscordServer } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  discordServers: DiscordServer[];
  /** Runs the action when signed in; otherwise redirects to the login page. */
  requireAuth: (onSuccess?: () => void) => boolean;
  login: (nextPath?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [discordServers, setDiscordServers] = useState<DiscordServer[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDiscordSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }
        const data = await response.json() as {
          user: AuthUser;
          guilds: DiscordServer[];
        };
        setUser(data.user);
        setDiscordServers(data.guilds);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setUser(null);
          setDiscordServers([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsReady(true);
      }
    }

    void loadDiscordSession();
    return () => controller.abort();
  }, []);

  const login = useCallback((nextPath = "/dashboard") => {
    const safePath = nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";
    window.location.assign(`/api/auth/discord?next=${encodeURIComponent(safePath)}`);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setDiscordServers([]);
    void fetch("/api/auth/logout", {method: "POST", keepalive: true});
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    const current = user;
    if (!current) throw new Error("authentication_required");
    const next = {...current, ...updates};
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        bio: next.bio || "",
        inboxNotifications: next.inboxNotifications ?? true,
        notificationPreferences: {
          listingUpdates: next.notificationPreferences?.listingUpdates ?? true,
          likeMilestones: next.notificationPreferences?.likeMilestones ?? true,
          announcements: next.notificationPreferences?.announcements ?? true,
        },
        socials: {
          x: next.socials?.x || "",
          github: next.socials?.github || "",
          roblox: next.socials?.roblox || "",
        },
      }),
    });
    if (!response.ok) throw new Error("profile_update_failed");
    setUser(next);
  }, [user]);

  const requireAuth = useCallback(
    (onSuccess?: () => void) => {
      if (user) {
        onSuccess?.();
        return true;
      }
      const returnPath = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?next=${encodeURIComponent(returnPath)}`);
      return false;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      discordServers,
      requireAuth,
      login,
      logout,
      updateUser,
    }),
    [user, isReady, discordServers, requireAuth, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
