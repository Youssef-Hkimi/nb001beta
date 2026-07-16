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

import { AUTH_STORAGE_KEY, MOCK_AUTH_USER } from "@/lib/data/mock-user";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  /** Opens login modal; runs onSuccess after a successful mock login. */
  requireAuth: (onSuccess?: () => void) => boolean;
  login: () => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingSuccess, setPendingSuccess] = useState<(() => void) | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed?.discordId && parsed?.username) {
          setUser(parsed);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setIsReady(true);
  }, []);

  const login = useCallback(() => {
    setUser(MOCK_AUTH_USER);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MOCK_AUTH_USER));
    } catch {
      // ignore
    }
    setLoginModalOpen(false);
    pendingSuccess?.();
    setPendingSuccess(null);
  }, [pendingSuccess]);

  const logout = useCallback(() => {
    setUser(null);
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
      if (onSuccess) setPendingSuccess(() => onSuccess);
      setLoginModalOpen(true);
      return false;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      loginModalOpen,
      setLoginModalOpen,
      requireAuth,
      login,
      logout,
      updateUser,
    }),
    [user, isReady, loginModalOpen, requireAuth, login, logout, updateUser],
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
