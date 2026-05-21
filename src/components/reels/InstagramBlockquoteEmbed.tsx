"use client";

import React, { useEffect, useMemo } from "react";
import { ensureInstagramEmbedJs, processInstagramEmbeds } from "@/components/reels/instagramEmbedScript";
import { normalizeInstagramPermalinkForEmbed } from "@/lib/instagramEmbedUrl";

export type InstagramBlockquoteEmbedProps = {
  url: string;
  title?: string;
  className?: string;
  embedSize?: "compact" | "default";
};

export function InstagramBlockquoteEmbed({
  url,
  title,
  className = "",
  embedSize = "default",
}: InstagramBlockquoteEmbedProps) {
  const permalink = useMemo(() => normalizeInstagramPermalinkForEmbed(url), [url]);
  const embedUrl = permalink
    ? `${permalink}?utm_source=ig_embed&utm_campaign=loading`
    : null;

  useEffect(() => {
    if (!permalink) return;
    let cancelled = false;
    let timeoutId: number | undefined;
    void (async () => {
      try {
        await ensureInstagramEmbedJs();
        if (cancelled) return;
        processInstagramEmbeds();
        requestAnimationFrame(() => {
          if (!cancelled) processInstagramEmbeds();
        });
        timeoutId = window.setTimeout(() => {
          if (!cancelled) processInstagramEmbeds();
        }, 400);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [permalink]);

  const maxW = embedSize === "compact" ? 328 : 540;
  const compactShell = embedSize === "compact" ? "max-h-[260px] min-h-[140px] overflow-hidden" : "min-h-[min(520px,72vh)]";

  if (!permalink || !embedUrl) {
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
      className={`instagram-embed-host flex justify-center overflow-x-auto overflow-y-hidden ${compactShell} ${className}`}
    >
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={embedUrl}
        data-instgrm-version="14"
        style={{
          background: "transparent",
          margin: 0,
          maxWidth: maxW,
          minWidth: 326,
          width: "100%",
        }}
      >
        <a href={embedUrl} target="_blank" rel="noopener noreferrer">
          {title || "View this post on Instagram"}
        </a>
      </blockquote>
    </div>
  );
}
