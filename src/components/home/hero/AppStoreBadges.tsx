"use client";

import Image from "next/image";
import React from "react";

type AppStoreBadgesProps = {
  playStoreUrl?: string | null;
  appStoreUrl?: string | null;
  className?: string;
  align?: "center" | "start";
  /** Soft strip styling under cinema hero */
  variant?: "strip" | "inline";
  tone?: "light" | "dark";
  /** stacked = copy above/beside badges; singleLine = copy + badges on one row; badgesOnly = icons only */
  layout?: "stacked" | "singleLine" | "badgesOnly";
};

function storeHref(url?: string | null): string {
  const trimmed = (url || "").trim();
  return trimmed || "#";
}

export default function AppStoreBadges({
  playStoreUrl,
  appStoreUrl,
  className = "",
  align = "center",
  variant = "strip",
  tone = "light",
  layout = "stacked",
}: AppStoreBadgesProps) {
  const playHref = storeHref(playStoreUrl);
  const appleHref = storeHref(appStoreUrl);
  const playIsPlaceholder = playHref === "#";
  const appleIsPlaceholder = appleHref === "#";

  const alignClass = align === "center" ? "justify-center text-center" : "justify-start text-left";
  const shell =
    variant === "strip"
      ? "border-y border-slate-200/80 bg-gradient-to-b from-slate-50 to-white"
      : "";
  const eyebrowClass = tone === "dark" ? "text-orange-100/80" : "text-slate-500";
  const bodyClass = tone === "dark" ? "text-slate-100" : "text-slate-700";
  const isSingleLine = layout === "singleLine";
  const isBadgesOnly = layout === "badgesOnly";

  const badges = (
    <div className={`flex shrink-0 flex-nowrap items-center gap-2 sm:gap-3 ${isSingleLine || isBadgesOnly ? "" : alignClass}`}>
      <a
        href={playHref}
        {...(playIsPlaceholder ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="inline-flex transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe9636]"
        aria-label="Get Hawola on Google Play"
      >
        <Image
          src="/images/store/google-play-badge.svg"
          alt="Get it on Google Play"
          width={155}
          height={46}
          className={`w-auto ${isSingleLine || isBadgesOnly ? "h-9 sm:h-10" : "h-11"}`}
          unoptimized
        />
      </a>
      <a
        href={appleHref}
        {...(appleIsPlaceholder ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="inline-flex transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe9636]"
        aria-label="Download Hawola on the App Store"
      >
        <Image
          src="/images/store/app-store-badge.svg"
          alt="Download on the App Store"
          width={148}
          height={46}
          className={`w-auto ${isSingleLine || isBadgesOnly ? "h-9 sm:h-10" : "h-11"}`}
          unoptimized
        />
      </a>
    </div>
  );

  if (isBadgesOnly) {
    return (
      <div className={`flex justify-center ${className}`}>
        {badges}
      </div>
    );
  }

  if (isSingleLine) {
    return (
      <div className={`${shell} ${className}`}>
        <div className="flex flex-nowrap items-center justify-between gap-3 overflow-x-auto py-2">
          <p className={`min-w-0 truncate text-sm sm:text-[15px] ${bodyClass}`}>
            <span className={`mr-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${eyebrowClass}`}>
              Shop on the go
            </span>
            Get the Hawola app for faster checkout, live deals, and order tracking.
          </p>
          {badges}
        </div>
      </div>
    );
  }

  return (
    <div className={`${shell} ${className}`}>
      <div
        className={`mx-auto flex max-w-screen-xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between ${
          variant === "strip" ? "px-6 py-5 xl:px-0" : "gap-2 py-1"
        }`}
      >
        <div className={`space-y-1 ${align === "center" ? "sm:text-left" : ""}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${eyebrowClass}`}>
            Shop on the go
          </p>
          <p className={`text-sm sm:text-[15px] ${bodyClass}`}>
            Get the Hawola app for faster checkout, live deals, and order tracking.
          </p>
        </div>
        {badges}
      </div>
    </div>
  );
}
