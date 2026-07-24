import React from "react";
import { ArrowTopRightOnSquareIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

export const HAWOLA_APP_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.hawola.app";
export const HAWOLA_APP_ICON_SRC = "/hawola-app-icon.png";

type HawolaAppDownloadLinkProps = {
  variant?: "mini" | "drawer";
  showLabel?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
};

export default function HawolaAppDownloadLink({
  variant = "mini",
  showLabel = false,
  compact = false,
  onNavigate,
}: HawolaAppDownloadLinkProps) {
  if (variant === "drawer") {
    return (
      <a
        href={HAWOLA_APP_PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className="group flex w-full items-center gap-4 rounded-2xl border border-headerBg/10 bg-gradient-to-br from-headerBg via-primary to-[#1e4a8c] p-4 shadow-lg ring-1 ring-black/5 transition hover:brightness-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Download Hawola app on Google Play"
      >
        <span className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[1.15rem] border-2 border-white/20 bg-[#1E3A8A] shadow-md ring-2 ring-white/10">
          <img
            src={HAWOLA_APP_ICON_SRC}
            alt=""
            width={72}
            height={72}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="min-w-0 flex-1 text-left text-white">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
            <DevicePhoneMobileIcon className="h-3.5 w-3.5" aria-hidden />
            Android app
          </span>
          <span className="mt-1 block text-lg font-bold leading-snug">Download Hawola</span>
          <span className="mt-1 block text-xs leading-relaxed text-white/80">
            Shop, chat with merchants, and track orders on Google Play.
          </span>
        </span>
        <ArrowTopRightOnSquareIcon
          className="h-5 w-5 shrink-0 text-white/70 transition group-hover:text-white"
          aria-hidden
        />
      </a>
    );
  }

  return (
    <a
      href={HAWOLA_APP_PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className="group inline-flex shrink-0 items-center gap-1 rounded-lg transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      aria-label="Download Hawola app on Google Play"
      title="Download Hawola app on Google Play"
    >
      <span
        className={`relative overflow-hidden rounded-[7px] border border-white/20 bg-[#1E3A8A] shadow-md ring-1 ring-black/10 ${
          compact ? "h-6 w-6" : "h-8 w-8 sm:h-9 sm:w-9"
        }`}
      >
        <img
          src={HAWOLA_APP_ICON_SRC}
          alt=""
          width={compact ? 24 : 36}
          height={compact ? 24 : 36}
          className="h-full w-full object-cover"
        />
      </span>
      {showLabel && compact ? (
        <span className="whitespace-nowrap text-[9px] font-bold leading-none text-white group-hover:underline group-hover:underline-offset-2">
          Download App
        </span>
      ) : showLabel ? (
        <span className="flex min-w-0 flex-col text-left leading-tight">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-white/55">
            Android app
          </span>
          <span className="text-[11px] font-bold text-white group-hover:underline group-hover:underline-offset-2">
            Download Hawola
          </span>
        </span>
      ) : null}
    </a>
  );
}
