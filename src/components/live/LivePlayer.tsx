import { streamPlatformLabel } from "@/lib/liveStream";

export default function LivePlayer({
  embedUrl,
  title,
  className = "",
  fill = false,
  platform,
  sourceUrl,
}: {
  embedUrl: string;
  title: string;
  className?: string;
  fill?: boolean;
  platform?: string | null;
  sourceUrl?: string | null;
}) {
  const nativeHint = platform === "instagram" || platform === "tiktok";
  if (!embedUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-black text-sm text-white/60 ${
          fill ? "h-full min-h-0" : "aspect-video"
        } ${className}`}
      >
        Waiting for the stream
      </div>
    );
  }
  return (
    <div className={`overflow-hidden bg-black ${fill ? "relative h-full min-h-0" : "relative"} ${className}`}>
      <iframe
        title={title}
        src={embedUrl}
        className={fill ? "absolute inset-0 h-full w-full" : "aspect-video h-full w-full"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      {nativeHint && sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Open on {streamPlatformLabel(platform)}
        </a>
      ) : null}
    </div>
  );
}
