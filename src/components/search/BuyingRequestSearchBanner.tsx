import React from "react";
import Link from "next/link";
import { MegaphoneIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

type Props = {
  variant?: "default" | "noResults";
  query?: string;
  className?: string;
};

export default function BuyingRequestSearchBanner({
  variant = "default",
  query = "",
  className = "",
}: Props) {
  const isNoResults = variant === "noResults" && query.trim().length > 0;
  const headline = isNoResults
    ? `Can't find “${query.trim()}”?`
    : "Can't find what you're looking for?";
  const subcopy = isNoResults
    ? "Post a buying request and let verified merchants on Hawola respond with quotes."
    : "Request a product — merchants can respond even when it is not listed yet.";

  return (
    <Link
      href="/looking-for-product"
      className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#1e3578] to-[#172554] p-5 shadow-lg shadow-[#1E3A8A]/25 ring-2 ring-[#5BC694]/40 transition hover:shadow-xl hover:ring-[#5BC694]/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5BC694]/50 sm:p-6 ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-[#5BC694]/10"
        aria-hidden
      />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-md sm:h-14 sm:w-14">
          <MegaphoneIcon className="h-6 w-6 text-[#1E3A8A] sm:h-7 sm:w-7" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/70 sm:text-[11px]">
            Product buying request
          </p>
          <h2 className="mt-1 text-base font-extrabold leading-snug text-white sm:text-lg">
            {headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{subcopy}</p>

          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#172554] shadow-sm transition group-hover:bg-[#5BC694] group-hover:text-white">
            Request a product
            <ChevronRightIcon className="h-4 w-4 shrink-0" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
