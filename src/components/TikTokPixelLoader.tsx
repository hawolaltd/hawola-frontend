import { useRouter } from "next/router";
import { useEffect } from "react";
import { TIKTOK_PIXEL_ID } from "@/lib/tiktokPixelHeadScript";

function fireTikTokPageView(): void {
  if (typeof window === "undefined" || !window.ttq) return;
  if (typeof window.ttq.page === "function") {
    window.ttq.page();
    return;
  }
  window.ttq.push?.(["page"]);
}

/** Base pixel lives in `_document` <head>. This fires ttq.page() on client route changes. */
export default function TikTokPixelLoader() {
  const router = useRouter();

  useEffect(() => {
    const onRouteChange = () => fireTikTokPageView();
    router.events.on("routeChangeComplete", onRouteChange);
    return () => {
      router.events.off("routeChangeComplete", onRouteChange);
    };
  }, [router.events]);

  if (!TIKTOK_PIXEL_ID) return null;
  return null;
}
