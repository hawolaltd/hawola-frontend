import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  detectInAppBrowser,
  inAppBrowserInstructions,
  tryOpenInExternalBrowser,
} from "@/lib/inAppBrowser";

const DISMISS_KEY = "hawola_inapp_banner_dismissed";

export default function InAppBrowserBanner() {
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState(() =>
    typeof window !== "undefined"
      ? detectInAppBrowser()
      : { kind: null, isInApp: false, label: "" }
  );

  useEffect(() => {
    setInfo(detectInAppBrowser());
  }, []);

  useEffect(() => {
    if (!info.isInApp || typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* sessionStorage may be blocked too */
    }
    setVisible(true);
  }, [info.isInApp]);

  if (!visible || !info.isInApp) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const openExternal = () => {
    const result = tryOpenInExternalBrowser();
    if (result === "copied") {
      toast.message("Link copied — paste in Safari or Chrome");
      return;
    }
    if (result === "manual") {
      toast.message(inAppBrowserInstructions(info.kind));
    }
  };

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            Shopping in {info.label || "in-app browser"}?
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-900/90">
            {inAppBrowserInstructions(info.kind)} Checkout and cart work best in
            Safari or Chrome.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={openExternal}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Open in browser
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
