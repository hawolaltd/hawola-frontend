import React, { useState } from "react";
import { formatCurrency, featuredImageCardUrl } from "@/util";
import { formatProductCardTitle } from "@/util/formatProductCardTitle";
import { Product, ProductByIdResponse } from "@/types/product";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  addToCarts,
  addToCartsLocal,
  getCarts,
} from "@/redux/product/productSlice";
import Link from "next/link";
import { toast } from "sonner";
import { ProductFull } from "@/types/home";
import { useProductDetailPrefetch } from "@/hooks/useProductDetailPrefetch";
import { saveProductDetailPreview } from "@/lib/pdpPreview";
import AddToCompareButton from "@/components/compare/AddToCompareButton";
import { trackTikTokAddToCart, tikTokIdentityFromProfile } from "@/lib/tiktokPixel";
import { onPromoProductClick, promoProductPath } from "@/lib/promoAnalytics";
import { addToCartErrorMessage } from "@/lib/addToCartFeedback";
import { addToCartAsGuest } from "@/lib/guestCartClient";
function ProductCard({
  product,
  margin,
  viewMode,
  isPromoted,
  deferImage = false,
  promoSlug,
}: {
  product: ProductFull;
  margin?: string;
  viewMode?: "grid" | "list";
  isPromoted?: boolean;
  /** Lazy-load product thumbnail (promo grids, below-fold lists). */
  deferImage?: boolean;
  /** When set, product links carry promo attribution for funnel analytics. */
  promoSlug?: string;
}) {
  const [quantity, setQuantity] = useState(1);

  // State for selected variants
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, number>
  >({});

  const { isAuthenticated, profile: authProfile } = useAppSelector((state) => state.auth);
  const tikTokIdentity = tikTokIdentityFromProfile(authProfile);
  const { localCart } = useAppSelector((state) => state.products);

  const dispatch = useAppDispatch();
  const prefetchHandlers = useProductDetailPrefetch(product?.slug);

  const hasDiscount =
    product?.discount_price != null &&
    product?.price != null &&
    String(product.discount_price).trim() !== "" &&
    String(product.discount_price) !== String(product.price);
  const isList = viewMode === "list";
  const handleAddToCart = async (product: Product) => {
    try {
      // Convert selected variants to the format expected by backend
      const variants =
        product?.product_variant?.length > 0
          ? Object.entries(selectedVariants).map(
              ([variantId, variantValueId]) => ({
                variant: Number(variantId),
                variant_value: variantValueId,
              })
            )
          : undefined;

      if (isAuthenticated) {
        const res = await dispatch(
          addToCarts({
            items: [
              {
                qty: quantity,
                product: product?.id,
                ...(variants && { variant: variants }),
                ...(promoSlug ? { promo_slug: promoSlug } : {}),
              },
            ],
          })
        );

        if (addToCarts.fulfilled.match(res)) {
          dispatch(getCarts());
          trackTikTokAddToCart(
            {
              id: product?.id,
              name: product?.name,
              price: product?.price,
              discount_price: product?.discount_price,
              qty: quantity,
            },
            tikTokIdentity
          );
          toast.success("Added to cart");
        } else if (addToCarts.rejected.match(res)) {
          toast.error(addToCartErrorMessage(res.payload));
        } else {
          toast.error(addToCartErrorMessage(null));
        }
      } else {
        const guestResult = await addToCartAsGuest(dispatch, {
          product,
          qty: quantity,
          variants,
          promoSlug,
        });

        if (!guestResult.ok) {
          toast.error("Could not add to cart. Try opening in Safari or Chrome.");
          return;
        }

        toast.success("Added to cart");
        if (guestResult.warning) {
          toast.warning(guestResult.warning, { duration: 6000 });
        } else if (guestResult.source === "local") {
          toast.warning(
            "Saved on this device only — open in Safari or Chrome to keep your cart.",
            { duration: 5000 }
          );
        }
      }
    } catch (e) {
      console.error("Error adding to cart:", e);
      toast.error(addToCartErrorMessage(e, "Failed to add to cart."));
    }
  };

  return (
    <div
      className={`relative bg-white border cursor-pointer ${
        margin ? margin : ""
      } border-solid border-[#D5DFE4] rounded-lg overflow-hidden ${
        isList ? "" : "flex h-full flex-col"
      }`}
    >
      <AddToCompareButton product={product} className="absolute top-3 left-3" />

      {isPromoted && (
        <span className="absolute top-3 right-3 z-10 text-[10px] flex items-center justify-center bg-yellow-500 w-16 h-4 rounded-full text-white font-semibold">
          Promoted
        </span>
      )}

      <Link
        href={
          promoSlug && product?.slug
            ? promoProductPath(product.slug, promoSlug)
            : `/product/${product?.slug}`
        }
        prefetch
        onMouseEnter={prefetchHandlers.onMouseEnter}
        onMouseLeave={prefetchHandlers.onMouseLeave}
        onFocus={prefetchHandlers.onFocus}
        onTouchStart={prefetchHandlers.onTouchStart}
        onClick={() => {
          saveProductDetailPreview(product);
          if (promoSlug && product?.id) {
            onPromoProductClick(promoSlug, product.id);
          }
        }}
        className={
          isList
            ? "flex items-center gap-4 p-4"
            : "flex min-h-0 flex-1 flex-col gap-3 p-4"
        }
      >
        <div
          className={
            isList
              ? "flex w-full items-center justify-center"
              : "flex h-[150px] w-full shrink-0 items-center justify-center"
          }
        >
          <img
            src={featuredImageCardUrl(product.featured_image?.[0])}
            alt={product.name}
            loading={deferImage ? "lazy" : "eager"}
            decoding="async"
            style={{
              height: "150px",
            }}
          />
        </div>
        <div
          className={
            isList
              ? "flex flex-col gap-1.5"
              : "flex min-h-0 flex-1 flex-col gap-1"
          }
        >
          <h3 className="line-clamp-1 text-[10px] font-semibold text-textPadded">
            {product.merchant?.store_name}
          </h3>
          <h3
            className={`text-xs font-semibold leading-tight text-primary break-words line-clamp-2 ${
              isList ? "" : "min-h-0"
            }`}
          >
            {formatProductCardTitle(product.name)}
          </h3>
          {/* Ratings hidden on product cards (per product policy)
          <div className={"flex items-center gap-1"}>
            {Array.from({
              length: Math.min(5, Math.max(0, Math.round(Number(product?.rating) || 0))),
            }).map((_, key) => (
              <svg
                className={"w-4 h-4"}
                key={key}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m0 0h24v24h-24z"
                  fill="#fff"
                  opacity="0"
                  transform="matrix(0 1 -1 0 24 0)"
                />
                <path
                  d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                  fill="#FFB067"
                />
              </svg>
            ))}
            <span className={"text-[10px] text-textPadded font-normal"}>
              {product?.numReviews}
            </span>
          </div>
          */}
          <div
            className={`border-t border-[#dde4f0] pt-2 flex flex-col gap-0.5 ${
              isList ? "mt-1" : "mt-2 shrink-0"
            }`}
          >
            {hasDiscount ? (
              <>
                <p className="text-lg font-bold text-primary leading-tight">
                  {formatCurrency(product.discount_price)}
                </p>
                <p className="text-xs text-textPadded line-through leading-tight">
                  {formatCurrency(product.price)}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-primary leading-tight">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
