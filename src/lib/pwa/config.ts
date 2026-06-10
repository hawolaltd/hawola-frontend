/** Only the storefront home page stays in the installed PWA shell. */

export function isStorefrontPwaRoute(pathname: string): boolean {
  const path = pathname.split("?")[0].split("#")[0] || "/";
  return path === "/" || path === "";
}

export const STOREFRONT_PWA_DISMISS_KEY = "hawola_storefront_pwa_install_dismissed_v1";
