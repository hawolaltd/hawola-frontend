/** Detect social in-app browsers (TikTok, Instagram, Facebook) that often break storage/JS. */

export type InAppBrowserKind = "tiktok" | "instagram" | "facebook" | "other" | null;

export type InAppBrowserInfo = {
  kind: InAppBrowserKind;
  isInApp: boolean;
  label: string;
};

const IN_APP_UA =
  /(?:tiktok|musical_ly|bytedancewebview|instagram|fbav|fban|fbios|fb_iab|line\/|micromessenger|twitter)/i;

export function detectInAppBrowser(userAgent?: string): InAppBrowserInfo {
  const ua =
    userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  if (!ua || !IN_APP_UA.test(ua)) {
    return { kind: null, isInApp: false, label: "" };
  }
  if (/tiktok|musical_ly|bytedancewebview/i.test(ua)) {
    return { kind: "tiktok", isInApp: true, label: "TikTok" };
  }
  if (/instagram/i.test(ua)) {
    return { kind: "instagram", isInApp: true, label: "Instagram" };
  }
  if (/fbav|fban|fbios|fb_iab|facebook/i.test(ua)) {
    return { kind: "facebook", isInApp: true, label: "Facebook" };
  }
  return { kind: "other", isInApp: true, label: "in-app browser" };
}

export function isLikelyRestrictedWebView(userAgent?: string): boolean {
  return detectInAppBrowser(userAgent).isInApp;
}

export function isTikTokInAppBrowser(userAgent?: string): boolean {
  return detectInAppBrowser(userAgent).kind === "tiktok";
}

/**
 * Build the exact page URL to open externally (path, query, and hash preserved).
 * Pass `pagePath` from Next.js `router.asPath` when available for SPA navigations.
 */
export function buildExternalBrowserUrl(pagePath?: string): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const path = pagePath ?? `${window.location.pathname}${window.location.search}`;
  const hash = window.location.hash || "";
  return `${origin}${path.startsWith("/") ? path : `/${path}`}${hash}`;
}

/** Best-effort nudge to open the current page in the system browser. */
export function tryOpenInExternalBrowser(url?: string): "opened" | "copied" | "manual" {
  if (typeof window === "undefined") return "manual";
  const target = url || buildExternalBrowserUrl();
  const ua = navigator.userAgent;

  if (/iphone|ipad|ipod/i.test(ua)) {
    try {
      const withoutProtocol = target.replace(/^https:\/\//i, "");
      window.location.href = `x-safari-https://${withoutProtocol}`;
      return "opened";
    } catch {
      /* fall through */
    }
  }

  if (/android/i.test(ua)) {
    try {
      const stripped = target.replace(/^https?:\/\//i, "");
      window.location.href =
        `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;` +
        `S.browser_fallback_url=${encodeURIComponent(target)};end`;
      return "opened";
    } catch {
      /* fall through */
    }
  }

  try {
    const opened = window.open(target, "_blank", "noopener,noreferrer");
    if (opened) return "opened";
  } catch {
    /* fall through */
  }

  try {
    void navigator.clipboard.writeText(target);
    return "copied";
  } catch {
    return "manual";
  }
}

export async function copyExternalBrowserUrl(url?: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const target = url || buildExternalBrowserUrl();
  try {
    await navigator.clipboard.writeText(target);
    return true;
  } catch {
    return false;
  }
}

export function inAppBrowserInstructions(kind: InAppBrowserKind): string {
  if (kind === "tiktok") {
    return "Tap ⋯ (top right) → Open in browser, or copy the link and open in Safari/Chrome.";
  }
  if (kind === "instagram") {
    return "Tap ⋯ → Open in browser for checkout and cart.";
  }
  if (kind === "facebook") {
    return "Tap the menu (⋯) → Open in external browser.";
  }
  return "Open this page in Safari or Chrome for the best checkout experience.";
}
