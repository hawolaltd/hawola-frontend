import React, { useCallback, useEffect, useState } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import ProductSlider from "@/components/categories/ProductSlider";
import Ads2 from "@/components/svg/ads2";
import FilterBar from "@/components/categories/FilterBar";
import ProductCard from "@/components/product/ProductCard";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import FeaturesSection from "@/components/home/FeaturesSection";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import ProductSkeleton from "@/components/shared/ProductSkeleton";
import {
  getAllCategories,
  getAllProductBaseOnCategories,
  getAllProductBaseOnSecondLevelSubCategories,
  getAllProductBaseOnSubCategories,
  getProducts,
} from "@/redux/product/productSlice";
import { useRouter } from "next/router";

function Categories() {
  const {
    products,
    carts,
    productBaseOnCategories,
    productBaseOnSubCategories,
    productBaseOnSecLevelSubCategories,
    isLoading,
  } = useAppSelector((state) => state.products);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  console.log("productBaseOnCategories", productBaseOnCategories);

  const router = useRouter();

  const type = router.query.type as string;
  const slug = router.query.slug as string;

  const dispatch = useAppDispatch();

  const init = useCallback(async () => {
    try {
      if (type === "cat") {
        dispatch(getAllProductBaseOnCategories(slug));
      } else if (type === "subcat") {
        dispatch(getAllProductBaseOnSubCategories(slug));
      } else {
        dispatch(getAllProductBaseOnSecondLevelSubCategories(slug));
      }
    } catch (e) {}
  }, [dispatch, slug, type]);

  useEffect(() => {
    init();
  }, [init]);

  // Get current products based on type
  const getCurrentProducts = () => {
    if (type === "cat") {
      return productBaseOnCategories?.products;
    } else if (type === "subcat") {
      return productBaseOnSubCategories?.products;
    } else {
      return productBaseOnSecLevelSubCategories?.products;
    }
  };

  // Get current category info based on type
  const getCurrentCategoryInfo = () => {
    if (type === "cat") {
      return productBaseOnCategories?.category_info;
    } else if (type === "subcat") {
      return productBaseOnSubCategories?.category_info;
    } else {
      return productBaseOnSecLevelSubCategories?.category_info;
    }
  };

  // Get promoted products based on type
  const getPromotedProducts = () => {
    if (type === "cat") {
      return productBaseOnCategories?.promoted_products || [];
    } else if (type === "subcat") {
      return productBaseOnSubCategories?.promoted_products || [];
    } else {
      return productBaseOnSecLevelSubCategories?.promoted_products || [];
    }
  };

  const currentProducts = getCurrentProducts();
  const currentCategoryInfo = getCurrentCategoryInfo();
  const promotedProducts = getPromotedProducts();

  // Combine promoted products with regular products, ensuring promoted products come first
  const allProducts = [...promotedProducts, ...(currentProducts || [])];

  // Loading state
  if (isLoading) {
    return (
      <AuthLayout>
        <div className={`h-fit pb-28`}>
          {/* Banner skeleton */}
          <div className="container mx-auto max-w-screen-xl flex justify-center py-8">
            <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Product slider skeleton */}
          <div className="container mx-auto max-w-screen-xl py-8">
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Filter bar skeleton */}
          <div className="container mx-auto w-full max-w-screen-full flex py-8">
            <div className="w-full h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Products skeleton */}
          <div className="container mx-auto w-full max-w-screen-full py-8">
            <ProductSkeleton
              count={10}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-2 gap-y-4"
            />
          </div>

          <div className={"mt-28"}>
            <FeaturesSection />
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Empty state
  if (!currentProducts || currentProducts.length === 0) {
    return (
      <AuthLayout>
        <div className={`h-fit pb-28`}>
          {/* Show banner if available */}
          {currentCategoryInfo?.image && (
            <div className="container mx-auto max-w-screen-xl flex justify-center py-8">
              <img src={currentCategoryInfo.image} alt={"category banner"} />
            </div>
          )}

          {/* Show subcategory slider if available */}
          {type !== "subsubcat" && currentCategoryInfo?.subcategory && (
            <ProductSlider subcategory={currentCategoryInfo.subcategory} />
          )}

          {/* Filter bar */}
          <div className="container mx-auto w-full max-w-screen-full flex py-8">
            <FilterBar
              products={
                type === "cat"
                  ? productBaseOnCategories
                  : type === "subcat"
                  ? productBaseOnSubCategories
                  : productBaseOnSecLevelSubCategories
              }
            />
          </div>

          {/* Empty state */}
          <EmptyState
            title="No products found"
            description="We couldn't find any products in this category. Try adjusting your filters or browse other categories."
            icon={
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
            action={
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
              >
                Browse All Products
              </button>
            }
            className="min-h-[400px]"
          />

          <div className={"mt-28"}>
            <FeaturesSection />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className={`h-fit pb-28`}>
        <div className="container mx-auto max-w-screen-xl flex justify-center py-8">
          <img
            // src={
            //   currentCategoryInfo?.image
            //     ? currentCategoryInfo?.image
            //     : "/imgs/page/blog/img-big5.png"
            // }
            src={"/imgs/page/blog/img-big5.png"}
            alt={"category banner"}
            className="w-full h-52 object-cover"
          />
        </div>

        {type !== "subsubcat" && currentCategoryInfo?.subcategory && (
          <ProductSlider subcategory={currentCategoryInfo.subcategory} />
        )}

        {/*<div className="container mx-auto max-w-screen-xl flex justify-center py-8">*/}
        {/*    <Ads2/>*/}
        {/*</div>*/}

        <div className="container mx-auto w-full max-w-screen-full flex  py-8">
          <FilterBar
            products={
              type === "cat"
                ? productBaseOnCategories
                : type === "subcat"
                ? productBaseOnSubCategories
                : productBaseOnSecLevelSubCategories
            }
          />
        </div>

        <div
          className={`container mx-auto ${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-2 gap-y-4"
              : "space-y-4"
          } w-full`}
        >
          {allProducts?.map((product: any) => (
            <ProductCard
              key={product?.id}
              product={product}
              margin={"mx-2"}
              isPromoted={promotedProducts.some(
                (promoted: any) => promoted.id === product.id
              )}
            />
          ))}
        </div>

        <div className={"mt-28"}>
          <FeaturesSection />
        </div>
      </div>
    </AuthLayout>
  );
}

export default Categories;
