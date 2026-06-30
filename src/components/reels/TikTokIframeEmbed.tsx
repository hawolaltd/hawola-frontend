"use client";

import { useEffect, useMemo, useState } from "react";
import {
  extractTikTokVideoId,
  isTikTokCanonicalUrl,
  isTikTokUrl,
  normalizeTikTokCiteUrl,
  resolveTikTokEmbedUrl,
} from "@/lib/tiktokEmbedUrl";

type Props = {
  url: string;
  title?: string;
  className?: string;
  embedSize?: "compact" | "default" | "grid";
  interactive?: boolean;
};

function TikTokPreviewFallback({ url, title }: { url: string; title?: string }) {
  const href = url.startsWith("http") ? url : `https://${url}`;
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
      <p className="text-sm font-medium text-gray-800">TikTok preview could not be loaded</p>
      <p className="text-xs leading-relaxed text-gray-500">
        Short and full TikTok links are supported. You can still open the video on TikTok.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-brand-600 hover:underline"
      >
        {title ? `Open “${title}” on TikTok` : "Open on TikTok"}
      </a>
    </div>
  );
}

export function TikTokIframeEmbed({
  url,
  title,
  className = "",
  embedSize = "default",
  interactive = true,
}: Props) {
  const trimmed = (url || "").trim();
  const [embedUrl, setEmbedUrl] = useState<string | null>(() =>
    isTikTokCanonicalUrl(trimmed) ? normalizeTikTokCiteUrl(trimmed) : null,
  );
  const [resolving, setResolving] = useState(
    Boolean(trimmed) && isTikTokUrl(trimmed) && !isTikTokCanonicalUrl(trimmed),
  );
  const [resolveFailed, setResolveFailed] = useState(false);

  useEffect(() => {
    if (!trimmed) {
      setEmbedUrl(null);
      setResolving(false);
      setResolveFailed(false);
      return;
    }

    if (isTikTokCanonicalUrl(trimmed)) {
      setEmbedUrl(normalizeTikTokCiteUrl(trimmed));
      setResolving(false);
      setResolveFailed(false);
      return;
    }

    if (!isTikTokUrl(trimmed)) {
      setEmbedUrl(null);
      setResolving(false);
      setResolveFailed(true);
      return;
    }

    let cancelled = false;
    setResolving(true);
    setResolveFailed(false);
    setEmbedUrl(null);

    resolveTikTokEmbedUrl(trimmed).then((resolved) => {
      if (cancelled) return;
      if (resolved && isTikTokCanonicalUrl(resolved)) {
        setEmbedUrl(normalizeTikTokCiteUrl(resolved));
        setResolveFailed(false);
      } else {
        setEmbedUrl(null);
        setResolveFailed(true);
      }
      setResolving(false);
    });

    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  const videoId = useMemo(() => (embedUrl ? extractTikTokVideoId(embedUrl) : null), [embedUrl]);
  const iframeSrc = videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : null;
  const width = embedSize === "compact" ? 328 : embedSize === "grid" ? 405 : 405;
  const height = embedSize === "compact" ? 460 : embedSize === "grid" ? 720 : 720;
  const compactShell =
    embedSize === "compact"
      ? "max-h-[260px] min-h-[140px]"
      : embedSize === "grid"
        ? "h-full min-h-0 max-h-none"
        : "min-h-[min(520px,72vh)]";

  if (!trimmed) {
    return null;
  }

  if (resolving) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        Resolving TikTok link…
      </div>
    );
  }

  if (resolveFailed || !iframeSrc) {
    return <TikTokPreviewFallback url={trimmed} title={title} />;
  }

  return (
    <div className={`flex justify-center overflow-hidden bg-black ${compactShell} ${className}`}>
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={title || "TikTok video"}
        width={width}
        height={height}
        className={`max-w-full border-0 bg-black ${interactive ? "" : "pointer-events-none"} ${embedSize === "grid" ? "h-full min-h-full w-full" : ""}`}
        style={{
          width: "100%",
          maxWidth: embedSize === "grid" ? "100%" : width,
          minWidth: embedSize === "grid" ? undefined : 325,
        }}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
