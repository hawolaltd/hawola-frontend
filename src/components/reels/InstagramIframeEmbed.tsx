"use client";

import React, { useMemo } from "react";
import { getInstagramEmbedIframeSrc } from "@/lib/instagramEmbedUrl";

export type InstagramIframeEmbedProps = {
  url: string;
  title?: string;
  className?: string;
  embedSize?: "compact" | "default" | "grid";
  /** When false, iframe ignores pointer events so parent scroll containers can snap between reels. */
  interactive?: boolean;
};

export function InstagramIframeEmbed({
  url,
  title,
  className = "",
  embedSize = "default",
  interactive = true,
}: InstagramIframeEmbedProps) {
  const src = useMemo(() => getInstagramEmbedIframeSrc(url), [url]);
  const width = embedSize === "compact" ? 328 : embedSize === "grid" ? 400 : 540;
  const height = embedSize === "compact" ? 460 : embedSize === "grid" ? 720 : 640;
  const compactShell =
    embedSize === "compact"
      ? "max-h-[260px] min-h-[140px]"
      : embedSize === "grid"
        ? "h-full min-h-0 max-h-none"
        : "min-h-[min(520px,72vh)]";

  if (!src) {
    const safe = (url || "").trim();
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-4 text-center text-sm text-amber-950 ${compactShell} ${className}`}
      >
        <p className="font-medium">Could not read this Instagram link for embed.</p>
        {safe ? (
          <a
            href={safe.startsWith("http") ? safe : `https://${safe}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Open link on Instagram
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`flex justify-center overflow-hidden bg-black ${compactShell} ${className}`}
    >
      <iframe
        src={src}
        title={title || "Instagram reel"}
        width={width}
        height={height}
        className={`max-w-full border-0 bg-black ${interactive ? "" : "pointer-events-none"} ${embedSize === "grid" ? "h-full min-h-full w-full object-cover" : ""}`}
        style={{
          width: "100%",
          maxWidth: embedSize === "grid" ? "100%" : width,
          minWidth: embedSize === "grid" ? undefined : 326,
        }}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
