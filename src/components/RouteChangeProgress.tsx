import type { NextRouter } from "next/router";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

function destinationFromHref(
  href: string | null,
  baseOrigin: string
): string | null {
  if (!href || href === "#" || href.startsWith("#")) return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  try {
    const u = new URL(href, baseOrigin);
    if (u.origin !== baseOrigin) return null;
    return `${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

/**
 * Whether clicking this anchor should show instant navigation feedback.
 * Avoids same-route / new-tab / modifier-key navigations.
 */
function shouldTriggerClickNav(
  e: MouseEvent,
  router: NextRouter,
  anchor: HTMLAnchorElement
): boolean {
  if (e.defaultPrevented) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return false;
  }
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }
  if (typeof window === "undefined") return false;

  const dest = destinationFromHref(anchor.getAttribute("href"), window.location.origin);
  if (!dest) return false;

  const current = router.asPath.split("#")[0] || "";
  if (dest === current) return false;

  return true;
}

/**
 * Top progress bar + light overlay: starts on internal link **click** (capture, before
 * routeChangeStart) so navigation never feels frozen during chunk load. Router events
 * still drive cleanup for programmatic `router.push` and errors.
 *
 * Pages Router: there is no `loading.tsx`; this is the closest global pattern.
 */
export default function RouteChangeProgress() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setActive(true);
    clearSafetyTimer();
    safetyTimerRef.current = setTimeout(() => setActive(false), 18_000);
  }, [clearSafetyTimer]);

  const end = useCallback(() => {
    clearSafetyTimer();
    setActive(false);
  }, [clearSafetyTimer]);

  useEffect(() => {
    const onStart = () => start();
    const onEnd = () => end();
    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onEnd);
    router.events.on("routeChangeError", onEnd);
    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onEnd);
      router.events.off("routeChangeError", onEnd);
    };
  }, [router, start, end]);

  useEffect(() => {
    const onPointerDownCapture = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const anchor = t.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldTriggerClickNav(e, router, anchor)) return;
      start();
    };

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, [router, start]);

  useEffect(() => () => clearSafetyTimer(), []);

  if (!active) return null;

  return (
    <>
      {/* Subtle veil + pointer-events-none so navigation still runs */}
      <div
        className="pointer-events-none fixed inset-0 z-[9998] flex items-start justify-center bg-slate-900/[0.04] pt-28 backdrop-blur-[1px] transition-opacity"
        aria-hidden
      >
        <div className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-4 py-2 text-xs font-medium text-slate-600 shadow-lg">
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
          <span>Loading…</span>
        </div>
      </div>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-[3px] overflow-hidden bg-primary/15"
        role="progressbar"
        aria-label="Loading page"
        aria-busy="true"
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full w-1/3 bg-primary shadow-sm animate-route-indeterminate" />
      </div>
    </>
  );
}
