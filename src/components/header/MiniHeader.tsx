import React from "react";
import Link from "next/link";

const MERCHANT_URL = "https://merchant.hawola.com";
const MERCHANT_REGISTER_URL = "https://merchant.hawola.com/register";

const merchantBtnDesktop =
  "inline-flex items-center rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:border-white/55 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

const mobileTextLink =
  "shrink-0 text-[11px] font-semibold text-white/90 underline-offset-2 transition hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-xs";

const mobileTextLinkAccent =
  "shrink-0 text-[11px] font-semibold text-secondaryTextColor underline-offset-2 transition hover:text-[#7dd4a8] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryTextColor/50 sm:text-xs";

const requestBtnDesktop =
  "inline-flex items-center rounded-md border border-secondaryTextColor/70 bg-secondaryTextColor px-3 py-1.5 text-xs font-bold text-headerBg shadow-sm transition hover:bg-[#4db583] hover:border-[#4db583] focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryTextColor/50";

function MiniHeader() {
  return (
    <div className="border-b border-b-[#D5DFE4] bg-headerBg py-1 text-white xl:py-2">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-end gap-1.5 px-6 xl:gap-2 xl:px-0">
        {/* Mobile: merchant portal + buying request at a glance */}
        <div className="flex w-auto flex-wrap items-center justify-end gap-x-2 gap-y-0.5 xl:hidden">
          <a
            href={MERCHANT_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={mobileTextLink}
          >
            Create Store
          </a>
          <span className="text-[10px] text-white/30" aria-hidden>
            |
          </span>
          <a
            href={MERCHANT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={mobileTextLink}
          >
            Merchant Dashboard
          </a>
          <span className="text-[10px] text-white/30" aria-hidden>
            |
          </span>
          <Link href="/looking-for-product" className={mobileTextLinkAccent}>
            Request for a product
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-2 xl:flex">
          <a
            href={MERCHANT_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={merchantBtnDesktop}
          >
            Create Store
          </a>
          <a
            href={MERCHANT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={merchantBtnDesktop}
          >
            Merchant Account
          </a>
          <Link href="/looking-for-product" className={requestBtnDesktop}>
            Request for a product
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MiniHeader;
