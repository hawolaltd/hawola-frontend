"use client";

import { useEffect, useMemo, useRef } from "react";
import { mountTikTokEmbed } from "@/components/reels/tiktokEmbedScript";
import { extractTikTokVideoId, isTikTokCanonicalUrl, normalizeTikTokCiteUrl } from "@/lib/tiktokEmbedUrl";

type Props = {
  url: string;
  title?: string;
  className?: string;
  width?: number;
};

export function TikTokBlockquoteEmbed({ url, title, className = "", width = 328 }: Props) {
  const citeUrl = useMemo(() => normalizeTikTokCiteUrl(url), [url]);
  const videoId = useMemo(() => extractTikTokVideoId(citeUrl), [citeUrl]);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!citeUrl || !isTikTokCanonicalUrl(citeUrl)) return;
    let cancelled = false;
    void mountTikTokEmbed(hostRef.current).then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [citeUrl, videoId]);

  if (!citeUrl || !isTikTokCanonicalUrl(citeUrl)) {
    return null;
  }

  return (
    <div ref={hostRef} className={`flex justify-center overflow-hidden ${className}`}>
      <blockquote
        key={citeUrl}
        className="tiktok-embed"
        cite={citeUrl}
        data-video-id={videoId || undefined}
        style={{
          maxWidth: Math.max(width, 325),
          minWidth: 325,
          width: "100%",
        }}
      >
        <section>
          <a href={citeUrl} target="_blank" rel="noopener noreferrer">
            {title || "View on TikTok"}
          </a>
        </section>
      </blockquote>
    </div>
  );
}
