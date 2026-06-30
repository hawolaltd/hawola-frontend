import React from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductRankPanel from "@/components/home/ProductRankPanel";
import { ProductResponse } from "@/types/product";
import { useAppSelector } from "@/hook/useReduxTypes";

interface TrendingProductsProps {
  products?: ProductResponse;
}

const TrendingProducts = ({ products: _products }: TrendingProductsProps) => {
  const { homePage } = useAppSelector((state) => state.general);
  const bestSellingList = homePage?.data?.best_selling_products ?? [];
  return (
    <section className="w-full py-4">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-6 xl:flex-row xl:items-start xl:gap-6 xl:px-0">
        <div className="min-w-0 w-full flex-1">
          <div className="mx-auto mb-8 w-full text-left">
            <div
              className={
                "flex items-center justify-between border-b border-b-[#CAD6EC] gap-8 p-4"
              }
            >
              <h2 className="text-xl font-semibold text-primary">
                Recommended Products
              </h2>

              {/* <div className={"hidden lg:flex items-center gap-2"}>
                <div
                  className={
                    "p-1 border border-textPadded rounded flex items-center justify-center"
                  }
                >
                  <svg
                    className="w-2 h-2 text-textPadded"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 8 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
                    />
                  </svg>
                </div>

                <div
                  className={
                    "p-1 border border-textPadded rounded flex items-center justify-center"
                  }
                >
                  <svg
                    className="w-2 h-2 text-textPadded"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 8 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
                    />
                  </svg>
                </div>
              </div> */}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {homePage?.data?.recommended_products
              ?.slice(0, 8)
              ?.map((product, key) => (
                <ProductCard key={key} product={product} />
              ))}
          </div>

          {/* <div className={"flex justify-center items-center w-full py-8"}>
            <BannerAds1 />
          </div> */}
        </div>

        <aside className="w-full shrink-0 xl:max-w-[min(22rem,34%)] xl:w-[min(22rem,34%)]">
          <ProductRankPanel title="Best Seller" products={bestSellingList} limit={5} />
        </aside>
      </div>
    </section>
  );
};

export default TrendingProducts;
