"use client";

import { useState } from "react";

/** Default register hero image with placeholder until the static asset loads. */
export default function RegisterHeroFallbackImage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full min-h-[340px] md:min-h-[480px]">
      {!loaded ? (
        <div
          className="absolute inset-0 motion-safe:animate-pulse bg-gradient-to-br from-[#eef2f8] via-[#f8fafc] to-[#eef2f8]"
          aria-hidden
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/reg_page-2.jpg"
        alt="Registration visual"
        className={`h-full w-full object-cover transition-opacity duration-300 [filter:contrast(1.16)_saturate(1.12)_brightness(1.03)] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
