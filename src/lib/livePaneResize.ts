"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Opts = {
  storageKey: string;
  min?: number;
  max?: number;
  initial?: number;
  reserved?: number;
};

export function useLiveChatSplit({
  storageKey,
  min = 280,
  max = 720,
  initial = 400,
  reserved = 560,
}: Opts) {
  const [width, setWidth] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLElement | null>(null);
  const start = useRef({ x: 0, w: initial });

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(storageKey));
      if (Number.isFinite(saved) && saved >= min && saved <= max) setWidth(saved);
    } catch {
      /* ignore */
    }
  }, [storageKey, min, max]);

  const clamp = useCallback(
    (next: number) => {
      const stage = stageRef.current?.getBoundingClientRect().width ?? 1200;
      const room = Math.max(min, stage - reserved);
      return Math.round(Math.min(max, Math.min(room, Math.max(min, next))));
    },
    [min, max, reserved]
  );

  useEffect(() => {
    if (dragging) return;
    try {
      window.localStorage.setItem(storageKey, String(width));
    } catch {
      /* ignore */
    }
  }, [dragging, storageKey, width]);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    start.current = { x: event.clientX, w: width };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const dx = start.current.x - event.clientX;
    setWidth(clamp(start.current.w + dx));
  };

  const onPointerUp = () => setDragging(false);

  return {
    width,
    dragging,
    stageRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
