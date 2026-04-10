/**
 * Shared full-bleed background: deep base, vignette, drifting brand-color blobs,
 * noise grain, and optional slow orbit rings (matches storefront preloader aesthetic).
 */
export default function BrandAtmosphereBackdrop({
  showOrbitRings = true,
  orbitSize = "md",
  /** `bright` = visible white rolling rings (storefront preloader); `soft` = quiet ambient (e.g. launch page) */
  orbitTone = "soft",
}: {
  showOrbitRings?: boolean;
  /** Larger rings for full-page layouts (e.g. launch page) */
  orbitSize?: "md" | "lg";
  orbitTone?: "soft" | "bright";
}) {
  const orbitClass =
    orbitSize === "lg"
      ? "h-[min(85vmin,480px)] w-[min(85vmin,480px)]"
      : "h-[min(72vmin,340px)] w-[min(72vmin,340px)]";

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[#060b14]" aria-hidden />

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(66,90,139,0.22),transparent_65%)]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -left-[18%] -top-[22%] h-[min(92vw,560px)] w-[min(92vw,560px)] rounded-full bg-primary/45 blur-[110px] motion-safe:animate-preloader-drift"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[12%] top-[28%] h-[min(85vw,500px)] w-[min(85vw,500px)] rounded-full bg-secondaryTextColor/40 blur-[100px] motion-safe:animate-preloader-drift-reverse"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-12%] left-[22%] h-[min(75vw,420px)] w-[min(75vw,420px)] rounded-full bg-orange/35 blur-[95px] motion-safe:animate-preloader-drift-slow"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      {showOrbitRings && (
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 flex ${orbitClass} -translate-x-1/2 -translate-y-1/2 items-center justify-center motion-safe:animate-preloader-orbit motion-reduce:hidden`}
          aria-hidden
        >
          <svg
            className={
              orbitTone === "bright"
                ? "h-full w-full text-white/75 drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                : "h-full w-full text-white/10"
            }
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="100"
              cy="100"
              r="88"
              stroke="currentColor"
              strokeWidth={orbitTone === "bright" ? 0.9 : 0.5}
              strokeDasharray="4 12"
            />
            <circle
              cx="100"
              cy="100"
              r="72"
              stroke="currentColor"
              strokeWidth={orbitTone === "bright" ? 0.65 : 0.35}
              opacity={orbitTone === "bright" ? 0.85 : 0.6}
              strokeDasharray="2 10"
            />
          </svg>
        </div>
      )}
    </>
  );
}
