import React from "react";

type EmptyCartCalloutProps = {
  /** From site settings; falls back to Hawola default tagline */
  slogan?: string | null;
  /** Tighter layout for the header cart dropdown */
  compact?: boolean;
};

/**
 * Branded empty-cart state with slogan (e.g. + Find it, Own it) to nudge discovery.
 */
export default function EmptyCartCallout({ slogan, compact }: EmptyCartCalloutProps) {
  const line = (slogan && String(slogan).trim()) || "Find it, Own it";

  return (
    <div
      className={
        compact
          ? "w-full max-w-sm rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/90 via-white to-secondaryTextColor/15 px-4 py-5 text-center shadow-sm"
          : "w-full max-w-md rounded-2xl border border-slate-200/90 bg-gradient-to-br from-headerBg/10 via-white to-secondaryTextColor/20 px-6 py-10 text-center shadow-md"
      }
    >
      <div className="relative mx-auto mb-4 flex w-max items-center justify-center">
        <div
          className="absolute -in-6 rounded-full bg-gradient-to-tr from-secondaryTextColor/25 to-primary/15 opacity-80 blur-2xl"
          aria-hidden
        />
        <div
          className={`relative flex items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/80 ${
            compact ? "h-14 w-14" : "h-20 w-20"
          }`}
        >
          <svg
            className={`text-headerBg/90 ${compact ? "h-7 w-7" : "h-10 w-10"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
      </div>

      <h2
        className={`font-sans font-bold text-headerBg ${compact ? "text-base" : "text-xl sm:text-2xl"}`}
      >
        Nothing in your cart yet
      </h2>
      <p
        className={`mt-2 text-slate-600 ${compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"}`}
      >
        When you spot something you want, add it here. You can keep shopping and come
        back anytime.
      </p>
      <p
        className={`mt-4 font-sans font-semibold tracking-tight text-headerBg ${compact ? "text-sm" : "text-lg"}`}
      >
        <span className="text-secondaryTextColor">+ </span>
        {line}
      </p>
    </div>
  );
}
