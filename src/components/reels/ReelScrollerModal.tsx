"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { ReelEmbed, resolveReelPlatform } from "@/components/reels/ReelEmbed";

export type ScrollerReelItem = {
  id: number;
  title?: string;
  video_link: string;
  platform?: string;
};

interface ReelScrollerModalProps {
  reels: ScrollerReelItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export function ReelScrollerModal({ reels, initialIndex, open, onClose }: ReelScrollerModalProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const playable = useMemo(
    () => reels.filter((r) => resolveReelPlatform(r)),
    [reels],
  );

  const clampedIndex = Math.max(0, Math.min(initialIndex, Math.max(0, playable.length - 1)));

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const scrollSlideIntoView = useCallback((index: number) => {
    const el = itemRefs.current[index];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!open || playable.length === 0) return;
    const id = window.setTimeout(() => scrollSlideIntoView(clampedIndex), 80);
    return () => clearTimeout(id);
  }, [open, clampedIndex, playable.length, scrollSlideIntoView]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || playable.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reel-scroller-title"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <p id="reel-scroller-title" className="text-sm font-medium text-white">
          Reels ({clampedIndex + 1} / {playable.length})
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
          aria-label="Close reel viewer"
        >
          Close
        </button>
      </header>

      <div className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {playable.map((reel, index) => {
          const inferred = resolveReelPlatform(reel)!;
          return (
            <div
              key={reel.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="flex min-h-[calc(100dvh-52px)] snap-start flex-col items-center justify-center gap-4 px-3 py-8"
            >
              <div className="w-full max-w-md">
                <p className="mb-2 truncate text-center text-sm text-white/80">
                  {reel.title || `Reel #${reel.id}`}{" "}
                  <span className="uppercase opacity-70"> · {inferred}</span>
                </p>
                <div className="mx-auto rounded-2xl border border-white/10 bg-black shadow-2xl">
                  <ReelEmbed
                    platform={inferred}
                    url={reel.video_link}
                    title={reel.title || `Reel ${reel.id}`}
                    embedSize="default"
                    className="max-h-[min(640px,calc(100dvh-140px))] min-h-[360px]"
                  />
                </div>
                <button
                  type="button"
                  className="mt-3 w-full text-center text-xs text-sky-300 underline decoration-sky-400/60 hover:text-sky-200"
                  onClick={() => window.open(reel.video_link, "_blank", "noopener,noreferrer")}
                >
                  Open on {inferred}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
