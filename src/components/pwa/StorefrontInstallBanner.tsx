"use client";

import { useEffect, useState } from "react";
import { STOREFRONT_PWA_DISMISS_KEY } from "@/lib/pwa/config";
import { isIOS, isMobileUserAgent, isStandalonePwa } from "@/lib/pwa/device";

type Props = {
  /** Only show on the home page. */
  show?: boolean;
};

/** iPhone: Add Hawola to Home Screen (shortcut opens site in Safari). */
export default function StorefrontInstallBanner({ show = true }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show || !isIOS() || !isMobileUserAgent() || isStandalonePwa()) return;
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

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[120] mx-auto max-w-md rounded-xl border border-white/20 bg-headerBg px-4 py-3 text-white shadow-xl lg:hidden"
      role="region"
      aria-label="Add Hawola to Home Screen"
    >
      <p className="text-sm font-semibold">Add Hawola to your Home Screen</p>
      <p className="mt-1 text-xs leading-relaxed text-white/85">
        Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> for a quick shortcut. It opens the full
        site in Safari when you tap it.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 rounded-lg bg-secondaryTextColor px-3 py-2 text-xs font-bold text-headerBg"
      >
        Got it
      </button>
    </div>
  );
}
