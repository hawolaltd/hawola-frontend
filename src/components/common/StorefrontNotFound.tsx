import React from "react";
import Link from "next/link";

export type StorefrontNotFoundProps = {
  /** Small uppercase label above the big 404 */
  kicker?: string;
  headline: string;
  description: string;
  /** Optional monospace path line (e.g. `/product/foo` or `/some/path`) */
  pathHint?: string | null;
};

/**
 * Shared storefront 404 visual — same layout as product detail “not found”.
 */
function StorefrontNotFound({
  kicker = "Page not found",
  headline,
  description,
  pathHint,
}: StorefrontNotFoundProps) {
  return (
    <div className="relative min-h-[62vh] overflow-hidden px-4 py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgb(249 115 22), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgb(59 130 246), transparent), radial-gradient(ellipse 50% 30% at 0% 80%, rgb(168 85 247), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-textPadded">
          {kicker}
        </p>
        <div className="mt-6 flex flex-wrap items-end justify-center gap-2 md:gap-4">
          <span
            className="text-[clamp(4.5rem,18vw,9rem)] font-black leading-none text-[#dde4f0] select-none"
            style={{ textShadow: "0.08em 0.08em 0 rgb(249 115 22 / 0.25)" }}
            aria-hidden
          >
            404
          </span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-primary md:text-3xl">
          {headline}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-textPadded">
          {description}
        </p>
        {pathHint ? (
          <p className="mt-3 font-mono text-xs text-gray-400 break-all">
            {pathHint}
          </p>
        ) : null}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            Back home
          </Link>
          <Link
            href="/search"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-primary bg-white px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Search products
          </Link>
        </div>

        <div
          className="mx-auto mt-16 h-1 max-w-xs rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
}

export default StorefrontNotFound;
