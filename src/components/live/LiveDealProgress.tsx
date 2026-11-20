import {
  liveDealEndsAt,
  liveDealHeatColor,
  liveDealStartedAt,
  type LiveDealProduct,
} from "@/lib/liveDeal";
import { useEffect, useRef, useState } from "react";

export default function LiveDealProgress({
  product,
  className = "",
}: {
  product?: LiveDealProduct | null;
  className?: string;
}) {
  const ends = liveDealEndsAt(product);
  const started = liveDealStartedAt(product, ends);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [color, setColor] = useState("#22c55e");

  useEffect(() => {
    const el = barRef.current;
    if (!el || !ends || !started) return;
    const total = Math.max(ends - started, 1);
    const remaining = Math.max(0, ends - Date.now());
    const pct = Math.min(1, remaining / total);
    setColor(liveDealHeatColor(pct));
    el.style.transition = "none";
    el.style.transform = `scaleX(${pct})`;
    void el.offsetWidth;
    el.style.transition = `transform ${remaining}ms linear, background-color 0.35s linear`;
    el.style.transform = "scaleX(0)";

    const tick = () => {
      const left = Math.max(0, ends - Date.now());
      setColor(liveDealHeatColor(left / total));
    };
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [ends, started, product?.deal_price]);

  if (!ends || ends <= Date.now()) return null;

  return (
    <div className={`h-[3px] w-full overflow-hidden bg-[var(--lv-track,rgba(255,255,255,0.1))] ${className}`} aria-hidden>
      <div
        ref={barRef}
        className="h-full w-full origin-left"
        style={{
          transform: "scaleX(1)",
          backgroundColor: color,
        }}
      />
    </div>
  );
}
