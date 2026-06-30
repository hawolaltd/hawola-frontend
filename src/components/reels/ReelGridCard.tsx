"use client";

import { useEffect, useRef, useState } from "react";
import { ReelEmbed, type ReelPlatform } from "@/components/reels/ReelEmbed";

type ReelGridCardProps = {
  platform: ReelPlatform;
  url: string;
  title?: string;
  onOpen: () => void;
};

const PLATFORM_GRADIENT: Record<ReelPlatform, string> = {
  instagram: "from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]",
  tiktok: "from-slate-900 via-slate-800 to-slate-950",
  youtube: "from-red-700 via-red-600 to-red-800",
};

function useLazyInView(rootMargin = "240px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return { ref, visible };
}

export function ReelGridCard({ platform, url, title, onOpen }: ReelGridCardProps) {
  const { ref, visible } = useLazyInView();

  return (
    <article
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-md bg-black ring-1 ring-black/5 transition hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:rounded-lg"
      aria-label={title ? `Open reel: ${title}` : "Open reel"}
    >
      {visible ? (
        <ReelEmbed
          platform={platform}
          url={url}
          title={title}
          embedSize="grid"
          interactive={false}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-95 transition group-hover:opacity-100"
        />
      ) : (
        <div
          className={`absolute inset-0 animate-pulse bg-gradient-to-br ${PLATFORM_GRADIENT[platform]}`}
          aria-hidden
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />

      <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
        {platform}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
          <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      {title ? (
        <p className="pointer-events-none absolute bottom-0 left-0 right-0 line-clamp-2 px-2.5 pb-2.5 text-xs font-medium text-white">
          {title}
        </p>
      ) : null}
    </article>
  );
}
