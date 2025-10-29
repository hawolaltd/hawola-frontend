import React from "react";
import Slider from "react-slick";
import ProductCard from "@/components/product/ProductCard";
import { ProductResponse } from "@/types/product";

interface ProductListProps {
  products: ProductResponse;
}

const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 5,
  slidesToScroll: 2,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const ProductList = ({ products }: ProductListProps) => {
  return (
    <section className="max-w-screen-xl px-6 xl:px-0 mx-auto py-4">
      <div className="flex flex-col xl:flex-row justify-between items-center mx-auto text-left mb-8 w-full border-b border-b-[#CAD6EC] pb-4">
        <div className={"flex items-center gap-8"}>
          <h2 className="text-xs md:text-xl font-semibold text-[#425A8B]">
            Recommended
          </h2>
          <h2 className="text-xs md:text-xl font-semibold text-[#8C9EC5]">
            Best Seller
          </h2>
          <h2 className="text-xs md:text-xl font-semibold text-[#8C9EC5]">
            Most Viewed
          </h2>
        </div>

        <div className={"hidden md:flex items-center gap-2"}>
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
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 w-full">
        <Slider {...settings}>
          {products?.results?.map((product) => (
            <ProductCard key={product?.id} product={product} margin={"mx-2"} />
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ProductList;
