"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isIOS, isStandalonePwa } from "@/lib/pwa/device";
import { getShortcutBrowserUrl } from "@/lib/pwa/shortcutUrl";

type Props = {
  siteLabel: string;
  children: ReactNode;
  logoSrc?: string;
};

type Mode = "checking" | "launcher" | "app";

/**
 * Legacy standalone home-screen installs: show a tap-to-open screen only.
 * New installs should use browser mode (manifest + no apple-mobile-web-app-capable)
 * and open directly in Safari without this shell.
 */
export default function PwaBrowserShortcutLauncher({
  siteLabel,
  children,
  logoSrc = "/fav.png",
}: Props) {
  const [mode, setMode] = useState<Mode>("checking");
  const [browserUrl, setBrowserUrl] = useState("https://hawola.com/");

  useEffect(() => {
    const standalone = isStandalonePwa();
    setBrowserUrl(getShortcutBrowserUrl());
    setMode(standalone ? "launcher" : "app");
  }, []);

  if (mode === "checking") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0E224D]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (mode === "launcher") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0E224D] px-6 py-12 text-center text-white">
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt="" className="mb-6 h-16 w-16 rounded-2xl object-contain shadow-lg" />
        ) : null}
        <h1 className="text-xl font-semibold">{siteLabel}</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
          Tap the button below to open {siteLabel} in {isIOS() ? "Safari" : "your browser"}. Home screen
          shortcuts work best in the browser, not inside this preview window.
        </p>
        <a
          href={browserUrl}
          target="_blank"
          rel="noopener noreferrer external"
          className="mt-8 inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-xl bg-[#5BC694] px-8 text-sm font-bold text-[#0E224D] shadow-md active:scale-[0.98]"
        >
          Open in {isIOS() ? "Safari" : "browser"}
        </a>
        <p className="mt-6 max-w-xs text-xs leading-relaxed text-white/55">
          Tip: delete this home screen icon, open {siteLabel} in Safari, then use Share → Add to Home Screen
          again for a shortcut that opens in Safari automatically.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
