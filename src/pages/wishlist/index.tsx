import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  addToCarts,
  addToCartsLocal,
  getCarts,
  getWishList,
  deleteWishList,
} from "@/redux/product/productSlice";
import { LocalCartItem, Product, WishlistResponse } from "@/types/product";
import { toast } from "sonner";
import {
  formatCurrency,
  featuredImageCardUrl,
  isContactMerchantOnlyProduct,
} from "@/util";
import AddToCompareButton from "@/components/compare/AddToCompareButton";
import {
  HeartIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import InlineButtonSpinner from "@/components/ui/InlineButtonSpinner";
import moment from "moment";

/** Compact cards, same density as home top sellers. */
function WishlistLoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading your wishlist">
      <p className="text-center text-sm font-medium text-headerBg">
        Just a sec, fetching your list…
      </p>
      <ul className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li
            key={i}
            className="flex animate-pulse border border-[#dde4f0] bg-white pb-2 pt-3 pl-3 pr-3"
          >
            <div className="relative shrink-0 w-[4.75rem]">
              <div className="h-16 w-full rounded-sm bg-slate-200" />
            </div>
            <div className="min-w-0 flex-1 space-y-2 pl-3 pr-2 py-1">
              <div className="h-3.5 w-[90%] rounded bg-slate-200" />
              <div className="flex gap-2">
                <div className="h-3 w-14 rounded bg-slate-200" />
                <div className="h-3 w-12 rounded bg-slate-200" />
              </div>
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-16 rounded bg-slate-200" />
                <div className="h-7 w-7 rounded-lg bg-slate-200" />
                <div className="h-7 w-7 rounded-lg bg-slate-200" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type WishlistRow = WishlistResponse["wishlists"][number];
type WishlistProduct = WishlistRow["product"] & {
  product_variant?: { id: number }[];
  stock_status?: { tracks_inventory?: boolean; is_out_of_stock?: boolean };
  countInStock?: number;
};

function discountPercentBadge(price?: string | number, discountPrice?: string | number) {
  const p = typeof price === "string" ? +price : price ?? 0;
  const d = typeof discountPrice === "string" ? +discountPrice : discountPrice ?? 0;
  if (!Number.isFinite(p) || !Number.isFinite(d) || p <= 0 || d <= 0 || d >= p) return null;
  return Math.round(((p - d) / p) * 100);
}

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishLists, addToCartPendingProductId, wishlistFetchStatus } =
    useAppSelector((state) => state.products);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const dispatch = useAppDispatch();

  const items: WishlistRow[] = wishLists?.wishlists ?? [];

  const wlFetch = wishlistFetchStatus ?? "idle";
  const showWishlistLoading =
    items.length === 0 && (wlFetch === "pending" || wlFetch === "idle");

  useEffect(() => {
    dispatch(getWishList());
  }, [dispatch]);

  const handleDeleteWishlist = async (wishId: number, productId: number) => {
    setDeletingId(wishId);
    try {
      const res = await dispatch(deleteWishList({ items: productId }));
      if (res?.type.includes("fulfilled")) {
        toast.success("Removed from wishlist");
        dispatch(getWishList());
      } else {
        toast.error("Could not remove item");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not remove item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddToCart = useCallback(
    async (row: WishlistRow) => {
      const prod = row?.product as WishlistProduct | undefined;
      if (!prod?.id) {
        toast.error("Invalid product.");
        return;
      }

      if (prod.product_variant?.length) {
        toast.message("Almost there", {
          description:
            "This product has options like size or color. Open it to choose, then add from the product page.",
          action: {
            label: "Open product",
            onClick: () => router.push(`/product/${prod.slug}`),
          },
        });
        return;
      }

      const ss = prod.stock_status as
        | { tracks_inventory?: boolean; is_out_of_stock?: boolean }
        | undefined;
      if (
        ss?.tracks_inventory &&
        ss?.is_out_of_stock
      ) {
        toast.error("This item is out of stock.");
        return;
      }
      const count = prod.countInStock;
      if (typeof count === "number" && count <= 0) {
        toast.error("This item is out of stock.");
        return;
      }

      try {
        if (isAuthenticated) {
          const res = await dispatch(
            addToCarts({
              items: [{ qty: 1, product: prod.id }],
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
            (item) => item.product?.id === prod.id && !item.variant
          );

          if (existingItemIndex >= 0) {
            cartItems[existingItemIndex].qty += 1;
          } else {
            cartItems.push({
              qty: 1,
              product: prod as unknown as Product,
            });
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
      }
    },
    [dispatch, isAuthenticated, router]
  );

  const metaTitle = "My wishlist | Hawola";

  return (
    <AuthLayout>
      <Head>
        <title>{metaTitle}</title>
        <meta
          name="description"
          content="Stuff you have saved for later. Jump back in anytime."
        />
      </Head>

      <div className="min-h-[60vh] max-md:bg-slate-100">
        <div className="mx-auto w-full max-w-screen-xl max-md:px-3 max-md:py-5 md:px-6 md:py-10 xl:px-0">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 max-md:mb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-deepOrange">
                For later
              </p>
              <h1 className="mt-1 text-2xl font-bold text-headerBg max-md:text-xl">
                My wishlist
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {showWishlistLoading
                  ? "Hang tight…"
                  : items.length === 0
                    ? "Save things you like from search or a store. They land here."
                    : `${items.length} saved ${items.length === 1 ? "item" : "items"}`}
              </p>
            </div>
            {items.length > 0 && !showWishlistLoading ? (
              <Link
                href="/carts"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-headerBg shadow-sm transition hover:bg-slate-50"
              >
                <ShoppingBagIcon className="h-5 w-5 text-primary" />
                View cart
              </Link>
            ) : null}
          </div>

          {showWishlistLoading ? (
            <WishlistLoadingSkeleton />
          ) : items.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm max-md:rounded-3xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 ring-8 ring-rose-100/60">
                <HeartIcon className="h-8 w-8 text-rose-400" aria-hidden />
              </div>
              <h2 className="mt-6 text-lg font-semibold text-headerBg">
                Nothing saved yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                Spot something you want to keep? Tap the heart on a product. It stays
                here until you add it to your cart or delete it.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/search"
                  className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Browse products
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Shop categories
                </Link>
              </div>
            </div>
          ) : (
            <ul className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((row) => {
                const p = row.product as WishlistProduct;
                const img = featuredImageCardUrl(p?.featured_image?.[0]);
                const href = p?.slug ? `/product/${p.slug}` : "#";
                const contactOnly = isContactMerchantOnlyProduct(p);
                const hasDiscount =
                  p?.discount_price != null &&
                  String(p.discount_price).trim() !== "" &&
                  String(p.discount_price) !== String(p?.price ?? "");
                const pct = hasDiscount
                  ? discountPercentBadge(p.price, p.discount_price)
                  : null;

                const isBusyDeleting = deletingId === row.id;
                const isBusyAdding =
                  typeof p?.id === "number" &&
                  addToCartPendingProductId === p.id;
                const productForCompare = p as unknown as Product;

                return (
                  <li
                    key={row.id}
                    className="relative flex overflow-hidden border border-[#dde4f0] bg-white pb-2 pt-3 pl-3 pr-3"
                  >
                    <Link
                      href={href}
                      className="relative shrink-0 self-start"
                      aria-label={`View ${p?.name ?? "product"}`}
                    >
                      {pct != null && pct > 0 ? (
                        <span className="absolute -top-2 left-0 rounded bg-orange-500 px-1 py-0.5 text-[10px] font-semibold text-white">
                          -{pct}%
                        </span>
                      ) : null}
                      <img
                        src={img}
                        alt=""
                        className="h-16 w-[4.75rem] object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1 overflow-hidden py-1 pl-3 pr-2">
                      <Link
                        href={href}
                        className="line-clamp-2 text-sm font-semibold text-primary hover:underline"
                      >
                        {p?.name ?? "Product"}
                      </Link>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-xs font-semibold text-gray-800 tabular-nums">
                          {hasDiscount && p.discount_price
                            ? formatCurrency(String(p.discount_price))
                            : formatCurrency(String(p?.price ?? 0))}
                        </span>
                        {hasDiscount && p.price ? (
                          <span className="text-xs tabular-nums text-textPadded line-through">
                            {formatCurrency(String(p.price))}
                          </span>
                        ) : null}
                      </div>

                      {row.created_at ? (
                        <p className="mt-0.5 text-[10px] font-medium text-textPadded">
                          Saved {moment(row.created_at).format("MMM D, YYYY")}
                        </p>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2">
                        {contactOnly ? (
                          <span className="text-[11px] text-gray-500">—</span>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusyAdding}
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(row);
                            }}
                            className={`inline-flex items-center gap-1 rounded-md border border-primary/30 bg-white px-2 py-1 text-[11px] font-semibold transition ${
                              isBusyAdding
                                ? "cursor-wait opacity-70"
                                : "text-primary hover:bg-primary/10"
                            }`}
                          >
                            {isBusyAdding ? (
                              <InlineButtonSpinner className="h-3 w-3 text-primary" />
                            ) : (
                              <ShoppingCartIcon className="h-3.5 w-3.5" aria-hidden />
                            )}
                            Cart
                          </button>
                        )}

                        <AddToCompareButton
                          variant="icon"
                          product={productForCompare}
                          className="shrink-0"
                        />

                        <button
                          type="button"
                          disabled={isBusyDeleting || !p?.id}
                          onClick={(e) => {
                            e.preventDefault();
                            if (p?.id) handleDeleteWishlist(row.id, p.id);
                          }}
                          className={`inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold transition ${
                            isBusyDeleting
                              ? "cursor-wait opacity-60"
                              : "text-red-700 hover:border-red-200 hover:bg-red-50"
                          }`}
                          aria-label="Remove from wishlist"
                        >
                          {isBusyDeleting ? (
                            <InlineButtonSpinner className="h-3 w-3 text-red-600" />
                          ) : (
                            <TrashIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && !showWishlistLoading ? (
            <div className="mt-10 border-t border-slate-200 pt-8 text-center">
              <Link
                href="/search"
                className="text-sm font-semibold text-primary underline-offset-4 hover:text-deepOrange hover:underline"
              >
                Keep browsing
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </AuthLayout>
  );
}
