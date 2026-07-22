import Link from "next/link";
import { featuredImageCardSrc, PRODUCT_IMAGE_PLACEHOLDER } from "@/util/featuredImage";
import { formatCurrency } from "@/util";
import { ProductFull } from "@/types/home";

type Props = {
  title: string;
  products: ProductFull[];
  className?: string;
  /** When true, reel stays inside padded content (no edge bleed). */
  inset?: boolean;
  eyebrowClass?: string;
  countBadgeClass?: string;
  fadeClass?: string;
};

export default function PromoProductReel({
  title,
  products,
  className = "",
  inset = false,
  eyebrowClass = "text-rose-500",
  countBadgeClass = "bg-slate-100 text-slate-600",
  fadeClass = "from-white/95",
}: Props) {
  if (products.length < 5) return null;

  return (
    <section
      className={`mb-12 sm:mb-14 ${className}`}
      aria-label={title}
    >
      <div className="mb-4 flex items-end justify-between gap-3 px-0.5">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.28em] sm:text-xs ${eyebrowClass}`}>
            Swipe to explore
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{title}</h2>
        </div>
        <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${countBadgeClass}`}>
          {products.length} picks
        </span>
      </div>

      <div className={inset ? "relative" : "relative -mx-4 sm:-mx-6 xl:mx-0"}>
        <div
          className={
            inset
              ? "flex gap-3 overflow-x-auto overscroll-x-contain pb-2 scroll-smooth snap-x snap-mandatory sm:gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              : "flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 scroll-smooth snap-x snap-mandatory sm:gap-4 sm:px-6 xl:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          }
          role="list"
        >
          {products.map((product) => {
            const img =
              featuredImageCardSrc(product.featured_image?.[0]) || PRODUCT_IMAGE_PLACEHOLDER;
            const hasDiscount =
              product.discount_price != null &&
              product.price != null &&
              String(product.discount_price).trim() !== "" &&
              String(product.discount_price) !== String(product.price);
            const displayPrice = hasDiscount ? product.discount_price : product.price;

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                role="listitem"
                className="group flex w-[42vw] max-w-[168px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[160px] md:w-[172px]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                  <img
                    src={img}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  {hasDiscount ? (
                    <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Sale
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 sm:text-sm">
                    {product.name}
                  </p>
                  <p className="mt-auto pt-2 text-sm font-bold text-rose-600">
                    {formatCurrency(displayPrice)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${fadeClass} to-transparent sm:w-12`}
          aria-hidden
        />
      </div>
    </section>
  );
}
