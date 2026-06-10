export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function isIOS(): boolean {
  if (!isBrowser()) return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isAndroid(): boolean {
  if (!isBrowser()) return false;
  return /Android/i.test(navigator.userAgent);
}

export function isMobileUserAgent(): boolean {
  if (!isBrowser()) return false;
  return isIOS() || isAndroid() || /Mobile/i.test(navigator.userAgent);
}

export function isStandalonePwa(): boolean {
  if (!isBrowser()) return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}
