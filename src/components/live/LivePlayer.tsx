export default function LivePlayer({
  embedUrl,
  title,
  className = "",
  fill = false,
}: {
  embedUrl: string;
  title: string;
  className?: string;
  fill?: boolean;
}) {
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
    <div className={`overflow-hidden bg-black ${fill ? "relative h-full min-h-0" : ""} ${className}`}>
      <iframe
        title={title}
        src={embedUrl}
        className={fill ? "absolute inset-0 h-full w-full" : "aspect-video h-full w-full"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
