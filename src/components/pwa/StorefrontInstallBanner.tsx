"use client";

import { useEffect, useState } from "react";
import {
  HAWOLA_APP_STORE_URL,
  HAWOLA_PLAY_STORE_URL,
  STOREFRONT_PWA_DISMISS_KEY,
} from "@/lib/pwa/config";
import { isAndroid, isIOS, isMobileUserAgent, isStandalonePwa } from "@/lib/pwa/device";

type Props = {
  /** Only show on the home page. */
  show?: boolean;
};

/**
 * iPhone: Add Hawola home to Home Screen (launcher only — shopping opens in Safari).
 * Android: Play Store app prompt — no PWA install nudge.
 */
export default function StorefrontInstallBanner({ show = true }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show || !isMobileUserAgent() || isStandalonePwa()) return;
    try {
      if (sessionStorage.getItem(STOREFRONT_PWA_DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, [show]);

  if (!visible) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(STOREFRONT_PWA_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (isAndroid()) {
    return (
      <div
        className="fixed bottom-4 left-4 right-4 z-[120] mx-auto max-w-md rounded-xl border border-white/20 bg-headerBg px-4 py-3 text-white shadow-xl lg:hidden"
        role="region"
        aria-label="Download the Hawola app"
      >
        <p className="text-sm font-semibold">Get the Hawola app</p>
        <p className="mt-1 text-xs text-white/85">
          For the best Android experience, download our app from Google Play.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={HAWOLA_PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-secondaryTextColor px-3 py-2 text-xs font-bold text-headerBg"
          >
            Google Play
          </a>
          <button type="button" onClick={dismiss} className="rounded-lg px-3 py-2 text-xs text-white/80 underline">
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (!isIOS()) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[120] mx-auto max-w-md rounded-xl border border-white/20 bg-headerBg px-4 py-3 text-white shadow-xl lg:hidden"
      role="region"
      aria-label="Add Hawola to Home Screen"
    >
      <p className="text-sm font-semibold">Add Hawola to your Home Screen</p>
      <p className="mt-1 text-xs leading-relaxed text-white/85">
        Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> for a quick shop entry point. Product pages and checkout open in Safari.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg bg-secondaryTextColor px-3 py-2 text-xs font-bold text-headerBg"
        >
          Got it
        </button>
        <a
          href={HAWOLA_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/90 underline"
        >
          App Store app (coming soon)
        </a>
      </div>
    </div>
  );
}
