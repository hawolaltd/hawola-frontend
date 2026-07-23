import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import {
  buildExternalBrowserUrl,
  copyExternalBrowserUrl,
  inAppBrowserInstructions,
  isTikTokInAppBrowser,
  tryOpenInExternalBrowser,
} from "@/lib/inAppBrowser";

const MODAL_DISMISSED_KEY = "hawola_tiktok_modal_dismissed";
const BANNER_ACTIVE_KEY = "hawola_tiktok_banner_active";
const BANNER_DISMISSED_KEY = "hawola_tiktok_banner_dismissed";
const HANDOFF_CHECK_MS = 1600;

function truncateUrl(url: string, max = 56): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

function readSessionFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

type TikTokBrowserBannerProps = {
  targetUrl: string;
  onOpenExternal: () => void;
  onCopyLink: () => void;
  onDismiss: () => void;
};

function TikTokBrowserBanner({
  targetUrl,
  onOpenExternal,
  onCopyLink,
  onDismiss,
}: TikTokBrowserBannerProps) {
  return (
    <div
      role="status"
      className="sticky top-0 z-[190] border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 shadow-sm"
    >
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold sm:text-sm">
            For the best experience, open in Safari or Chrome
          </p>
          <p className="mt-0.5 hidden text-[11px] leading-snug text-amber-900/90 sm:block">
            {inAppBrowserInstructions("tiktok")}
          </p>
          <p
            className="mt-0.5 truncate text-[10px] text-amber-800/70 sm:hidden"
            title={targetUrl}
          >
            {truncateUrl(targetUrl, 42)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenExternal}
            className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-700 sm:px-3 sm:text-xs"
          >
            Open in browser
          </button>
          <button
            type="button"
            onClick={onCopyLink}
            className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 sm:px-3 sm:text-xs"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-amber-800/80 hover:text-amber-950 sm:text-xs"
            aria-label="Dismiss banner"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TikTokOpenInBrowserPrompt() {
  const router = useRouter();
  const handoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTikTok, setIsTikTok] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const targetUrl = useMemo(
    () => buildExternalBrowserUrl(router.asPath),
    [router.asPath]
  );

  const activateBanner = useCallback(() => {
    writeSessionFlag(BANNER_ACTIVE_KEY);
    writeSessionFlag(MODAL_DISMISSED_KEY);
    setShowModal(false);
    setShowBanner(true);
  }, []);

  useEffect(() => {
    setIsTikTok(isTikTokInAppBrowser());
  }, []);

  useEffect(() => {
    if (!isTikTok || typeof window === "undefined") return;

    if (readSessionFlag(BANNER_DISMISSED_KEY)) {
      setShowModal(false);
      setShowBanner(false);
      return;
    }

    if (readSessionFlag(BANNER_ACTIVE_KEY) || readSessionFlag(MODAL_DISMISSED_KEY)) {
      setShowModal(false);
      setShowBanner(true);
      return;
    }

    setShowModal(true);
    setShowBanner(false);
  }, [isTikTok]);

  useEffect(() => {
    return () => {
      if (handoffTimerRef.current) {
        clearTimeout(handoffTimerRef.current);
      }
    };
  }, []);

  const dismissBanner = () => {
    writeSessionFlag(BANNER_DISMISSED_KEY);
    setShowBanner(false);
  };

  const continueInTikTok = () => {
    activateBanner();
  };

  const openExternal = () => {
    const result = tryOpenInExternalBrowser(targetUrl);

    if (result === "copied") {
      toast.message("Link copied — paste in Safari or Chrome to open this page");
      activateBanner();
      return;
    }

    if (result === "manual") {
      toast.message(inAppBrowserInstructions("tiktok"));
      activateBanner();
      return;
    }

    // Handoff was attempted — if we're still here shortly after, show the banner.
    if (handoffTimerRef.current) {
      clearTimeout(handoffTimerRef.current);
    }
    handoffTimerRef.current = setTimeout(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "hidden") {
        activateBanner();
      }
    }, HANDOFF_CHECK_MS);
  };

  const copyLink = async () => {
    const copied = await copyExternalBrowserUrl(targetUrl);
    if (copied) {
      toast.message("Link copied — paste in Safari or Chrome");
    } else {
      toast.message(inAppBrowserInstructions("tiktok"));
    }
    activateBanner();
  };

  if (!isTikTok) {
    return null;
  }

  return (
    <>
      {showBanner ? (
        <TikTokBrowserBanner
          targetUrl={targetUrl}
          onOpenExternal={openExternal}
          onCopyLink={() => void copyLink()}
          onDismiss={dismissBanner}
        />
      ) : null}

      {showModal ? (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tiktok-open-browser-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              TikTok browser detected
            </p>
            <h2
              id="tiktok-open-browser-title"
              className="mt-2 text-lg font-bold text-slate-900"
            >
              Open this page in Safari or Chrome
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Cart, checkout, and sign-in work best outside the TikTok app.
              We&apos;ll open the same page you&apos;re viewing now.
            </p>
            <p
              className="mt-3 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500"
              title={targetUrl}
            >
              {truncateUrl(targetUrl, 64)}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={openExternal}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Open in Safari / Chrome
              </button>
              <button
                type="button"
                onClick={() => void copyLink()}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Copy link
              </button>
              <button
                type="button"
                onClick={continueInTikTok}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Continue in TikTok
              </button>
            </div>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
              {inAppBrowserInstructions("tiktok")}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
