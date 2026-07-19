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
  updateUser: (updates: Partial<AuthUser>) => void;
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
        let saved: AuthUser | null = null;
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) saved = JSON.parse(raw) as AuthUser;
        const sameUser = saved?.discordId === data.user.discordId ? saved : null;
        const nextUser: AuthUser = {
          ...data.user,
          displayName: sameUser?.displayName ?? data.user.displayName,
          bio: sameUser?.bio,
          inboxNotifications: sameUser?.inboxNotifications ?? data.user.inboxNotifications,
          notificationPreferences:
            sameUser?.notificationPreferences ?? data.user.notificationPreferences,
          socials: sameUser?.socials,
        };
        setUser(nextUser);
        setDiscordServers(data.guilds);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
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

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...updates };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore unavailable storage
      }
      return next;
    });
  }, []);

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
