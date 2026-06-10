"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isStandalonePwa } from "@/lib/pwa/device";

type Props = {
  siteLabel: string;
  children: ReactNode;
  /** Optional logo for the launcher screen */
  logoSrc?: string;
};

/**
 * Home-screen PWA shell: opens the real site in Safari/Chrome instead of running inside standalone mode.
 */
export default function PwaBrowserShortcutLauncher({
  siteLabel,
  children,
  logoSrc = "/fav.png",
}: Props) {
  const [launcher, setLauncher] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("/");

  useEffect(() => {
    if (!isStandalonePwa()) return;

    const url = window.location.href;
    setBrowserUrl(url);
    setLauncher(true);

    // Best-effort auto-open (may require a tap on iOS if blocked without user gesture).
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  if (!launcher) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0E224D] px-6 py-12 text-center text-white">
      {logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoSrc} alt="" className="mb-6 h-16 w-16 rounded-2xl object-contain shadow-lg" />
      ) : null}
      <h1 className="text-xl font-semibold">{siteLabel}</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
        This home screen shortcut opens the full {siteLabel} site in Safari or Chrome — shopping,
        checkout, and account features work best there.
      </p>
      <a
        href={browserUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#5BC694] px-8 text-sm font-bold text-[#0E224D] shadow-md"
      >
        Open in browser
      </a>
      <p className="mt-4 text-xs text-white/60">If nothing opened automatically, tap the button above.</p>
    </div>
  );
}
