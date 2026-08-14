"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const RAIL_SCROLL_CLASS =
  "-mx-1 flex touch-pan-x snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [touch-action:pan-x]";

/**
 * Horizontal product rail: arrows + native touch/trackpad swipe + optional mouse drag.
 */
export function useHorizontalRailScroll(deps: unknown[] = []) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startScroll: number;
    moved: boolean;
  }>({ active: false, startX: 0, startScroll: 0, moved: false });

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateArrows) : null;
    ro?.observe(el);
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro?.disconnect();
      window.removeEventListener("resize", updateArrows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateArrows, ...deps]);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.75, 220);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  /** Mouse / pen drag-to-scroll (touch uses native overflow scrolling). */
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!el || !drag.active) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 3) drag.moved = true;
    el.scrollLeft = drag.startScroll - dx;
  }, []);

  const endPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!el || !drag.active) return;
    drag.active = false;
    try {
      el.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  }, []);

  const railProps = {
    ref: scrollerRef,
    className: `${RAIL_SCROLL_CLASS} cursor-grab active:cursor-grabbing`,
    onPointerDown,
    onPointerMove,
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onClickCapture,
  };

  return { scrollerRef, canPrev, canNext, scrollByDir, railProps, updateArrows };
}

export function RailNavButtons({
  canPrev,
  canNext,
  onPrev,
  onNext,
  show,
}: {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <>
      <button
        type="button"
        aria-label="Previous products"
        disabled={!canPrev}
        onClick={onPrev}
        className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30 sm:-translate-x-1/3"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next products"
        disabled={!canNext}
        onClick={onNext}
        className="absolute right-0 top-1/2 z-20 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-30 sm:translate-x-1/3"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </>
  );
}

/** Touch / pointer swipe on paginated grids (left = next page, right = previous). */
export function usePageSwipe(
  page: number,
  totalPages: number,
  setPage: React.Dispatch<React.SetStateAction<number>>
) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const pointerId = useRef<number | null>(null);

  const begin = (x: number, y: number) => {
    tracking.current = true;
    startX.current = x;
    startY.current = y;
  };

  const finish = (x: number, y: number) => {
    if (!tracking.current) return;
    tracking.current = false;
    const dx = x - startX.current;
    const dy = y - startY.current;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    if (dx < 0 && page < totalPages - 1) setPage((p) => Math.min(totalPages - 1, p + 1));
    if (dx > 0 && page > 0) setPage((p) => Math.max(0, p - 1));
  };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    begin(e.touches[0].clientX, e.touches[0].clientY);
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!e.changedTouches.length) return;
      finish(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    },
    [page, totalPages, setPage]
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (e.button !== 0) return;
    pointerId.current = e.pointerId;
    begin(e.clientX, e.clientY);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (pointerId.current !== e.pointerId) return;
      pointerId.current = null;
      finish(e.clientX, e.clientY);
    },
    [page, totalPages, setPage]
  );

  const onPointerCancel = useCallback(() => {
    tracking.current = false;
    pointerId.current = null;
  }, []);

  return { onTouchStart, onTouchEnd, onPointerDown, onPointerUp, onPointerCancel };
}
