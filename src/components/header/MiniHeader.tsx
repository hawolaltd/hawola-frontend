import React from "react";
import Link from "next/link";

function MiniHeader() {
  return (
    <div className="hidden border-b border-b-[#D5DFE4] bg-headerBg py-2 text-white xl:block">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-end gap-8 px-6 xl:px-0">
        <Link
          href="https://merchant.hawola.com"
          target="_blank"
          rel="noopener noreferrer"
          className="border-r border-white/30 pr-8 text-xs font-medium text-white"
        >
          Create your own store
        </Link>
        <Link
          href="/looking-for-product"
          className="text-xs font-semibold text-secondaryTextColor"
        >
          I am looking for this product
        </Link>
      </div>
    </div>
  );
}

export default MiniHeader;
