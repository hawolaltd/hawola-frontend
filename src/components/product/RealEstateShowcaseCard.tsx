import Link from "next/link";
import { ProductFull } from "@/types/home";
import { featuredImageCardUrl, formatCurrency } from "@/util";

type RealEstateShowcaseCardProps = {
  product: ProductFull;
  promoted?: boolean;
};

export default function RealEstateShowcaseCard({ product, promoted }: RealEstateShowcaseCardProps) {
  const hasDiscount =
    product?.discount_price != null &&
    product?.price != null &&
    String(product.discount_price).trim() !== "" &&
    String(product.discount_price) !== String(product.price);

  return (
    <Link
      href={`/product/${product?.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-emerald-200/70 bg-white p-3 shadow-[0_14px_36px_rgba(16,24,40,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(16,24,40,0.18)]"
    >
      {promoted && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
          Promoted
        </span>
      )}

      <div className="relative h-56 overflow-hidden rounded-xl bg-slate-100">
        <img
          src={featuredImageCardUrl(product?.featured_image?.[0])}
          alt={product?.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/70 via-slate-800/20 to-transparent" />
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700/90">
          {product?.merchant?.store_name}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-900">{product?.name}</h3>

        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
          {hasDiscount ? (
            <>
              <p className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</p>
              <p className="text-xl font-black text-emerald-700">{formatCurrency(product.discount_price)}</p>
            </>
          ) : (
            <p className="text-xl font-black text-emerald-700">{formatCurrency(product.price)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
