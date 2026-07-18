export type TelegramOpenMode = "popup" | "same_tab";

/** Mobile / iOS browsers block async popups; same-tab navigation is reliable for t.me links. */
export function shouldUseSameTabForExternalLinks(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod|Android|webOS|Mobile/i.test(ua);
}

/** Open a blank tab synchronously on click — before any await — to keep the user gesture. */
export function openExternalUrlPending(): Window | null {
  if (typeof window === "undefined" || shouldUseSameTabForExternalLinks()) {
    return null;
  }
  try {
    return window.open("about:blank", "_blank", "noopener,noreferrer");
  } catch {
    return null;
  }
}

export function openTelegramConnectUrl(url: string, pending: Window | null): TelegramOpenMode {
  if (typeof window === "undefined") return "same_tab";

  if (!shouldUseSameTabForExternalLinks() && pending && !pending.closed) {
    try {
      pending.location.href = url;
      pending.focus?.();
      return "popup";
    } catch {
      try {
        pending.close();
      } catch {
        /* ignore */
      }
    }
  }

  if (!shouldUseSameTabForExternalLinks()) {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) return "popup";
  }

  window.location.assign(url);
  return "same_tab";
}

export async function startTelegramConnectFlow(
  fetchLink: () => Promise<{ connect_url: string }>
): Promise<{ url: string; mode: TelegramOpenMode }> {
  const pending = openExternalUrlPending();
  try {
    const result = await fetchLink();
    const mode = openTelegramConnectUrl(result.connect_url, pending);
    return { url: result.connect_url, mode };
  } catch (error) {
    try {
      pending?.close();
    } catch {
      /* ignore */
    }
    throw error;
  }
}

export async function copyTelegramConnectUrl(url: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    /* fall through to legacy copy */
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}
