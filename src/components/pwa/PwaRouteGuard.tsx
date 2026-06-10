"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { isStorefrontPwaRoute } from "@/lib/pwa/config";
import { isStandalonePwa } from "@/lib/pwa/device";
import { openInExternalBrowser } from "@/lib/pwa/navigation";

/** In standalone mode, only the home page stays in the PWA; all shopping opens in Safari/Chrome. */
export default function PwaRouteGuard() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady || !isStandalonePwa()) return;
    const path = router.pathname;
    if (isStorefrontPwaRoute(path)) return;

    const target = router.asPath || path;
    openInExternalBrowser(target);
    router.replace("/");
  }, [router.isReady, router.pathname, router.asPath, router]);

  return null;
}
