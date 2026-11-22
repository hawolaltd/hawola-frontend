export type StreamPlatform = "youtube" | "facebook" | "instagram" | "tiktok";

export function isYoutubeEmbed(embedUrl: string, platform?: string | null) {
  if (platform) return platform === "youtube";
  const blob = (embedUrl || "").toLowerCase();
  return blob.includes("youtube.com") || blob.includes("youtu.be");
}

export function glasshouseEmbedUrl(embedUrl: string, platform?: string | null) {
  if (!embedUrl) return "";
  if (!isYoutubeEmbed(embedUrl, platform)) return embedUrl;
  try {
    const u = new URL(embedUrl);
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("mute", "1");
    u.searchParams.set("playsinline", "1");
    u.searchParams.set("rel", "0");
    u.searchParams.set("enablejsapi", "1");
    u.searchParams.set("modestbranding", "1");
    return u.toString();
  } catch {
    return embedUrl;
  }
}

export function streamPlatformLabel(platform?: string | null) {
  if (platform === "facebook") return "Facebook";
  if (platform === "instagram") return "Instagram";
  if (platform === "tiktok") return "TikTok";
  return "YouTube";
}
