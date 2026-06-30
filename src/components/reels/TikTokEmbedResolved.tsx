"use client";

import { useEffect, useState } from "react";
import { TikTokBlockquoteEmbed } from "@/components/reels/TikTokBlockquoteEmbed";
import {
  isTikTokCanonicalUrl,
  isTikTokUrl,
  normalizeTikTokCiteUrl,
  resolveTikTokEmbedUrl,
} from "@/lib/tiktokEmbedUrl";

type Props = {
  url: string;
  width: number;
  title?: string;
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

export function TikTokEmbedResolved({ url, width, title }: Props) {
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

  if (resolveFailed || !embedUrl || !isTikTokCanonicalUrl(embedUrl)) {
    return <TikTokPreviewFallback url={trimmed} title={title} />;
  }

  return <TikTokBlockquoteEmbed key={embedUrl} url={embedUrl} width={width} title={title} />;
}
