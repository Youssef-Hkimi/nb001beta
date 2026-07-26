import type { CSSProperties } from "react";

export function formatCount(n: number | null | undefined): string {
  const value = typeof n === "number" && Number.isFinite(n) ? n : 0;
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
}

export function initials(name: string): string {
  const parts = name
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (
    parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U"
  );
}

export function bannerStyle(hue: string): CSSProperties {
  return {
    background: `linear-gradient(135deg, hsl(${hue} 72% 58%) 0%, hsl(${hue} 65% 42%) 48%, hsl(${Number(hue) + 28} 70% 48%) 100%)`,
  };
}
