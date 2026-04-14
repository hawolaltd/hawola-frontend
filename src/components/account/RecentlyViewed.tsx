import React, { useEffect, useState } from "react";
import Link from "next/link";
import productService from "@/redux/product/productService";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  price?: string | number;
  discount_price?: string | number;
  featured_image?: Array<{ image_url?: string; image?: { full_size?: string } }>;
};

const money = (val: string | number | undefined | null) => {
  if (val == null || val === "") return "";
  const n = Number(val);
  if (!Number.isFinite(n)) return String(val);
  return `N${n.toLocaleString()}`;
};

export default function RecentlyViewed() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void productService
      .getRecentlyViewedProducts(24)
      .then((res) => setRows(Array.isArray(res?.products) ? res.products : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-lg bg-white p-6 text-sm text-gray-600">Loading view history...</div>;
  }

  if (rows.length === 0) {
    return <div className="rounded-lg bg-white p-6 text-sm text-gray-600">No recently viewed products yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((p) => (
        <Link
          key={p.id}
          href={`/product/${p.slug}`}
          className="rounded-lg border border-gray-200 bg-white p-3 transition hover:border-[#f59e0b] hover:shadow-sm"
        >
          <img
            src={p.featured_image?.[0]?.image_url || p.featured_image?.[0]?.image?.full_size || "/imgs/page/blog/img-big5.png"}
            alt={p.name}
            className="mb-2 h-28 w-full rounded object-cover"
          />
          <p className="line-clamp-2 text-sm font-semibold text-primary">{p.name}</p>
          <div className="mt-2 flex items-center gap-2">
            {p.discount_price ? <span className="text-sm font-bold text-primary">{money(p.discount_price)}</span> : null}
            {p.price ? (
              <span className={`text-xs ${p.discount_price ? "line-through text-gray-400" : "text-primary"}`}>
                {money(p.price)}
              </span>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
