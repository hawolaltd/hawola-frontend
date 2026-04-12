import React, { useMemo } from "react";
import Link from "next/link";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import MerchantRichHtml from "@/components/merchant/MerchantRichHtml";
import type { Merchant, ProductByIdResponse } from "@/types/product";

interface MerchantAboutProps {
  product: ProductByIdResponse;
}

function normalizeHex(color: string | null | undefined, fallback = "#0f172a"): string {
  if (!color || typeof color !== "string") return fallback;
  const c = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/i.test(c)) return c;
  if (/^#[0-9A-Fa-f]{3}$/i.test(c)) {
    const r = c[1],
      g = c[2],
      b = c[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

/** Relative luminance 0–1; used to pick readable text on brand buttons. */
function isLightBrand(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const [R, G, B] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * R + 0.7152 * G + 0.0722 * B > 0.62;
}

function mergeMerchant(product: ProductByIdResponse): Merchant | null {
  const mini = product?.product?.merchant;
  if (!mini) return null;
  const full = product.merchant;
  return { ...(full ?? {}), ...mini } as Merchant;
}

function MerchantAbout({ product }: MerchantAboutProps) {
  const merchant = useMemo(() => mergeMerchant(product), [product]);
  const brand = normalizeHex(merchant?.primary_color);
  const brandMuted = `${brand}14`;
  const onBrandClass = isLightBrand(brand) ? "text-slate-900" : "text-white";

  const storeName = merchant?.store_name?.trim() || product?.product?.user || "Store";
  const slug = merchant?.slug;
  const about = merchant?.about?.trim();
  const locationLine = [merchant?.location?.name, merchant?.state?.name].filter(Boolean).join(" · ");

  if (!merchant) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center text-sm text-slate-500">
        Store information is not available for this product.
      </div>
    );
  }

  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.06)] ring-1 ring-slate-950/5"
      style={
        {
          ["--merchant-brand" as string]: brand,
          ["--merchant-brand-muted" as string]: brandMuted,
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-[280px] flex-col sm:flex-row">
        {/* Brand strip — full-height accent */}
        <div
          className="h-2 w-full shrink-0 sm:h-auto sm:w-2 sm:min-h-full"
          style={{
            background: `linear-gradient(135deg, ${brand} 0%, ${brand}cc 48%, ${brand}99 100%)`,
          }}
          aria-hidden
        />

        <div className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8">
          {/* Hero */}
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-100 p-5 sm:p-6"
            style={{
              background: `linear-gradient(135deg, ${brandMuted} 0%, #ffffff 42%, #f8fafc 100%)`,
            }}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className="relative shrink-0 rounded-2xl p-1 shadow-md ring-2 ring-white"
                  style={{ boxShadow: `0 0 0 1px ${brand}33` }}
                >
                  <img
                    src={merchant.logo_thumbnail || merchant.logo || "/imgs/page/homepage1/user-1.png"}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Official store</p>
                  <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{storeName}</h2>
                  {locationLine ? (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate">{locationLine}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {slug ? (
                <Link
                  href={`/merchants/${slug}`}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition hover:opacity-95 hover:shadow-md ${onBrandClass}`}
                  style={{ backgroundColor: brand }}
                >
                  <BuildingStorefrontIcon className="h-5 w-5" aria-hidden />
                  Visit store
                </Link>
              ) : null}
            </div>
          </div>

          {/* Contact cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {merchant.store_address ? (
              <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-slate-50">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: brandMuted, color: brand }}
                >
                  <MapPinIcon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Address</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-800">{merchant.store_address}</p>
                </div>
              </div>
            ) : null}

            {merchant.support_phone_number ? (
              <a
                href={`tel:${merchant.support_phone_number}`}
                className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: brandMuted, color: brand }}
                >
                  <PhoneIcon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Contact seller</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">{merchant.support_phone_number}</p>
                </div>
              </a>
            ) : null}

            {merchant.support_email ? (
              <a
                href={`mailto:${merchant.support_email}`}
                className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-slate-50 sm:col-span-2"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: brandMuted, color: brand }}
                >
                  <EnvelopeIcon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{merchant.support_email}</p>
                </div>
              </a>
            ) : null}
          </div>

          {/* Stats */}
          {(merchant.merchant_level?.name != null || merchant.shipping_number_of_days != null) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {merchant.merchant_level?.name ? (
                <div
                  className="rounded-xl border border-slate-100 bg-white px-4 py-4 sm:px-5"
                  style={{ borderLeftWidth: 4, borderLeftColor: brand }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Merchant level</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{merchant.merchant_level.name}</p>
                </div>
              ) : null}
              {merchant.shipping_number_of_days != null ? (
                <div
                  className="rounded-xl border border-slate-100 bg-white px-4 py-4 sm:px-5"
                  style={{ borderLeftWidth: 4, borderLeftColor: brand }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Typical delivery</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {merchant.shipping_number_of_days}{" "}
                    {Number(merchant.shipping_number_of_days) === 1 ? "day" : "days"}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* About */}
          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" aria-hidden />
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">About this seller</h3>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" aria-hidden />
            </div>
            {about ? (
              <div className="prose prose-slate prose-p:leading-relaxed prose-headings:text-slate-900 max-w-none text-slate-700">
                <MerchantRichHtml html={about} />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-slate-500">
                This seller has not added a public bio yet. Visit their store to see products and policies.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantAbout;
