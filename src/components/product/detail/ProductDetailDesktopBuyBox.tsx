import React from "react";
import {
  HeartIcon,
  ShareIcon,
  ShieldCheckIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { formatCurrency } from "@/util";
import type { ProductByIdResponse, StockStatusPayload } from "@/types/product";
import MerchantStoreLink from "@/components/merchant/MerchantStoreLink";
import { MerchantLogoOrInitial } from "@/components/merchant/MerchantLogoOrInitial";
import AddToCompareButton from "@/components/compare/AddToCompareButton";
import InlineButtonSpinner from "@/components/ui/InlineButtonSpinner";
import ProductDetailShippingLines from "@/components/product/detail/ProductDetailShippingLines";

type Props = {
  displayName: string;
  product: ProductByIdResponse;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  selectedVariants: Record<number, number>;
  onVariantSelect: (variantId: number, valueId: number) => void;
  inventoryUnavailable: boolean;
  inventoryLow: boolean;
  stockStatus?: StockStatusPayload | null;
  merchantCollectsNoticeSafe: string;
  siteSettings: Record<string, unknown> | null;
  hasOutsideVicinityShippingCost: boolean;
  outsideVicinityShippingCost: string | number | null | undefined;
  hasOutsideStateShippingCost: boolean;
  outsideStateShippingCost: string | number | null | undefined;
  onWishList: () => void;
  addToWishlistPendingProductId: number | null;
  onAddToCart: () => void;
  addToCartPendingProductId: number | null;
  onShare: (platform: string) => void;
  onCopyLink: () => void;
};

export default function ProductDetailDesktopBuyBox({
  displayName,
  product,
  quantity,
  onQuantityChange,
  selectedVariants,
  onVariantSelect,
  inventoryUnavailable,
  inventoryLow,
  stockStatus,
  merchantCollectsNoticeSafe,
  siteSettings,
  hasOutsideVicinityShippingCost,
  outsideVicinityShippingCost,
  hasOutsideStateShippingCost,
  outsideStateShippingCost,
  onWishList,
  addToWishlistPendingProductId,
  onAddToCart,
  addToCartPendingProductId,
  onShare,
  onCopyLink,
}: Props) {
  const p = product?.product;
  const merchantSlug = p?.merchant?.slug ?? "";
  const storeName = p?.merchant?.store_name ?? "Merchant";
  const wishlistBusy = addToWishlistPendingProductId === p?.id;
  const cartBusy =
    typeof p?.id === "number" && addToCartPendingProductId === p.id;

  const price = p?.price;
  const discountPrice = p?.discount_price;
  const showDiscount =
    price && discountPrice && Number(price) > Number(discountPrice);
  const discountPct = showDiscount
    ? Math.round(
        ((Number(price) - Number(discountPrice)) / (Number(price) || 1)) * 100
      )
    : 0;

  const showPaymentBadge =
    p?.accept_payment_on_delivery ||
    !(siteSettings != null && siteSettings.accept_escrow_payment === false);

  const productCondition = (p as { product_condition?: string } | undefined)
    ?.product_condition;

  return (
    <div className="hidden space-y-5 lg:block">
      <div>
        <h1 className="text-[1.75rem] font-bold leading-tight text-slate-900 capitalize xl:text-[2rem]">
          {displayName}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {merchantSlug ? (
            <MerchantStoreLink
              slug={merchantSlug}
              className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <MerchantLogoOrInitial
                logoThumbnailUrl={p?.merchant?.logo_thumbnail}
                logoUrl={p?.merchant?.logo}
                storeName={storeName}
                primaryColor={p?.merchant?.primary_color}
                alt=""
                className="h-6 w-6 shrink-0 overflow-hidden rounded-full"
                imgClassName="h-full w-full object-cover rounded-full"
                fallbackTextClassName="text-[9px] font-bold leading-none"
              />
              <span className="truncate">Sold by {storeName}</span>
            </MerchantStoreLink>
          ) : null}
          <span className="text-sm text-slate-500">
            {p?.numReviews ?? 0} review{(p?.numReviews ?? 0) === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f4d] via-[#152d5c] to-[#1e3a7a] p-5 shadow-[0_10px_40px_rgba(11,31,77,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
          Your price
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
          <p className="text-[2.5rem] font-extrabold leading-none tracking-tight text-white xl:text-[2.75rem]">
            {formatCurrency(discountPrice ?? price ?? "")}
          </p>
          {showDiscount ? (
            <>
              <span className="pb-1 text-lg font-medium text-white/55 line-through">
                {formatCurrency(price)}
              </span>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
                Save {discountPct}%
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void onWishList()}
          disabled={wishlistBusy}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          {wishlistBusy ? (
            <InlineButtonSpinner className="h-4 w-4 text-rose-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-rose-500" aria-hidden />
          )}
          Wishlist
        </button>
        {p ? <AddToCompareButton product={p} variant="inline" /> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {productCondition ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3">
            <ShieldCheckIcon className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
            <span className="text-sm font-semibold text-blue-800">
              Condition: {productCondition}
            </span>
          </div>
        ) : null}

        {showPaymentBadge ? (
          <div
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
              p?.accept_payment_on_delivery
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            <TagIcon className="h-5 w-5 shrink-0" aria-hidden />
            {p?.accept_payment_on_delivery
              ? "Payment on delivery available"
              : "Online payment only"}
          </div>
        ) : null}
      </div>

      {inventoryUnavailable && stockStatus?.tracks_inventory ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">
          <p className="font-semibold">Currently out of stock</p>
          <p className="mt-1 leading-relaxed text-rose-800/90">
            This listing is not available for purchase right now.
          </p>
        </div>
      ) : null}

      {!inventoryUnavailable && inventoryLow && stockStatus?.tracks_inventory ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
          Limited stock — order soon at this price.
        </div>
      ) : null}

      {merchantCollectsNoticeSafe ? (
        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50/95 p-4 text-sm text-amber-950 prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: merchantCollectsNoticeSafe }}
        />
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-slate-800">
          Shipping information
        </p>
        <ProductDetailShippingLines
          product={product}
          hasOutsideVicinityShippingCost={hasOutsideVicinityShippingCost}
          outsideVicinityShippingCost={outsideVicinityShippingCost}
          hasOutsideStateShippingCost={hasOutsideStateShippingCost}
          outsideStateShippingCost={outsideStateShippingCost}
        />
      </div>

      {product?.product_variant?.length > 0 ? (
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          {product.product_variant.map((variantGroup) => (
            <div key={variantGroup.variant.id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {variantGroup.variant.name}
                <span className="ml-2 normal-case text-primary">
                  {variantGroup.value.find(
                    (v: { id: number }) =>
                      v.id === selectedVariants[variantGroup.variant.id]
                  )?.value || `Select ${variantGroup.variant.name}`}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variantGroup.value.map(
                  (variantValue: {
                    id: number;
                    countInStock: number;
                    value: React.ReactNode;
                  }) => (
                    <button
                      key={variantValue.id}
                      type="button"
                      onClick={() =>
                        onVariantSelect(
                          variantGroup.variant.id,
                          variantValue.id
                        )
                      }
                      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                        selectedVariants[variantGroup.variant.id] ===
                        variantValue.id
                          ? "bg-primary text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-primary/30"
                      } ${
                        variantValue.countInStock <= 0
                          ? "cursor-not-allowed opacity-45"
                          : ""
                      }`}
                      disabled={variantValue.countInStock <= 0}
                    >
                      {variantValue.value}
                      {variantValue.countInStock <= 0 ? " (Out of stock)" : ""}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${inventoryUnavailable ? "opacity-60" : ""}`}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Purchase
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => onQuantityChange(-1)}
              className="flex h-11 w-11 items-center justify-center text-xl font-medium text-primary"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[2.5rem] text-center text-lg font-bold text-primary">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(1)}
              className="flex h-11 w-11 items-center justify-center text-xl font-medium text-primary"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={inventoryUnavailable || cartBusy}
            onClick={onAddToCart}
            className={`inline-flex min-h-[46px] min-w-[160px] flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition sm:flex-none ${
              inventoryUnavailable || cartBusy
                ? "cursor-not-allowed border-2 border-primary/15 text-primary/50"
                : "border-2 border-primary/30 bg-white text-primary hover:bg-primary/5"
            }`}
          >
            {cartBusy ? (
              <InlineButtonSpinner className="h-4 w-4 text-primary" />
            ) : null}
            {cartBusy ? "Adding…" : "Add to cart"}
          </button>
          <button
            type="button"
            disabled={inventoryUnavailable || cartBusy}
            onClick={onAddToCart}
            className={`inline-flex min-h-[46px] min-w-[160px] flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition sm:flex-none ${
              inventoryUnavailable || cartBusy
                ? "cursor-not-allowed bg-primary/35 text-white"
                : "bg-primary text-white shadow-sm hover:bg-primary/90"
            }`}
          >
            {cartBusy ? (
              <InlineButtonSpinner className="h-4 w-4 text-white" />
            ) : null}
            {cartBusy ? "Adding…" : "Buy now"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <ShareIcon className="h-4 w-4 text-primary" aria-hidden />
          Share
        </span>
        <button
          type="button"
          onClick={() => onShare("facebook")}
          className="rounded-lg bg-primary p-2 transition hover:opacity-90"
          title="Share on Facebook"
        >
          <FaFacebookF className="text-sm text-white" />
        </button>
        <button
          type="button"
          onClick={() => onShare("linkedin")}
          className="rounded-full bg-primary p-2 transition hover:opacity-90"
          title="Share on LinkedIn"
        >
          <FaLinkedinIn className="text-sm text-white" />
        </button>
        <button
          type="button"
          onClick={() => onShare("twitter")}
          className="rounded-lg p-1 transition hover:opacity-80"
          title="Share on Twitter"
        >
          <FaTwitter className="text-lg text-primary" />
        </button>
        <button
          type="button"
          onClick={() => onShare("whatsapp")}
          className="rounded-md bg-[#25D366] p-2 transition hover:opacity-90"
          title="Share on WhatsApp"
        >
          <FaWhatsapp className="text-sm text-white" />
        </button>
        <button
          type="button"
          onClick={onCopyLink}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-slate-50"
        >
          Copy link
        </button>
      </div>
    </div>
  );
}
