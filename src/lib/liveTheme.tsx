"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";

export const LIVE_THEME_KEY = "hawola-live-theme";
export type LiveTheme = "dark" | "light";

const DARK = {
  bg: "#0b0d12",
  fg: "#e7e9ee",
  muted: "#94a3b8",
  border: "rgba(255,255,255,0.12)",
  card: "rgba(255,255,255,0.06)",
  input: "rgba(0,0,0,0.35)",
  chip: "rgba(255,255,255,0.08)",
  hover: "rgba(255,255,255,0.12)",
  track: "rgba(255,255,255,0.12)",
};

const LIGHT = {
  bg: "#f3f5f9",
  fg: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
  input: "#ffffff",
  chip: "#e8eef6",
  hover: "#e2e8f0",
  track: "#e2e8f0",
};

let current: LiveTheme = "dark";
const listeners = new Set<(theme: LiveTheme) => void>();

function readStored(): LiveTheme {
  try {
    const saved = window.localStorage.getItem(LIVE_THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "dark";
}

function applyTheme(next: LiveTheme) {
  if (current === next) {
    listeners.forEach((fn) => fn(next));
    return;
  }
  current = next;
  try {
    window.localStorage.setItem(LIVE_THEME_KEY, next);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(next));
}

export function liveThemeStyle(isDark: boolean): CSSProperties {
  const t = isDark ? DARK : LIGHT;
  return {
    backgroundColor: t.bg,
    color: t.fg,
    ["--lv-bg" as string]: t.bg,
    ["--lv-fg" as string]: t.fg,
    ["--lv-muted" as string]: t.muted,
    ["--lv-border" as string]: t.border,
    ["--lv-card" as string]: t.card,
    ["--lv-input" as string]: t.input,
    ["--lv-chip" as string]: t.chip,
    ["--lv-hover" as string]: t.hover,
    ["--lv-track" as string]: t.track,
  };
}

export function useLiveTheme() {
  const [theme, setTheme] = useState<LiveTheme>(current);

  useEffect(() => {
    applyTheme(readStored());
    setTheme(current);
    const onUpdate = (next: LiveTheme) => setTheme(next);
    listeners.add(onUpdate);
    return () => {
      listeners.delete(onUpdate);
    };
  }, []);

  const toggleLiveTheme = useCallback(() => {
    applyTheme(current === "dark" ? "light" : "dark");
  }, []);

  return { theme, isDark: theme === "dark", toggleLiveTheme };
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 3v1.5M12 19.5V21M4.93 4.93l1.06 1.06M17.99 17.99l1.06 1.06M3 12h1.5M19.5 12H21M4.93 19.07l1.06-1.06M17.99 6.01l1.06-1.06"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 14.5A7.5 7.5 0 1 1 9.5 4 6.2 6.2 0 0 0 20 14.5Z"
      />
    </svg>
  );
}

export function LiveThemeToggle({
  isDark,
  onToggle,
  className = "",
}: {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex h-8 w-8 items-center justify-center ${className}`}
      aria-pressed={!isDark}
      aria-label={label}
      title={label}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
