import { isStorefrontPwaRoute } from "./config";
import { isStandalonePwa } from "./device";

export function buildAbsoluteAppUrl(path: string): string {
  if (typeof window === "undefined") return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
}

export function shouldOpenInExternalBrowser(pathname: string): boolean {
  if (!isStandalonePwa()) return false;
  return !isStorefrontPwaRoute(pathname);
}

export function openInExternalBrowser(path: string): void {
  const url = buildAbsoluteAppUrl(path);
  window.open(url, "_blank", "noopener,noreferrer");
}
