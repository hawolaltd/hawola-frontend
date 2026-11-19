export default function LivePlayer({ embedUrl, title }: { embedUrl: string; title: string }) {
  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-black text-sm text-white/70">
        Waiting for the stream
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-black">
      <iframe
        title={title}
        src={embedUrl}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
