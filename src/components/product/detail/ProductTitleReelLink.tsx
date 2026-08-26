"use client";

import { useMemo, useState } from "react";
import type { ProductReel } from "@/types/product";
import { resolveReelPlatform } from "@/components/reels/ReelEmbed";
import { ReelScrollerModal } from "@/components/reels/ReelScrollerModal";

type Props = {
  reels?: ProductReel[] | null;
  className?: string;
};

export default function ProductTitleReelLink({ reels, className = "" }: Props) {
  const [open, setOpen] = useState(false);

  const playable = useMemo(() => {
    if (!Array.isArray(reels) || reels.length === 0) return [];
    return reels.filter(
      (r) => (r.video_link || "").trim().length > 0 && resolveReelPlatform(r)
    );
  }, [reels]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-1.5 inline-flex items-center text-left text-sm font-semibold text-primary underline-offset-2 transition-colors hover:underline ${className}`}
      >
        View this product reel
      </button>
      <ReelScrollerModal
        reels={playable}
        initialIndex={0}
        open={open}
        onClose={() => setOpen(false)}
        emptyMessage="Reel not available for this product."
      />
    </>
  );
}
