"use client";

import React from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { AdvertBanner } from "@/types/home";
import { homeAdvertSrc } from "./HomeBodyAdvertBanners";

/** Compact navy band — never traps page scroll (no overflow-hidden). */
export function DarkProductBand({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative py-10 sm:py-12 ${className}`}
      style={{
        background:
          "radial-gradient(900px 320px at 15% 0%, rgba(254,150,54,0.16), transparent 55%), linear-gradient(165deg, #0B1B33 0%, #132A4A 55%, #0F1F38 100%)",
        color: "#f8fafc",
      }}
    >
      <div className="relative mx-auto max-w-screen-xl px-6 xl:px-0">{children}</div>
    </section>
  );
}

/** @deprecated Prefer HomeAdvertGrid / HomeBodyAdvertBanners from HomeBodyAdvertBanners.tsx */
export function HomeAdvertGrid({
  banners,
  columns = 3,
}: {
  banners: (AdvertBanner | null)[];
  columns?: 2 | 3;
}) {
  const valid = (banners || []).filter(Boolean) as AdvertBanner[];
  if (!valid.length) return null;
  const grid =
    columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3";
  const imgClass =
    columns === 2
      ? "h-36 w-full object-cover sm:h-44"
      : "h-32 w-full object-cover sm:h-40";
  return (
    <div className={`grid gap-4 ${grid}`}>
      {valid.map((banner) => {
        const src = homeAdvertSrc(banner);
        if (!src) return null;
        return (
          <div key={banner.id} className="relative overflow-hidden rounded-xl bg-slate-100 shadow-sm">
            <OptimizedImage
              src={src}
              alt="Advertisement"
              width={1200}
              height={300}
              className={imgClass}
            />
            {banner.url ? (
              <a href={banner.url} className="absolute inset-0 z-10" target="_blank" rel="noopener noreferrer" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
