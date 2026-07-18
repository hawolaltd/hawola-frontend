/** Open the Telegram connect link in a new tab without leaving Hawola. */
export function openTelegramConnectUrl(url: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) {
      opened.focus?.();
      return true;
    }
  } catch {
    /* ignore */
  }

  return false;
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
