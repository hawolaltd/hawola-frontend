import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { getHomePage } from "@/redux/general/generalSlice";
import Link from "next/link";
import { useRouter } from "next/router";

function Categories() {
  const {
    products,
    carts,
    categories,
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
  const isExpandedCategoriesPage = !type || !slug;
  const { homePage } = useAppSelector((state) => state.general);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<number | null>(null);

  const dispatch = useAppDispatch();

  const init = useCallback(async () => {
    try {
      if (!type || !slug) return;
      const page = Number(router.query.page) || 1;
      if (type === "cat") {
        dispatch(getAllProductBaseOnCategories({ slug, page: String(page) }));
      } else if (type === "subcat") {
        dispatch(
          getAllProductBaseOnSubCategories({ slug, page: String(page) })
        );
      } else {
        dispatch(
          getAllProductBaseOnSecondLevelSubCategories({
            slug,
            page: String(page),
          })
        );
      }
    } catch (e) {}
  }, [dispatch, slug, type, router.query.page]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isExpandedCategoriesPage) return;
    dispatch(getAllCategories());
    dispatch(getHomePage());
  }, [dispatch, isExpandedCategoriesPage]);

  const categoriesTree = useMemo(() => {
    const list = categories?.categories || [];
    const sorted = [...list].sort((a: any, b: any) => {
      const aScore = (a?.subcategory || []).reduce(
        (sum: number, sub: any) => sum + ((sub?.second_subcategory || []).length > 0 ? 2 : 0),
        0
      );
      const bScore = (b?.subcategory || []).reduce(
        (sum: number, sub: any) => sum + ((sub?.second_subcategory || []).length > 0 ? 2 : 0),
        0
      );
      if (aScore !== bScore) return bScore - aScore;
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
    return sorted;
  }, [categories?.categories]);

  useEffect(() => {
    if (!isExpandedCategoriesPage || categoriesTree.length === 0) return;
    if (activeCategoryId && categoriesTree.some((cat: any) => cat.id === activeCategoryId)) return;
    const firstCategory = categoriesTree[0];
    setActiveCategoryId(firstCategory?.id || null);
    const firstSub = (firstCategory?.subcategory || [])[0];
    setActiveSubCategoryId(firstSub?.id || null);
  }, [isExpandedCategoriesPage, categoriesTree, activeCategoryId]);

  if (isExpandedCategoriesPage) {
    const recommendedProducts = homePage?.data?.recommended_products || [];
    const activeCategory =
      categoriesTree.find((cat: any) => cat.id === activeCategoryId) || categoriesTree[0];
    const subcategories = activeCategory?.subcategory || [];
    const activeSubcategory =
      subcategories.find((sub: any) => sub.id === activeSubCategoryId) || subcategories[0];
    const thirdLevel = activeSubcategory?.second_subcategory || [];

    return (
      <AuthLayout>
        <div className="pb-20">
          <section className="mx-auto w-full max-w-screen-xl px-6 py-8 xl:px-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-primary">Shop by Categories</h1>
              <p className="mt-1 text-sm text-gray-600">
                Explore all categories and subcategories in one expanded view.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm lg:col-span-4 xl:col-span-3">
                <div className="mb-2 border-b border-gray-100 px-2 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Categories</p>
                </div>
                <div className="max-h-[520px] space-y-1 overflow-y-auto pr-1">
                  {categoriesTree.map((category: any) => {
                    const isActive = category.id === activeCategory?.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setActiveCategoryId(category.id);
                          setActiveSubCategoryId((category?.subcategory || [])[0]?.id || null);
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                          isActive
                            ? "bg-amber-50 text-deepOrange ring-1 ring-amber-200"
                            : "text-primary hover:bg-gray-50"
                        }`}
                      >
                        <img
                          src={category?.icon || category?.image || "/imgs/page/blog/img-big5.png"}
                          alt={category?.name || "Category"}
                          className="h-9 w-9 rounded-md object-cover"
                        />
                        <span className="text-sm font-semibold">{category?.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-4 xl:col-span-4">
                <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {activeCategory?.name || "Subcategories"}
                  </p>
                  {activeCategory?.slug ? (
                    <Link
                      href={`/categories?type=cat&slug=${activeCategory.slug}`}
                      className="text-xs font-semibold text-deepOrange hover:underline"
                    >
                      View category
                    </Link>
                  ) : null}
                </div>
                <div className="max-h-[520px] space-y-1 overflow-y-auto pr-1">
                  {subcategories.map((sub: any) => {
                    const isActive = sub.id === activeSubcategory?.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setActiveSubCategoryId(sub.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                          isActive
                            ? "bg-amber-50 text-deepOrange ring-1 ring-amber-200"
                            : "text-primary hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-sm font-medium">{sub.name}</span>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-4 xl:col-span-5">
                <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {activeSubcategory?.name || "Third level"}
                  </p>
                  {activeSubcategory?.slug ? (
                    <Link
                      href={`/categories?type=subcat&slug=${activeSubcategory.slug}`}
                      className="text-xs font-semibold text-deepOrange hover:underline"
                    >
                      View subcategory products
                    </Link>
                  ) : null}
                </div>
                <div className="max-h-[520px] overflow-y-auto pr-1">
                  {thirdLevel.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {thirdLevel.map((third: any) => (
                        <Link
                          key={third.id}
                          href={`/categories?type=subsubcat&slug=${third.slug}`}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-primary transition hover:border-[#f59e0b] hover:text-deepOrange"
                        >
                          {third.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                      Select a subcategory to view third-level categories.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-screen-xl px-6 py-2 xl:px-0">
            <div className="mb-4 flex items-center justify-between border-b border-[#CAD6EC] pb-3">
              <h2 className="text-xl font-semibold text-primary">Recommended for you</h2>
              <Link href="/" className="text-sm font-semibold text-deepOrange hover:underline">
                Back to Home
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedProducts.slice(0, 8).map((product: any) => (
                <ProductCard key={product?.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </AuthLayout>
    );
  }

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

  // Compute banner src with safe fallback to placeholder
  const bannerSrc =
    currentCategoryInfo?.image && (currentCategoryInfo as any).image?.full_size
      ? (currentCategoryInfo as any).image.full_size
      : "/imgs/page/blog/img-big5.png";

  // Combine promoted products with regular products, ensuring promoted products come first
  const allProducts = [...promotedProducts?.filter(item => item.name), ...(currentProducts || [])];

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
          <div className="mx-auto flex w-full max-w-screen-xl px-6 py-8 xl:px-0">
            <div className="w-full h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Products skeleton */}
          <div className="mx-auto w-full max-w-screen-xl px-6 py-8 xl:px-0">
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
          {/* Show banner with placeholder if category image is missing */}
          <div className="container mx-auto max-w-screen-xl flex justify-center py-8">
            <img
              src={bannerSrc}
              alt={"category banner"}
              className="w-full h-52 object-cover"
            />
          </div>

          {/* Show subcategory slider if available */}
          {type !== "subsubcat" && currentCategoryInfo?.subcategory && (
            <ProductSlider subcategory={currentCategoryInfo.subcategory} />
          )}

          {/* Filter bar */}
          <div className="mx-auto flex w-full max-w-screen-xl px-6 py-8 xl:px-0">
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
        <div className="mx-auto flex w-full max-w-screen-xl justify-center px-6 py-8 xl:px-0">
          <img
            src={bannerSrc}
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

        <div className="mx-auto flex w-full max-w-screen-xl px-6 py-8 xl:px-0">
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
          className={`mx-auto w-full max-w-screen-xl px-6 xl:px-0 ${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-2 gap-y-4"
              : "space-y-4"
          }`}
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

        {/* Pagination UI */}
        {(() => {
          // Get pagination info from the current category object
          const currentCategoryObj =
            type === "cat"
              ? productBaseOnCategories
              : type === "subcat"
              ? productBaseOnSubCategories
              : productBaseOnSecLevelSubCategories;
          const totalPages = currentCategoryObj?.number_of_pages || 1;
          const currentPage = currentCategoryObj?.page || 1;

          console.log("currentCategoryObj:", currentCategoryObj);

          if (totalPages <= 0) return null;

          // Helper to handle page change
          const handlePageChange = (page: number) => {
            if (page < 1 || page > totalPages || page === currentPage) return;
            // Update the query param for page
            router.push({
              pathname: router.pathname,
              query: { ...router.query, page },
            });
          };

          // Generate page numbers (show all if <= 7, else window around current)
          let pageNumbers: number[] = [];
          if (totalPages <= 7) {
            pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
          } else {
            if (currentPage <= 4) {
              pageNumbers = [1, 2, 3, 4, 5, -1, totalPages];
            } else if (currentPage >= totalPages - 3) {
              pageNumbers = [
                1,
                -1,
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
              ];
            } else {
              pageNumbers = [
                1,
                -1,
                currentPage - 1,
                currentPage,
                currentPage + 1,
                -1,
                totalPages,
              ];
            }
          }

          return (
            <div className="mx-auto my-8 flex w-full max-w-screen-xl items-center justify-start gap-2 px-6 xl:px-0">
              <button
                className="px-2 py-1 rounded text-gray-400 hover:text-primary disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {pageNumbers.map((num, idx) =>
                num === -1 ? (
                  <span
                    key={"ellipsis-" + idx}
                    className="px-3 py-2 text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={num}
                    className={`px-2.5 py-0.5 rounded border ${
                      num === currentPage
                        ? "bg-deepOrange text-white font-bold"
                        : "bg-white text-blue-900 border-gray-200 hover:bg-gray-100"
                    } transition`}
                    onClick={() => handlePageChange(num)}
                    disabled={num === currentPage}
                  >
                    {num}
                  </button>
                )
              )}
              <button
                className="px-2 py-1 rounded text-gray-400 hover:text-primary disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          );
        })()}

        <div className={"mt-28"}>
          <FeaturesSection />
        </div>
      </div>
    </AuthLayout>
  );
}

export default Categories;
