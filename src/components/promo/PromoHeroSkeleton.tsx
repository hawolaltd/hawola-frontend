import { resolvePromoHeroStyle } from "./promoHeroTheme";
import type { PromoPageDesign } from "@/components/promo/promoDesignTypes";

type Props = {
  design?: PromoPageDesign;
};

/** Lightweight hero placeholder while promo meta loads. */
export default function PromoHeroSkeleton({ design = "classic" }: Props) {
  const hero = resolvePromoHeroStyle({ page_design: design });

  return (
    <section
      className="relative overflow-hidden border-b border-black/5"
      style={{
        backgroundImage: `linear-gradient(135deg, ${hero.gradientFrom} 0%, ${hero.gradientTo} 100%)`,
      }}
      aria-busy="true"
      aria-label="Loading promotion"
    >
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 xl:px-0">
        <div className="h-3 w-24 rounded-full bg-black/10 motion-safe:animate-pulse" />
        <div className="mt-4 h-10 w-2/3 max-w-md rounded-lg bg-black/10 motion-safe:animate-pulse sm:h-14" />
        <div className="mt-4 space-y-2 max-w-xl">
          <div className="h-4 w-full rounded bg-black/10 motion-safe:animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-black/10 motion-safe:animate-pulse" />
        </div>
        <div className="mt-6 flex gap-3">
          <div className="h-9 w-28 rounded-full bg-black/10 motion-safe:animate-pulse" />
          <div className="h-9 w-32 rounded-full bg-black/10 motion-safe:animate-pulse" />
        </div>
      </div>
    </section>
  );
}
