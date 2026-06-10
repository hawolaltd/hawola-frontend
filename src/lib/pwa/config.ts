/** Only the storefront home page stays in the installed PWA shell. */

export function isStorefrontPwaRoute(pathname: string): boolean {
  const path = pathname.split("?")[0].split("#")[0] || "/";
  return path === "/" || path === "";
}

export const HAWOLA_PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_HAWOLA_PLAY_STORE_URL ||
  "https://play.google.com/store/apps/details?id=com.hawola.app";

export const HAWOLA_APP_STORE_URL =
  process.env.NEXT_PUBLIC_HAWOLA_APP_STORE_URL ||
  "https://apps.apple.com/app/hawola/id0000000000";

export const STOREFRONT_PWA_DISMISS_KEY = "hawola_storefront_pwa_install_dismissed_v1";
