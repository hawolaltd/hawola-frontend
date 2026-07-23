import React, { useState } from "react";
import {
  ChevronDownIcon,
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
import type { ProductByIdResponse } from "@/types/product";
import type { StockStatusPayload } from "@/types/product";
import MerchantStoreLink from "@/components/merchant/MerchantStoreLink";
import { MerchantLogoOrInitial } from "@/components/merchant/MerchantLogoOrInitial";
import AddToCompareButton from "@/components/compare/AddToCompareButton";
import InlineButtonSpinner from "@/components/ui/InlineButtonSpinner";
import ProductDetailShippingLines from "@/components/product/detail/ProductDetailShippingLines";

type Props = {
  displayName: string;
  product: ProductByIdResponse;
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
  onShare: (platform: string) => void;
  onCopyLink: () => void;
};

export default function ProductDetailMobileBuyBox({
  displayName,
  product,
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
  onShare,
  onCopyLink,
}: Props) {
  const [shippingOpen, setShippingOpen] = useState(true);
  const p = product?.product;
  const merchantSlug = p?.merchant?.slug ?? "";
  const storeName = p?.merchant?.store_name ?? "Merchant";
  const wishlistBusy = addToWishlistPendingProductId === p?.id;

  const price = p?.price;
  const discountPrice = p?.discount_price;
  const showDiscount =
    price &&
    discountPrice &&
    Number(price) > Number(discountPrice);
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
    <div className="space-y-4 border-t border-slate-100 pt-4 lg:hidden">
      <h1 className="text-[1.35rem] font-bold leading-snug text-slate-900 capitalize">
        {displayName}
      </h1>

      <div className="flex flex-wrap items-center gap-2">
        {merchantSlug ? (
          <MerchantStoreLink
            slug={merchantSlug}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <MerchantLogoOrInitial
              logoThumbnailUrl={p?.merchant?.logo_thumbnail}
              logoUrl={p?.merchant?.logo}
              storeName={storeName}
              primaryColor={p?.merchant?.primary_color}
              alt=""
              className="h-5 w-5 shrink-0 overflow-hidden rounded-full"
              imgClassName="h-full w-full object-cover rounded-full"
              fallbackTextClassName="text-[8px] font-bold leading-none"
            />
            <span className="truncate">Sold by {storeName}</span>
          </MerchantStoreLink>
        ) : null}
        <span className="text-xs text-slate-500">
          {p?.numReviews ?? 0} review{(p?.numReviews ?? 0) === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f4d] via-[#152d5c] to-[#1e3a7a] p-4 shadow-[0_8px_30px_rgba(11,31,77,0.25)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
          Price
        </p>
        <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="text-[2rem] font-extrabold leading-none tracking-tight text-white">
            {formatCurrency(discountPrice ?? price ?? "")}
          </p>
          {showDiscount ? (
            <>
              <span className="pb-0.5 text-sm font-medium text-white/55 line-through">
                {formatCurrency(price)}
              </span>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-bold text-emerald-100">
                {discountPct}% off
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onWishList()}
          disabled={wishlistBusy}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          {wishlistBusy ? (
            <InlineButtonSpinner className="h-3.5 w-3.5 text-rose-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-rose-500" aria-hidden />
          )}
          Wishlist
        </button>
        {p ? <AddToCompareButton product={p} variant="inline" /> : null}
      </div>

      {productCondition ? (
        <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2.5">
          <ShieldCheckIcon className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
          <span className="text-xs font-semibold text-blue-800">
            Condition: {productCondition}
          </span>
        </div>
      ) : null}

      {inventoryUnavailable && stockStatus?.tracks_inventory ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-900">
          <p className="font-semibold">Out of stock</p>
          <p className="mt-1 text-xs leading-relaxed text-rose-800/90">
            This item is not available to purchase right now.
          </p>
        </div>
      ) : null}

      {!inventoryUnavailable && inventoryLow && stockStatus?.tracks_inventory ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-950">
          Limited stock — order soon.
        </div>
      ) : null}

      {merchantCollectsNoticeSafe ? (
        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50/95 p-3 text-xs text-amber-950 prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: merchantCollectsNoticeSafe }}
        />
      ) : null}

      {showPaymentBadge ? (
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium ${
            p?.accept_payment_on_delivery
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <TagIcon className="h-4 w-4 shrink-0" aria-hidden />
          {p?.accept_payment_on_delivery
            ? "Payment on delivery available"
            : "Online payment only"}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setShippingOpen((open) => !open)}
          className="flex w-full items-center justify-between px-3.5 py-3 text-left"
          aria-expanded={shippingOpen}
        >
          <span className="text-sm font-semibold text-slate-800">
            Shipping information
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-slate-400 transition-transform ${shippingOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {shippingOpen ? (
          <div className="border-t border-slate-100 px-3.5 pb-3.5 pt-2">
            <ProductDetailShippingLines
              product={product}
              hasOutsideVicinityShippingCost={hasOutsideVicinityShippingCost}
              outsideVicinityShippingCost={outsideVicinityShippingCost}
              hasOutsideStateShippingCost={hasOutsideStateShippingCost}
              outsideStateShippingCost={outsideStateShippingCost}
              compact
            />
          </div>
        ) : null}
      </div>

      {product?.product_variant?.length > 0 ? (
        <div className="space-y-3">
          {product.product_variant.map((variantGroup) => (
            <div key={variantGroup.variant.id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {variantGroup.variant.name}
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
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        selectedVariants[variantGroup.variant.id] ===
                        variantValue.id
                          ? "bg-primary text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      } ${
                        variantValue.countInStock <= 0
                          ? "cursor-not-allowed opacity-45"
                          : ""
                      }`}
                      disabled={variantValue.countInStock <= 0}
                    >
                      {variantValue.value}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
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
