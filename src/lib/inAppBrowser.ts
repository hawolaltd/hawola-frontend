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

/** Best-effort nudge to open the current page in the system browser. */
export function tryOpenInExternalBrowser(url?: string): "opened" | "copied" | "manual" {
  if (typeof window === "undefined") return "manual";
  const target = url || window.location.href;

  if (/android/i.test(navigator.userAgent)) {
    try {
      const stripped = target.replace(/^https?:\/\//i, "");
      window.location.href = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`;
      return "opened";
    } catch {
      /* fall through */
    }
  }

  try {
    window.open(target, "_blank", "noopener,noreferrer");
    return "opened";
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
