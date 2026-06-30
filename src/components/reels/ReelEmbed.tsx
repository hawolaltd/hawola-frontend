"use client";

import dynamic from "next/dynamic";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { InstagramIframeEmbed } from "@/components/reels/InstagramIframeEmbed";
import { TikTokIframeEmbed } from "@/components/reels/TikTokIframeEmbed";
import { normalizeInstagramPermalinkForEmbed } from "@/lib/instagramEmbedUrl";

export type ReelPlatform = "youtube" | "instagram" | "tiktok";

function getYoutubeVideoId(url: string): string {
  try {
    const u = new URL(url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`);
    return u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return "";
  }
}

const LiteYouTubeEmbed = dynamic(
  () => import("react-lite-youtube-embed").then((mod) => mod.default),
  { ssr: false },
);

export interface ReelEmbedProps {
  platform: ReelPlatform;
  url: string;
  title?: string;
  className?: string;
  /**
   * Instagram’s oEmbed blockquote needs ~326px width; use `compact` in narrow cards
   * (still min 326px inside the component) and `default` in the full-screen modal.
   */
  embedSize?: "compact" | "default" | "grid";
  /** When false, embeds ignore pointer events so reel popups can scroll between items. */
  interactive?: boolean;
}

export function ReelEmbed({
  platform,
  url,
  title,
  className = "",
  embedSize = "default",
  interactive = true,
}: ReelEmbedProps) {
  if (platform === "youtube") {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return null;
    return (
      <div
        className={`aspect-video overflow-hidden rounded-lg bg-black ${interactive ? "" : "pointer-events-none"} ${className}`}
      >
        <LiteYouTubeEmbed
          id={videoId}
          title={title || "YouTube video"}
          lazyLoad
          poster="maxresdefault"
        />
      </div>
    );
  }

  if (platform === "instagram") {
    return (
      <InstagramIframeEmbed
        url={url}
        title={title}
        className={className}
        embedSize={embedSize}
        interactive={interactive}
      />
    );
  }

  if (platform === "tiktok") {
    return (
      <TikTokIframeEmbed
        url={url}
        title={title}
        className={className}
        embedSize={embedSize}
        interactive={interactive}
      />
    );
  }

  return null;
}

export function getReelPlatform(url: string): ReelPlatform | null {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;
  if (normalizeInstagramPermalinkForEmbed(trimmed)) return "instagram";
  const lower = trimmed.toLowerCase();
  try {
    const u = new URL(lower.startsWith("http") ? lower : `https://${lower}`);
    const full = u.href.toLowerCase();
    if (full.includes("youtube.com") || full.includes("youtu.be/")) return "youtube";
    if (full.includes("tiktok.com") || full.includes("vm.tiktok.com") || full.includes("vt.tiktok.com")) return "tiktok";
  } catch {
    return null;
  }
  return null;
}

function normalizeApiPlatform(p?: string | null): ReelPlatform | null {
  if (!p || typeof p !== "string") return null;
  const v = p.trim().toLowerCase();
  if (v === "youtube" || v === "instagram" || v === "tiktok") return v;
  return null;
}

export function resolveReelPlatform(reel: { platform?: string | null; video_link: string }): ReelPlatform | null {
  const link = (reel.video_link || "").trim();
  if (normalizeInstagramPermalinkForEmbed(link)) return "instagram";
  const fromApi = normalizeApiPlatform(reel.platform);
  if (fromApi === "youtube" || fromApi === "tiktok") return fromApi;
  if (fromApi === "instagram") return "instagram";
  return getReelPlatform(link);
}
