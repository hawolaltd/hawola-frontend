import React from "react";
import ProductCard from "@/components/product/ProductCard";
import { ProductResponse } from "@/types/product";
import { useAppSelector } from "@/hook/useReduxTypes";
import type { ProductFull } from "@/types/home";

interface HawolaSpecialsProps {
  products?: ProductResponse;
}

function specialsList(homePage: { data?: Record<string, unknown> } | null): ProductFull[] {
  const d = homePage?.data;
  if (!d) return [];
  const h = d.hawola_specials;
  const o = d.odinwo_specials;
  if (Array.isArray(h) && h.length) return h as ProductFull[];
  if (Array.isArray(o) && o.length) return o as ProductFull[];
  return [];
}

/**
 * Featured specials — classic home layout (same rhythm as Recommended / Top Rated).
 */
const HawolaSpecials = ({ products: _products }: HawolaSpecialsProps) => {
  const { homePage } = useAppSelector((state) => state.general);
  const list = specialsList(homePage).filter(Boolean).slice(0, 8);
  if (!list.length) return null;

  return (
    <section className="w-full py-4">
      <div className="mx-auto w-full max-w-screen-xl px-6 xl:px-0">
        <div className="mx-auto mb-8 w-full text-left">
          <div className="flex flex-col border-b border-b-[#CAD6EC] p-4">
            <p className="mb-1.5 text-xs text-textPadded">Hand-picked for you</p>
            <h2 className="text-xl font-semibold text-primary">Hawola Specials</h2>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {list.map((product, key) => (
            <ProductCard key={product.id ?? key} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HawolaSpecials;
