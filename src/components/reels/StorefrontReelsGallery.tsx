"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { ReelEmbed, resolveReelPlatform, type ReelPlatform } from "@/components/reels/ReelEmbed";
import { ReelGridCard } from "@/components/reels/ReelGridCard";
import { ReelScrollerModal } from "@/components/reels/ReelScrollerModal";
import MerchantAboutSocialSidebar from "@/components/merchantTemplate/MerchantAboutSocialSidebar";
import {
  hasMerchantSocialSidebarContent,
  type MerchantSocialDetails,
} from "@/components/merchantTemplate/merchantSocialLinkData";

export type StorefrontReelItem = {
  id: number;
  title?: string;
  video_link: string;
  platform?: string;
  created_at?: string | null;
};

export type StorefrontReelsGalleryProps = {
  reels?: StorefrontReelItem[] | null;
  className?: string;
  heading?: string;
  description?: string;
  tone?: "prominent" | "subtle";
  /** Carousel for product/overview snippets; page = Instagram-style grid with progressive load. */
  layout?: "carousel" | "page";
  merchantDetails?: MerchantSocialDetails | null;
  pageBatchSize?: number;
};

const DEFAULT_HEADING = "See it in action";
const DEFAULT_DESCRIPTION =
  "Short videos from the seller (YouTube, Instagram, TikTok). Tap a card to open the reel viewer.";
const PAGE_BATCH_SIZE = 6;

export function StorefrontReelsGallery({
  reels,
  className = "",
  heading = DEFAULT_HEADING,
  description,
  tone = "prominent",
  layout = "carousel",
  merchantDetails,
  pageBatchSize = PAGE_BATCH_SIZE,
}: StorefrontReelsGalleryProps) {
  const subtitle = description === undefined ? DEFAULT_DESCRIPTION : description;
  const headingId = useId().replace(/:/g, "");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const playable = useMemo(() => {
    const raw = reels?.filter((r) => (r.video_link || "").trim()) ?? [];
    return raw.filter((r) => resolveReelPlatform(r));
  }, [reels]);

  const [reelModalOpen, setReelModalOpen] = useState(false);
  const [reelModalIndex, setReelModalIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(pageBatchSize);

  useEffect(() => {
    setVisibleCount(pageBatchSize);
  }, [playable.length, pageBatchSize]);

  useEffect(() => {
    if (layout !== "page") return;
    const sentinel = loadMoreRef.current;
    if (!sentinel || visibleCount >= playable.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + pageBatchSize, playable.length));
        }
      },
      { rootMargin: "320px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [layout, visibleCount, playable.length, pageBatchSize]);

  if (playable.length === 0) return null;

  const surface =
    tone === "subtle"
      ? layout === "page"
        ? ""
        : "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      : "rounded-2xl bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/70 p-5 shadow-sm";

  const countChip =
    tone === "subtle"
      ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
      : "rounded-full bg-violet-600/10 px-3 py-1 text-xs font-medium text-violet-800";

  const platformLabel = tone === "subtle" ? "text-slate-600" : "text-violet-700";
  const showSocialSidebar = layout === "page" && hasMerchantSocialSidebarContent(merchantDetails);
  const pageReels = playable.slice(0, visibleCount);
  const hasMore = visibleCount < playable.length;

  const openReelAt = (index: number) => {
    setReelModalIndex(index);
    setReelModalOpen(true);
  };

  const header = (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={headingId} className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {heading}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>
      <span className={countChip}>
        {playable.length} reel{playable.length === 1 ? "" : "s"}
      </span>
    </div>
  );

  const pageGrid = (
    <>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2 lg:gap-2.5">
        {pageReels.map((reel, index) => {
          const platform = resolveReelPlatform(reel) as ReelPlatform;
          return (
            <ReelGridCard
              key={reel.id}
              platform={platform}
              url={reel.video_link}
              title={reel.title}
              onOpen={() => openReelAt(index)}
            />
          );
        })}
      </div>

      {hasMore ? (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-10 text-sm text-slate-500"
          aria-live="polite"
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            Loading more reels…
          </span>
        </div>
      ) : playable.length > pageBatchSize ? (
        <p className="py-6 text-center text-xs text-slate-400">All reels loaded</p>
      ) : null}
    </>
  );

  const carousel = (
    <div className="flex gap-4 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
      {playable.map((reel, index) => {
        const platform = resolveReelPlatform(reel) as ReelPlatform;
        const openReel = () => openReelAt(index);
        return (
          <div
            key={reel.id}
            role="button"
            tabIndex={0}
            onClick={openReel}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openReel();
              }
            }}
            className="group flex w-[min(340px,calc(100vw-2.5rem))] max-w-[92vw] shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-xl bg-white text-left shadow-md transition hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <div className="relative flex h-[260px] w-full max-w-full shrink-0 items-center justify-center overflow-hidden bg-black">
              <ReelEmbed
                platform={platform}
                url={reel.video_link}
                title={reel.title || `Reel #${reel.id}`}
                embedSize="compact"
                className="pointer-events-none h-full max-h-full w-full opacity-95 group-hover:opacity-100"
              />
            </div>
            <div className="space-y-0.5 p-2.5">
              <p className={`text-[10px] font-bold uppercase tracking-wide ${platformLabel}`}>
                {platform}
              </p>
              <p className="line-clamp-2 text-xs font-medium text-slate-900">
                {reel.title || "Watch reel"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <section
        className={`${surface} ${className}`.trim()}
        aria-labelledby={headingId}
      >
        {layout === "page" ? (
          showSocialSidebar ? (
            <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                {header}
                {pageGrid}
              </div>
              <div className="min-w-0 lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <MerchantAboutSocialSidebar details={merchantDetails} sticky={false} />
                </div>
              </div>
            </div>
          ) : (
            <>
              {header}
              {pageGrid}
            </>
          )
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id={headingId} className="text-lg font-semibold text-slate-900">
                  {heading}
                </h2>
                {subtitle ? (
                  <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
                ) : null}
              </div>
              <span className={countChip}>
                {playable.length} reel{playable.length === 1 ? "" : "s"}
              </span>
            </div>
            {carousel}
          </>
        )}
      </section>

      <ReelScrollerModal
        reels={playable}
        initialIndex={reelModalIndex}
        open={reelModalOpen}
        onClose={() => setReelModalOpen(false)}
      />
    </>
  );
}
