import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/hook/useReduxTypes";
import productService from "@/redux/product/productService";
import { getLocalRecentlyViewedProducts, RecentlyViewedSnapshot } from "@/lib/recentlyViewed";

type ServerProduct = {
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

export default function RecentlyViewedSection() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [serverProducts, setServerProducts] = useState<ServerProduct[]>([]);
  const [localProducts, setLocalProducts] = useState<RecentlyViewedSnapshot[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      void productService
        .getRecentlyViewedProducts(8)
        .then((res) => setServerProducts(Array.isArray(res?.products) ? res.products : []))
        .catch(() => setServerProducts([]));
      return;
    }
    setLocalProducts(getLocalRecentlyViewedProducts().slice(0, 8));
  }, [isAuthenticated]);

  const rows = useMemo(() => {
    if (isAuthenticated) {
      return serverProducts.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        discount_price: p.discount_price,
        image:
          p.featured_image?.[0]?.image_url ||
          p.featured_image?.[0]?.image?.full_size ||
          "/imgs/page/blog/img-big5.png",
      }));
    }
    return localProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      discount_price: p.discount_price,
      image: p.image_url || "/imgs/page/blog/img-big5.png",
    }));
  }, [isAuthenticated, serverProducts, localProducts]);

  if (!rows.length) return null;

  return (
    <section className="mx-auto w-full max-w-screen-xl px-6 py-8 xl:px-0">
      <div className="mb-4 flex items-center justify-between border-b border-[#CAD6EC] pb-3">
        <h3 className="text-xl font-semibold text-primary">Recently Viewed</h3>
        {isAuthenticated ? (
          <Link href="/account?tab=recently_viewed" className="text-sm font-semibold text-deepOrange hover:underline">
            View history
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.slug}`}
            className="rounded-lg border border-gray-200 bg-white p-3 transition hover:border-[#f59e0b] hover:shadow-sm"
          >
            <img src={item.image} alt={item.name} className="mb-2 h-28 w-full rounded object-cover" />
            <p className="line-clamp-2 text-sm font-semibold text-primary">{item.name}</p>
            <div className="mt-2 flex items-center gap-2">
              {item.discount_price ? (
                <span className="text-sm font-bold text-primary">{money(item.discount_price)}</span>
              ) : null}
              {item.price ? (
                <span className={`text-xs ${item.discount_price ? "text-gray-400 line-through" : "text-primary"}`}>
                  {money(item.price)}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
