import Link from "next/link";
import { ProductFull } from "@/types/home";
import { featuredImageCardUrl, formatCurrency } from "@/util";

type VehicleShowcaseCardProps = {
  product: ProductFull;
  promoted?: boolean;
};

export default function VehicleShowcaseCard({ product, promoted }: VehicleShowcaseCardProps) {
  const productHref = product?.slug ? `/product/${encodeURIComponent(product.slug)}` : "#";
  const hasDiscount =
    product?.discount_price != null &&
    product?.price != null &&
    String(product.discount_price).trim() !== "" &&
    String(product.discount_price) !== String(product.price);

  return (
    <Link
      href={productHref}
      className="group relative block overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-3 shadow-[0_14px_40px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:border-amber-400/70"
    >
      {promoted && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900">
          Promoted
        </span>
      )}

      <div className="relative h-52 overflow-hidden rounded-xl bg-slate-800">
        <img
          src={featuredImageCardUrl(product?.featured_image?.[0])}
          alt={product?.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/85">
          {product?.merchant?.store_name}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-white">{product?.name}</h3>

        <div className="mt-3 flex items-center justify-between border-t border-slate-700/70 pt-2.5">
          <div>
            {hasDiscount ? (
              <>
                <p className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</p>
                <p className="text-lg font-black text-amber-300">{formatCurrency(product.discount_price)}</p>
              </>
            ) : (
              <p className="text-lg font-black text-amber-300">{formatCurrency(product.price)}</p>
            )}
          </div>
          <span className="rounded-full border border-cyan-400/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
