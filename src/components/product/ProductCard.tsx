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
      {isList ? (
        <>
          <AddToCompareButton
            product={product}
            className="absolute top-3 left-3 z-20"
            accent="light"
            tooltipPlacement="bottom"
          />
          {isPromoted && (
            <span className="absolute top-3 right-3 z-20 text-[10px] flex items-center justify-center bg-yellow-500 w-16 h-4 rounded-full text-white font-semibold">
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
            className="flex items-center gap-4 p-4"
          >
            <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-md bg-slate-100">
              <img
                src={featuredImageCardUrl(product.featured_image?.[0])}
                alt={product.name}
                loading={deferImage ? "lazy" : "eager"}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="line-clamp-1 text-[10px] font-semibold text-textPadded">
                {product.merchant?.store_name}
              </h3>
              <h3 className="text-xs font-semibold leading-tight text-primary break-words line-clamp-2">
                {formatProductCardTitle(product.name)}
              </h3>
              <div className="mt-1 border-t border-[#dde4f0] pt-2 flex flex-col gap-0.5">
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
        </>
      ) : (
        <>
          <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-slate-100 sm:aspect-square">
            <AddToCompareButton
              product={product}
              className="absolute top-2.5 left-2.5 z-20"
              accent="light"
              tooltipPlacement="bottom"
            />
            {isPromoted && (
              <span className="absolute top-2.5 right-2.5 z-20 text-[10px] flex items-center justify-center bg-yellow-500 w-16 h-4 rounded-full text-white font-semibold">
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
              className="absolute inset-0 block"
              aria-label={product.name}
            >
              <img
                src={featuredImageCardUrl(product.featured_image?.[0])}
                alt={product.name}
                loading={deferImage ? "lazy" : "eager"}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
              />
            </Link>
          </div>

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
            className="flex min-h-0 flex-1 flex-col gap-1 p-4"
          >
            <h3 className="line-clamp-1 text-[10px] font-semibold text-textPadded">
              {product.merchant?.store_name}
            </h3>
            <h3 className="min-h-0 text-xs font-semibold leading-tight text-primary break-words line-clamp-2">
              {formatProductCardTitle(product.name)}
            </h3>
            <div className="mt-2 shrink-0 border-t border-[#dde4f0] pt-2 flex flex-col gap-0.5">
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
          </Link>
        </>
      )}
    </div>
  );
}

export default ProductCard;
