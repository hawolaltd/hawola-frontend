import React from "react";
import BannerAds1 from "@/components/svg/banner-ads1";
import ProductCard from "@/components/product/ProductCard";
import ProductCard2 from "@/components/product/ProductCard2";
import { ProductResponse } from "@/types/product";
import { useAppSelector } from "@/hook/useReduxTypes";

interface TopRateProductsProps {
  products: ProductResponse;
}

const TopRateProducts = ({ products }: TopRateProductsProps) => {
  const { homePage } = useAppSelector((state) => state.general);

  return (
    <section className="max-w-screen-xl px-6 xl:px-0 mx-auto flex gap-4 bg-[#f1f3f9] py-4">
      <div
        className={"w-full flex flex-col xl:flex-row gap-4"}
      >
        <div className="w-full">
          <div className="mx-auto text-left mb-8 w-full">
            <div
              className={
                "flex items-center justify-between border-b border-b-[#CAD6EC] gap-8 p-4"
              }
            >
              <h2 className="text-xl font-semibold text-primary">
                Top Rated Products
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 w-full">
            {homePage?.data?.top_rated_products?.map((product, key) => (
              <ProductCard key={key} product={product} />
            ))}
          </div>
        </div>

        <div className={"flex flex-col gap-6 w-[31%]"}>
          <div className="bg-white rounded gap-2">
            <div
              className={
                "bg-[#fe9636] rounded-tl rounded-tr py-4 px-4 h-[62px] flex justify-between items-center"
              }
            >
              <h4 className={"font-semibold text-xl text-white "}>
                Top Selling
              </h4>
            </div>
            <div className="bg-white rounded gap-2 ">
              {homePage?.data?.top_selling_products
                ?.slice(0, 4)
                ?.map((item, key) => {
                  return (
                    <ProductCard2
                      product={homePage?.data?.top_selling_products}
                      key={key}
                      item={item}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopRateProducts;
