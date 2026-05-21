"use client";

import React, { useId, useMemo, useState } from "react";
import { ReelEmbed, resolveReelPlatform, type ReelPlatform } from "@/components/reels/ReelEmbed";
import { ReelScrollerModal } from "@/components/reels/ReelScrollerModal";

export type StorefrontReelItem = {
  id: number;
  title?: string;
  video_link: string;
  platform?: string;
  created_at?: string | null;
};

export type StorefrontReelsGalleryProps = {
  reels?: StorefrontReelItem[] | null;
  /** Root section extra classes (e.g. margin). */
  className?: string;
  heading?: string;
  /**
   * Subtitle under the heading. Omit to use the default copy; pass `""` to hide the subtitle.
   */
  description?: string;
  /** Visual weight: prominent matches product detail; subtle fits merchant tab panels. */
  tone?: "prominent" | "subtle";
};

const DEFAULT_HEADING = "See it in action";
const DEFAULT_DESCRIPTION =
  "Short videos from the seller (YouTube, Instagram, TikTok). Tap a card to open the reel viewer.";

export function StorefrontReelsGallery({
  reels,
  className = "",
  heading = DEFAULT_HEADING,
  description,
  tone = "prominent",
}: StorefrontReelsGalleryProps) {
  const subtitle = description === undefined ? DEFAULT_DESCRIPTION : description;
  const headingId = useId().replace(/:/g, "");
  const playable = useMemo(() => {
    const raw = reels?.filter((r) => (r.video_link || "").trim()) ?? [];
    return raw.filter((r) => resolveReelPlatform(r));
  }, [reels]);

  const [reelModalOpen, setReelModalOpen] = useState(false);
  const [reelModalIndex, setReelModalIndex] = useState(0);

  if (playable.length === 0) return null;

  const surface =
    tone === "subtle"
      ? "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      : "rounded-2xl bg-gradient-to-br from-violet-50/90 via-white to-fuchsia-50/70 p-5 shadow-sm";

  const countChip =
    tone === "subtle"
      ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
      : "rounded-full bg-violet-600/10 px-3 py-1 text-xs font-medium text-violet-800";

  const platformLabel = tone === "subtle" ? "text-slate-600" : "text-violet-700";

  return (
    <>
      <section
        className={`${surface} ${className}`.trim()}
        aria-labelledby={headingId}
      >
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
        <div className="flex gap-4 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
          {playable.map((reel, index) => {
            const platform = resolveReelPlatform(reel) as ReelPlatform;
            return (
              <button
                key={reel.id}
                type="button"
                onClick={() => {
                  setReelModalIndex(index);
                  setReelModalOpen(true);
                }}
                className="group flex w-[min(340px,calc(100vw-2.5rem))] max-w-[92vw] shrink-0 snap-start flex-col overflow-x-auto overflow-y-visible rounded-xl bg-white text-left shadow-md transition hover:shadow-lg"
              >
                <div className="flex h-[260px] w-full max-w-full shrink-0 items-center justify-center overflow-hidden bg-black">
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
              </button>
            );
          })}
        </div>
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
