import React from "react";
import Link from "next/link";

const MERCHANT_URL = "https://merchant.hawola.com";

const merchantBtnClass =
  "inline-flex items-center rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:border-white/55 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

const requestBtnClass =
  "inline-flex items-center rounded-md border border-secondaryTextColor/70 bg-secondaryTextColor px-3 py-1.5 text-xs font-bold text-headerBg shadow-sm transition hover:bg-[#4db583] hover:border-[#4db583] focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryTextColor/50";

function MiniHeader() {
  return (
    <div className="hidden border-b border-b-[#D5DFE4] bg-headerBg py-2 text-white xl:block">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-end gap-2 px-6 xl:px-0">
        <a
          href={MERCHANT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={merchantBtnClass}
        >
          Create Store
        </a>
        <a
          href={MERCHANT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={merchantBtnClass}
        >
          Merchant Account
        </a>
        <Link href="/looking-for-product" className={requestBtnClass}>
          Request for a product
        </Link>
      </div>
    </div>
  );
}

export default MiniHeader;
