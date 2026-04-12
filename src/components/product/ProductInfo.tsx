import React, { useMemo, useState } from "react";
import Specification from "@/components/product/Specification";
import Description from "@/components/product/Description";
import AdditionalInformation from "@/components/product/AdditionalInformation";
import CustomerReviews from "@/components/product/CustomerReviews";
import type { ProductByIdResponse } from "@/types/product";
import MerchantAbout from "@/components/product/MerchantAbout";
import { useAppSelector } from "@/hook/useReduxTypes";

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

function ProductInfo({ product }: { product: ProductByIdResponse }) {
    const [tab, setTab] = useState("description");
    const [showMore, setShowMore] = useState(false);

    const { merchantReviews } = useAppSelector((state) => state.products);
    const reviews = merchantReviews?.results || [];

    const brand = useMemo(
        () => normalizeHex(product?.product?.merchant?.primary_color),
        [product?.product?.merchant?.primary_color]
    );

    const productInfoHeaders = [
        {
            title: "Description",
            value: "description"
        },

        // {
        //     title: "Specification",
        //     value: "specification",
        // },

        // {
        //     title: "Additional information",
        //     value: "additionalInfo"
        // },

        {
            title: `Reviews (${reviews.length})`,
            value: "reviews",
        },

        {
            title: "Merchant",
            value: "merchant",
        },
]

    return (
        <div
            className="mt-8 max-w-[1320px] border-b border-b-[#dde4f0] pb-10"
            style={{ ["--tab-brand" as string]: brand } as React.CSSProperties}
        >
            <div
                role="tablist"
                aria-label="Product information"
                className="flex flex-col gap-1 border-b border-slate-200/90 pb-0 sm:flex-row sm:flex-wrap sm:items-end sm:gap-0"
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
                            className={`relative cursor-pointer px-1 py-3 text-left text-sm font-bold transition-colors sm:px-4 sm:py-3.5 md:text-base lg:text-lg ${
                                active ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            {header.title}
                            <span
                                className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full transition-opacity duration-200"
                                style={{
                                    background: "var(--tab-brand)",
                                    opacity: active ? 1 : 0,
                                }}
                            />
                        </button>
                    );
                })}
            </div>

            {tab === "description" && (
                <Description product={product} showMore={showMore} setShowMore={setShowMore}/>
            )}


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