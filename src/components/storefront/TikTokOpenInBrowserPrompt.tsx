import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import {
  buildExternalBrowserUrl,
  copyExternalBrowserUrl,
  inAppBrowserInstructions,
  isTikTokInAppBrowser,
  tryOpenInExternalBrowser,
} from "@/lib/inAppBrowser";

const DISMISS_KEY = "hawola_tiktok_open_browser_dismissed";

function truncateUrl(url: string, max = 56): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

export default function TikTokOpenInBrowserPrompt() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [isTikTok, setIsTikTok] = useState(false);

  const targetUrl = useMemo(
    () => buildExternalBrowserUrl(router.asPath),
    [router.asPath]
  );

  useEffect(() => {
    setIsTikTok(isTikTokInAppBrowser());
  }, []);

  useEffect(() => {
    if (!isTikTok || typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* sessionStorage may be blocked in some webviews */
    }
    setVisible(true);
  }, [isTikTok]);

  if (!visible || !isTikTok) {
    return null;
  }

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const openExternal = () => {
    const result = tryOpenInExternalBrowser(targetUrl);
    if (result === "copied") {
      toast.message("Link copied — paste in Safari or Chrome to open this page");
      return;
    }
    if (result === "manual") {
      toast.message(inAppBrowserInstructions("tiktok"));
    }
  };

  const copyLink = async () => {
    const copied = await copyExternalBrowserUrl(targetUrl);
    if (copied) {
      toast.message("Link copied — paste in Safari or Chrome");
      return;
    }
    toast.message(inAppBrowserInstructions("tiktok"));
  };

  return (
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
          Cart, checkout, and sign-in work best outside the TikTok app. We&apos;ll
          open the same page you&apos;re viewing now.
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
            onClick={dismiss}
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
  );
}
