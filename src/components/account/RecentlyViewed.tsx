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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {rows.map((p) => (
        <Link
          key={p.id}
          href={`/product/${p.slug}`}
          className="rounded-lg border border-gray-200 bg-white p-2 transition hover:border-[#f59e0b] hover:shadow-sm"
        >
          <img
            src={p.featured_image?.[0]?.image?.full_size || p.featured_image?.[0]?.image_url || "/imgs/page/blog/img-big5.png"}
            alt={p.name}
            className="mb-2 h-20 w-full rounded object-cover"
          />
          <p className="line-clamp-2 text-xs font-semibold text-primary">{p.name}</p>
        </Link>
      ))}
    </div>
  );
}
