"use client";

import dynamic from "next/dynamic";
import { TikTokEmbed } from "react-social-media-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { InstagramBlockquoteEmbed } from "@/components/reels/InstagramBlockquoteEmbed";
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

function getTikTokCiteUrl(url: string): string {
  try {
    const raw = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
    return new URL(raw).href;
  } catch {
    return url.trim();
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
  embedSize?: "compact" | "default";
}

const EMBED_WIDTH = 328;

export function ReelEmbed({
  platform,
  url,
  title,
  className = "",
  embedSize = "default",
}: ReelEmbedProps) {
  if (platform === "youtube") {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return null;
    return (
      <div className={`aspect-video overflow-hidden rounded-lg bg-black ${className}`}>
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
      <InstagramBlockquoteEmbed
        url={url}
        title={title}
        className={className}
        embedSize={embedSize}
      />
    );
  }

  if (platform === "tiktok") {
    const citeUrl = getTikTokCiteUrl(url);
    return (
      <div
        className={`flex justify-center overflow-hidden rounded-lg [&_.tiktok-embed]:max-w-full ${className}`}
      >
        <TikTokEmbed url={citeUrl} width={EMBED_WIDTH} />
      </div>
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
    if (full.includes("tiktok.com") || full.includes("vm.tiktok.com")) return "tiktok";
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
