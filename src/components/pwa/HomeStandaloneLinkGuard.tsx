"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { isStorefrontPwaRoute } from "@/lib/pwa/config";
import { isStandalonePwa } from "@/lib/pwa/device";
import { openInExternalBrowser } from "@/lib/pwa/navigation";

/** On home in standalone mode, send internal links straight to Safari (no in-PWA navigation flash). */
export default function HomeStandaloneLinkGuard() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady || router.pathname !== "/" || !isStandalonePwa()) return;

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target === "_blank") return;

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (isStorefrontPwaRoute(url.pathname)) return;

      event.preventDefault();
      event.stopPropagation();
      openInExternalBrowser(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router.isReady, router.pathname]);

  return null;
}
