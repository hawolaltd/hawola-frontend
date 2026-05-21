import React from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductRankPanel from "@/components/home/ProductRankPanel";
import { ProductResponse } from "@/types/product";
import { useAppSelector } from "@/hook/useReduxTypes";
import type { ProductFull } from "@/types/home";

interface TopRateProductsProps {
  products: ProductResponse;
}

const TopRateProducts = ({ products: _products }: TopRateProductsProps) => {
  const { homePage } = useAppSelector((state) => state.general);
  const topRated = homePage?.data?.top_rated_products ?? [];
  const topSelling = (homePage?.data?.top_selling_products ?? []) as ProductFull[];

  return (
    <section className="w-full py-4">
      <div className="mx-auto max-w-screen-xl px-6 xl:px-0">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-6">
          <div className="min-w-0 w-full flex-1">
            <div className="mx-auto mb-8 w-full text-left">
              <div className="flex items-center justify-between gap-8 border-b border-b-[#CAD6EC] p-4">
                <h2 className="text-xl font-semibold text-primary">
                  Top Rated Products
                </h2>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3">
              {topRated.map((product, key) => (
                <ProductCard key={product?.id ?? key} product={product} />
              ))}
            </div>
          </div>

          <aside className="w-full shrink-0 xl:w-[min(22rem,34%)] xl:max-w-[min(22rem,34%)]">
            <ProductRankPanel
              title="Top Selling Products"
              products={topSelling}
              limit={8}
            />
          </aside>
        </div>
      </div>
    </section>
  );
};

export default TopRateProducts;
