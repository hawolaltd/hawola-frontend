import React, { useEffect, useMemo, useState } from "react";
import Specification from "@/components/product/Specification";
import Description from "@/components/product/Description";
import AdditionalInformation from "@/components/product/AdditionalInformation";
import CustomerReviews from "@/components/product/CustomerReviews";
import ProductReelsSection from "@/components/product/ProductReelsSection";
import type { ProductByIdResponse } from "@/types/product";
import MerchantAbout from "@/components/product/MerchantAbout";
import { useAppSelector } from "@/hook/useReduxTypes";
import { resolveReelPlatform } from "@/components/reels/ReelEmbed";

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

function ProductInfo({
    product,
    embedded = false,
}: {
    product: ProductByIdResponse;
    embedded?: boolean;
}) {
    const { merchantReviews } = useAppSelector((state) => state.products);
    const reviews = merchantReviews?.results || [];

    const hasProductReels = useMemo(() => {
        const reels = product?.product?.product_reels;
        if (!reels?.length) return false;
        return reels.some(
            (r) => (r.video_link || "").trim().length > 0 && resolveReelPlatform(r)
        );
    }, [product?.product?.product_reels]);

    const [tab, setTab] = useState<string>(() => {
        const reels = product?.product?.product_reels;
        if (!reels?.length) return "description";
        return reels.some(
            (r) => (r.video_link || "").trim().length > 0 && resolveReelPlatform(r)
        )
            ? "reels"
            : "description";
    });

    const productId = product?.product?.id;

    useEffect(() => {
        if (productId == null) return;
        const reels = product?.product?.product_reels;
        const has =
            reels?.some(
                (r) => (r.video_link || "").trim().length > 0 && resolveReelPlatform(r)
            ) ?? false;
        setTab(has ? "reels" : "description");
    }, [productId]);

    useEffect(() => {
        if (tab === "reels" && !hasProductReels) setTab("description");
    }, [tab, hasProductReels]);

    const brand = useMemo(
        () => normalizeHex(product?.product?.merchant?.primary_color),
        [product?.product?.merchant?.primary_color]
    );

    const productInfoHeaders = useMemo(() => {
        const rows: { title: string; value: string }[] = [];
        if (hasProductReels) {
            rows.push({ title: "Product Social Reel", value: "reels" });
        }
        rows.push({ title: "Description", value: "description" });
        rows.push({ title: `Reviews (${reviews.length})`, value: "reviews" });
        rows.push({ title: "Merchant", value: "merchant" });
        return rows;
    }, [hasProductReels, reviews.length]);

    return (
        <div
            className={
                embedded
                    ? "mt-2 rounded-2xl bg-[#fbfcff] p-3 sm:p-4"
                    : "mt-8 max-w-[1320px] pb-10"
            }
            style={{ ["--tab-brand" as string]: brand } as React.CSSProperties}
        >
            <div
                role="tablist"
                aria-label="Product information"
                className={
                    embedded
                        ? "flex flex-wrap items-center gap-2 rounded-xl bg-white/90 p-2 shadow-sm"
                        : "flex flex-col gap-1 pb-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-0"
                }
            >
                {productInfoHeaders.map((header, key) => {
                    const active = tab === header.value;
                    return (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={active}
                            key={key}
                            onClick={() => setTab(header.value)}
                            className={
                                embedded
                                    ? `relative cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                                        active
                                            ? "bg-[color:var(--tab-brand)] text-white shadow-sm"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`
                                    : `relative cursor-pointer px-1 py-3 text-left text-sm font-bold transition-colors sm:px-4 sm:py-3.5 md:text-base lg:text-lg ${
                                        active ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                                    }`
                            }
                        >
                            {header.title}
                            {!embedded ? (
                                <span
                                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full transition-opacity duration-200"
                                    style={{
                                        background: "var(--tab-brand)",
                                        opacity: active ? 1 : 0,
                                    }}
                                />
                            ) : null}
                        </button>
                    );
                })}
            </div>

            {tab === "reels" && hasProductReels ? (
                <ProductReelsSection reels={product?.product?.product_reels} />
            ) : null}

            {tab === "description" && <Description product={product} />}


            {tab === "specification" && (
                <Specification
                    specs={[
                        { label: 'Mode', value: '#SK10923' },
                        { label: 'Brand', value: 'Samsung' },
                        { label: 'Size', value: '6.7"' },
                        { label: 'Finish', value: 'Pacific Blue' },
                        { label: 'Origin of Country', value: 'United States' },
                        { label: 'Manufacturer', value: 'USA' },
                        { label: 'Released Year', value: '2022' },
                        { label: 'Warranty', value: 'International' },
                    ]}
                />
            )}


            {tab === "additionalInfo" && (
                <AdditionalInformation
                    specs={[
                        { label: 'Weight', value: '0.240 kg' },
                        { label: 'Dimensions', value: '0.74 x 7.64 x 16.08 cm' },
                    ]}
                />
            )}


            {tab === "reviews" && (
                <CustomerReviews />
            )}

            {tab === "merchant" && (
                <MerchantAbout product={product} />
            )}


        </div>
    );
}


export default ProductInfo;