/** Canonical URL to open from a home-screen shortcut (always the real browser site). */

export function getShortcutBrowserUrl(): string {
  const fromEnv =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL) ||
    "";

  if (typeof window === "undefined") {
    const base = fromEnv.replace(/\/+$/, "");
    return base || "https://hawola.com";
  }

  const base = (fromEnv || window.location.origin).replace(/\/+$/, "");
  const path = window.location.pathname || "/";
  const search = window.location.search || "";
  return `${base}${path}${search}`;
}
