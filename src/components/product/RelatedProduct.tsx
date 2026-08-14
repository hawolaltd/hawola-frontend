import React, { useMemo } from "react";
import { ProductByIdResponse } from "@/types/product";
import CompactProductTile from "@/components/product/CompactProductTile";

interface ProductCardProps {
  product: ProductByIdResponse;
}

const RELATED_LIMIT = 12;
const OTHER_SELLERS_LIMIT = 12;

const RelatedProduct = ({ product }: ProductCardProps) => {
  const merchantName =
    product?.merchant?.store_name ||
    product?.product?.merchant?.store_name ||
    "this store";

  const sameMerchant = useMemo(() => {
    const raw = product?.merchant_other_products;
    if (!Array.isArray(raw)) return [];
    return raw.filter(Boolean).slice(0, RELATED_LIMIT);
  }, [product?.merchant_other_products]);

  const fromOthers = useMemo(() => {
    const raw = product?.recommended_products;
    if (!Array.isArray(raw)) return [];
    return raw.filter(Boolean).slice(0, OTHER_SELLERS_LIMIT);
  }, [product?.recommended_products]);

  if (sameMerchant.length === 0 && fromOthers.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col">
      {sameMerchant.length > 0 ? (
        <section
          className="-mx-3 px-3 py-10 sm:-mx-4 sm:px-4 sm:py-12 lg:mx-0 lg:rounded-2xl lg:px-6"
          style={{
            background:
              "radial-gradient(900px 320px at 15% 0%, rgba(254,150,54,0.16), transparent 55%), linear-gradient(165deg, #0B1B33 0%, #132A4A 55%, #0F1F38 100%)",
            color: "#f8fafc",
          }}
        >
          <div className="mb-5">
            <p
              className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "rgba(253, 186, 116, 0.95)" }}
            >
              More Products from
            </p>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: "#ffffff" }}>
              {merchantName}
            </h2>
          </div>
          <div className="grid w-full grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-6">
            {sameMerchant.map((p, key) => (
              <CompactProductTile
                key={p?.id ?? key}
                product={p}
                tone="dark"
              />
            ))}
          </div>
        </section>
      ) : null}

      {fromOthers.length > 0 ? (
        <section className="w-full bg-white px-0 py-10 sm:py-12">
          <div className="flex w-full flex-col gap-4">
            <div className="mb-1 w-full text-left">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c2410c]">
                Related products from
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                other sellers
              </h2>
            </div>
            <div className="grid w-full grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-6">
              {fromOthers.map((p, key) => (
                <CompactProductTile
                  key={p?.id ?? key}
                  product={p}
                  tone="light"
                  showCompare
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default RelatedProduct;
