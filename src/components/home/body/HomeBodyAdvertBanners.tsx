"use client";

import React from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import FeaturesSection from "@/components/home/FeaturesSection";
import type { AdvertBanner } from "@/types/home";

/** Match classic home advert image field fallbacks. */
export function homeAdvertSrc(a: AdvertBanner): string {
  return (
    (a.web_image ||
      a.image ||
      a.web_banner_image ||
      a.banner_image ||
      "") as string
  );
}

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
          <div
            key={banner.id}
            className="relative overflow-hidden rounded-xl bg-slate-100 shadow-sm"
          >
            <OptimizedImage
              src={src}
              alt="Advertisement"
              width={1200}
              height={300}
              className={imgClass}
            />
            {banner.url ? (
              <a
                href={banner.url}
                className="absolute inset-0 z-10"
                target="_blank"
                rel="noopener noreferrer"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Classic middle (3) + bottom (2) home advert bands — shared by all body themes.
 */
export function HomeBodyAdvertBanners({
  middle,
  bottom,
}: {
  middle: (AdvertBanner | null)[];
  bottom: (AdvertBanner | null)[];
}) {
  const hasMiddle = (middle || []).some(Boolean);
  const hasBottom = (bottom || []).some(Boolean);
  if (!hasMiddle && !hasBottom) return null;

  return (
    <section className="mx-auto flex w-full max-w-screen-xl flex-col gap-4 px-6 py-4 xl:px-0">
      {hasMiddle ? (
        <div className="flex w-full justify-center py-4">
          <div className="w-full">
            <HomeAdvertGrid banners={middle} columns={3} />
          </div>
        </div>
      ) : null}
      {hasBottom ? (
        <div className="flex w-full justify-center py-4">
          <div className="w-full">
            <HomeAdvertGrid banners={bottom} columns={2} />
          </div>
        </div>
      ) : null}
      <FeaturesSection />
    </section>
  );
}
