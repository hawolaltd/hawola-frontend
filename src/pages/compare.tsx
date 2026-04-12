import React, { useCallback, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  addToCarts,
  addToCartsLocal,
  clearCompare,
  getCarts,
  removeFromCompare,
} from "@/redux/product/productSlice";
import { LocalCartItem, Product } from "@/types/product";
import { formatCurrency, featuredImageCardSrc } from "@/util";
import { toast } from "sonner";

export default function ComparePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { compareProducts } = useAppSelector((s) => s.products);
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [addingId, setAddingId] = useState<number | null>(null);

  /** Effective shelf price for comparison (same as displayed main price). */
  const priceRange = useMemo(() => {
    if (compareProducts.length < 2) {
      return { min: null as number | null, max: null as number | null };
    }
    const values = compareProducts.map((p) => {
      const n = Number(p.discount_price);
      return Number.isFinite(n) ? n : 0;
    });
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) {
      return { min: null, max: null };
    }
    return { min, max };
  }, [compareProducts]);

  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (product?.product_variant?.length > 0) {
        toast.message("This product has options to choose.", {
          description: "Open the product page to pick variants before adding to cart.",
          action: {
            label: "View product",
            onClick: () => {
              void router.push(`/product/${product.slug}`);
            },
          },
        });
        return;
      }

      if (product.countInStock <= 0) {
        toast.error("This product is out of stock.");
        return;
      }

      setAddingId(product.id);
      try {
        if (isAuthenticated) {
          const res = await dispatch(
            addToCarts({
              items: [{ qty: 1, product: product.id }],
            })
          );
          if (res?.type.includes("fulfilled")) {
            dispatch(getCarts());
            toast.success("Added to cart");
          } else {
            toast.error("Could not add to cart");
          }
        } else {
          const cartItems: LocalCartItem[] = JSON.parse(
            localStorage.getItem("cartItems") || "[]"
          );
          const existingItemIndex = cartItems.findIndex(
            (item) => item.product?.id === product.id && !item.variant
          );
          if (existingItemIndex >= 0) {
            cartItems[existingItemIndex].qty += 1;
          } else {
            cartItems.push({ qty: 1, product });
          }
          localStorage.setItem("cartItems", JSON.stringify(cartItems));
          dispatch(
            addToCartsLocal({
              items: cartItems.map((item) => ({
                qty: item.qty,
                product: item.product,
                ...(item.variant && { variant: item.variant }),
              })),
            })
          );
          toast.success("Added to cart");
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to add to cart");
      } finally {
        setAddingId(null);
      }
    },
    [dispatch, isAuthenticated, router]
  );

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Compare products</title>
          <meta
            name="description"
            content="Compare selected products side by side"
          />
        </Head>

        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Compare products
              </h1>
              {compareProducts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearCompare());
                    toast.message("Compare list cleared");
                  }}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              )}
            </div>

            {compareProducts.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
                <p className="mb-4 text-gray-600">
                  You have not added any products to compare yet.
                </p>
                <Link
                  href="/search"
                  className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        scope="col"
                        className="sticky left-0 z-20 min-w-[140px] bg-gray-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Product
                      </th>
                      {compareProducts.map((p) => {
                        const cardImg = featuredImageCardSrc(
                          p.featured_image?.[0]
                        );
                        return (
                          <th
                            key={p.id}
                            scope="col"
                            className="min-w-[220px] px-4 py-3 text-left align-top"
                          >
                            <div className="flex flex-col gap-3">
                              <Link
                                href={`/product/${p.slug}`}
                                className="block shrink-0"
                              >
                                {cardImg ? (
                                  <img
                                    src={cardImg}
                                    alt=""
                                    className="mx-auto h-28 w-28 rounded-md object-contain"
                                  />
                                ) : (
                                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                                    No image
                                  </div>
                                )}
                              </Link>
                              <Link
                                href={`/product/${p.slug}`}
                                className="text-sm font-semibold text-primary hover:underline"
                              >
                                {p.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  dispatch(removeFromCompare(p.id))
                                }
                                className="text-left text-xs font-medium text-red-600 hover:text-red-800"
                              >
                                Remove from compare
                              </button>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                        Price
                      </td>
                      {compareProducts.map((p) => {
                        const sale = Number(p.discount_price);
                        const n = Number.isFinite(sale) ? sale : 0;
                        const isLowest =
                          priceRange.min !== null && n === priceRange.min;
                        const isHighest =
                          priceRange.max !== null && n === priceRange.max;
                        const cellClass = isLowest
                          ? "rounded-md bg-emerald-50 px-2 py-2 ring-1 ring-emerald-400/80"
                          : isHighest
                            ? "rounded-md bg-amber-50 px-2 py-2 ring-1 ring-amber-400/80"
                            : "";
                        return (
                          <td
                            key={p.id}
                            className={`px-4 py-3 text-sm text-gray-900 ${cellClass}`}
                          >
                            <div className="font-semibold">
                              {formatCurrency(p.discount_price)}
                            </div>
                            {Number(p.price) > Number(p.discount_price) && (
                              <span className="text-gray-500 line-through">
                                {formatCurrency(p.price)}
                              </span>
                            )}
                            {isLowest && !isHighest && (
                              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                                Lowest price
                              </div>
                            )}
                            {isHighest && !isLowest && (
                              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                                Highest price
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                        Merchant
                      </td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3 text-sm text-gray-900">
                          {p.merchant?.slug && p.merchant?.store_name ? (
                            <Link
                              href={`/merchants/${p.merchant.slug}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {p.merchant.store_name}
                            </Link>
                          ) : (
                            (p.merchant?.store_name ?? "—")
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                        Brand
                      </td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3 text-sm text-gray-900">
                          {p.brand || "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                        In stock
                      </td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3 text-sm text-gray-900">
                          {p.countInStock > 0 ? (
                            <span className="text-green-700">Yes ({p.countInStock})</span>
                          ) : (
                            <span className="text-red-600">Out of stock</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                        Rating
                      </td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3 text-sm text-gray-900">
                          {p.rating ?? "—"} ({p.numReviews ?? 0} reviews)
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                        Add to cart
                      </td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="px-4 py-3">
                          <button
                            type="button"
                            disabled={addingId === p.id}
                            onClick={() => void handleAddToCart(p)}
                            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {addingId === p.id ? "Adding…" : "Add to cart"}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthLayout>
  );
}
