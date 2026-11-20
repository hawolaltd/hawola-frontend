import { formatLiveCountdown, liveDealEndsAt, type LiveDealProduct } from "@/lib/liveDeal";
import { useEffect, useState } from "react";

export default function LiveDealCountdown({
  product,
  className = "",
}: {
  product?: LiveDealProduct | null;
  className?: string;
}) {
  const ends = liveDealEndsAt(product);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!ends) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [ends]);

  if (!ends || ends <= now) return null;
  return (
    <span className={className}>
      {formatLiveCountdown(ends - now)} left
    </span>
  );
}
