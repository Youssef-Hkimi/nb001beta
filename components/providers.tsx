"use client";

import { Toast } from "@heroui/react";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/lib/auth/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <div className="min-h-full">{children}</div>
        <Toast.Provider placement="top" maxVisibleToasts={3} />
      </AuthProvider>
    </ThemeProvider>
  );
}
