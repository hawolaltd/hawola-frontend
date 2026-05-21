import React, { useMemo } from "react";
import { ProductByIdResponse } from "@/types/product";
import MerchantOtherItemsCard from "@/components/product/MerchantOtherItemsCard";

interface ProductCardProps {
    product: ProductByIdResponse;
}

const LIMIT = 8;

const RelatedProduct = ({ product }: ProductCardProps) => {
    const sameMerchant = useMemo(() => {
        const raw = product?.merchant_other_products;
        if (!Array.isArray(raw)) return [];
        return raw.filter(Boolean).slice(0, LIMIT);
    }, [product?.merchant_other_products]);

    const fromOthers = useMemo(() => {
        const raw = product?.recommended_products;
        if (!Array.isArray(raw)) return [];
        return raw.filter(Boolean).slice(0, LIMIT);
    }, [product?.recommended_products]);

    if (sameMerchant.length === 0 && fromOthers.length === 0) {
        return null;
    }

    return (
        <section className="w-full flex flex-col gap-8 py-8">
            {sameMerchant.length > 0 ? (
                <div className="w-full flex flex-col gap-4 border-b border-b-detailsBorder pb-8">
                    <div className="mx-auto text-left mb-4 w-full">
                        <div className="flex items-center justify-between gap-8 pt-2">
                            <h2 className="text-2xl font-semibold text-primary">
                                Related products
                            </h2>
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-2 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {sameMerchant.map((p, key) => (
                            <MerchantOtherItemsCard key={p?.id ?? key} product={p} />
                        ))}
                    </div>
                </div>
            ) : null}

            {fromOthers.length > 0 ? (
                <div className="w-full flex flex-col gap-4">
                    <div className="mx-auto text-left mb-4 w-full">
                        <div className="flex items-center justify-between gap-8 pt-2">
                            <h2 className="text-2xl font-semibold text-primary">
                                More from other sellers
                            </h2>
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-2 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {fromOthers.map((p, key) => (
                            <MerchantOtherItemsCard key={p?.id ?? key} product={p} />
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default RelatedProduct;
