"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const playable = useMemo(
    () => reels.filter((r) => resolveReelPlatform(r)),
    [reels],
  );

  const clampedIndex = Math.max(0, Math.min(initialIndex, Math.max(0, playable.length - 1)));

  useEffect(() => {
    if (!open) return;
    setActiveIndex(clampedIndex);
  }, [open, clampedIndex]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const scrollSlideIntoView = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const el = itemRefs.current[index];
    el?.scrollIntoView({ behavior, block: "start" });
  }, []);

  useEffect(() => {
    if (!open || playable.length === 0) return;
    const id = window.setTimeout(() => scrollSlideIntoView(clampedIndex, "auto"), 80);
    return () => clearTimeout(id);
  }, [open, clampedIndex, playable.length, scrollSlideIntoView]);

  useEffect(() => {
    if (!open || playable.length === 0) return;
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const idx = Number(best.target.getAttribute("data-reel-index"));
        if (!Number.isNaN(idx)) setActiveIndex(idx);
      },
      { root, threshold: [0.55, 0.75, 0.9] },
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [open, playable.length]);

  const goToReel = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, playable.length - 1));
      scrollSlideIntoView(next);
      setActiveIndex(next);
    },
    [playable.length, scrollSlideIntoView],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goToReel(activeIndex + 1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToReel(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, activeIndex, goToReel]);

  if (!open || playable.length === 0) return null;

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < playable.length - 1;

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reel-scroller-title"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p id="reel-scroller-title" className="text-sm font-medium text-white">
            Reels ({activeIndex + 1} / {playable.length})
          </p>
          {playable.length > 1 ? (
            <p className="mt-0.5 text-xs text-white/55">Scroll, swipe, or use arrows for the next reel</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
          aria-label="Close reel viewer"
        >
          Close
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        {hasPrev ? (
          <button
            type="button"
            onClick={() => goToReel(activeIndex - 1)}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-2 text-white/90 backdrop-blur-sm transition hover:bg-black/70 sm:flex"
            aria-label="Previous reel"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        ) : null}

        {hasNext ? (
          <button
            type="button"
            onClick={() => goToReel(activeIndex + 1)}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-2 text-white/90 backdrop-blur-sm transition hover:bg-black/70 sm:flex"
            aria-label="Next reel"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : null}

        <div
          ref={scrollRef}
          className="h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        >
          {playable.map((reel, index) => {
            const inferred = resolveReelPlatform(reel)!;
            return (
              <div
                key={reel.id}
                data-reel-index={index}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="flex h-[calc(100dvh-52px)] shrink-0 snap-start snap-always flex-col items-center justify-center gap-3 px-3 py-6"
              >
                <div className="flex w-full max-w-md min-h-0 flex-1 flex-col justify-center">
                  <p className="mb-2 shrink-0 truncate text-center text-sm text-white/80">
                    {reel.title || `Reel #${reel.id}`}{" "}
                    <span className="uppercase opacity-70"> · {inferred}</span>
                  </p>
                  <div className="mx-auto w-full min-h-0 max-h-[min(640px,calc(100dvh-180px))] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                    <ReelEmbed
                      platform={inferred}
                      url={reel.video_link}
                      title={reel.title || `Reel ${reel.id}`}
                      embedSize="default"
                      interactive={false}
                      className="h-full max-h-full w-full"
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-3 shrink-0 w-full text-center text-xs text-sky-300 underline decoration-sky-400/60 hover:text-sky-200"
                    onClick={() => window.open(reel.video_link, "_blank", "noopener,noreferrer")}
                  >
                    Open on {inferred}
                  </button>
                  {index < playable.length - 1 ? (
                    <p className="mt-4 shrink-0 text-center text-[11px] uppercase tracking-[0.14em] text-white/40">
                      Scroll down for next reel
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
