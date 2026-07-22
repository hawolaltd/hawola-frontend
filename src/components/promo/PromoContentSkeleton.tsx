import type { PromoSectionTheme } from "@/components/promo/promoHeroTheme";

const PRODUCT_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4";

function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] motion-safe:animate-[promoShimmer_1.4s_ease-in-out_infinite] ${className}`}
    />
  );
}

function SkeletonProductCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <ShimmerBlock className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <ShimmerBlock className="h-2.5 w-1/2" />
        <ShimmerBlock className="h-3.5 w-full" />
        <ShimmerBlock className="h-3.5 w-3/4" />
        <ShimmerBlock className="mt-2 h-4 w-1/3" />
      </div>
    </div>
  );
}

function SkeletonReelCard() {
  return (
    <div className="w-[42vw] max-w-[168px] shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white sm:w-[160px]">
      <ShimmerBlock className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-2 p-2.5">
        <ShimmerBlock className="h-3 w-full" />
        <ShimmerBlock className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function PromoLoadingIndicator({
  message = "Loading curated deals",
  className = "",
  spinnerClass = "border-t-rose-500",
}: {
  message?: string;
  className?: string;
  spinnerClass?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 py-5 text-sm text-slate-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`inline-block h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-slate-200 ${spinnerClass}`}
        aria-hidden
      />
      <span>
        {message}
        <span className="inline-flex w-5 motion-safe:animate-pulse" aria-hidden>
          …
        </span>
      </span>
    </div>
  );
}

type Props = {
  theme: PromoSectionTheme;
  showReelHint?: boolean;
};

/** Placeholder blocks while featured / reel / grid data loads after the hero. */
export default function PromoContentSkeleton({ theme, showReelHint = false }: Props) {
  return (
    <div aria-busy="true" aria-label="Loading sale products">
      <div className="mb-8 overflow-hidden rounded-full bg-slate-100">
        <div className="h-1 w-1/3 motion-safe:animate-[promoProgress_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-rose-400 via-orange-400 to-rose-500" />
      </div>

      <PromoLoadingIndicator
        message="Preparing your picks"
        className="pb-8 pt-1"
        spinnerClass={theme.loadingSpinnerClass}
      />

      <section className={theme.featuredSectionClass}>
        <div
          className={`mb-6 flex flex-wrap items-end justify-between gap-4 border-b pb-4 ${theme.featuredHeaderClass}`}
        >
          <div className="flex-1 space-y-3">
            <ShimmerBlock className="h-3 w-20" />
            <ShimmerBlock className="h-8 w-full max-w-md" />
          </div>
          <ShimmerBlock className="h-7 w-28 rounded-full" />
        </div>
        <div className={PRODUCT_GRID_CLASS}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonProductCard key={`featured-skel-${i}`} />
          ))}
        </div>
      </section>

      {showReelHint ? (
        <section className="mb-10 sm:mb-12" aria-hidden>
          <div className="mb-4 space-y-2">
            <ShimmerBlock className="h-3 w-24" />
            <ShimmerBlock className="h-7 w-48 max-w-full" />
          </div>
          <div className="flex gap-3 overflow-hidden pb-2 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonReelCard key={`reel-skel-${i}`} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <ShimmerBlock className="h-7 w-44 max-w-[60%]" />
          <ShimmerBlock className="hidden h-5 w-24 sm:block" />
        </div>
        <div className={PRODUCT_GRID_CLASS}>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonProductCard key={`grid-skel-${i}`} />
          ))}
        </div>
      </section>

      <style jsx global>{`
        @keyframes promoShimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        @keyframes promoProgress {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </div>
  );
}
