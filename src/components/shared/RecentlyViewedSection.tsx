import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/hook/useReduxTypes";
import productService from "@/redux/product/productService";
import { getLocalRecentlyViewedProducts, RecentlyViewedSnapshot } from "@/lib/recentlyViewed";
import { useRouter } from "next/router";

type ServerProduct = {
  id: number;
  slug: string;
  name: string;
  price?: string | number;
  discount_price?: string | number;
  featured_image?: Array<{ image_url?: string; image?: { full_size?: string } }>;
};

export default function RecentlyViewedSection() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [serverProducts, setServerProducts] = useState<ServerProduct[]>([]);
  const [localProducts, setLocalProducts] = useState<RecentlyViewedSnapshot[]>([]);

  useEffect(() => {
    const hydrateLocal = () => setLocalProducts(getLocalRecentlyViewedProducts().slice(0, 8));
    hydrateLocal();
    if (typeof window !== "undefined") {
      window.addEventListener("hawola:recently-viewed-updated", hydrateLocal);
      window.addEventListener("storage", hydrateLocal);
    }
    if (isAuthenticated) {
      void productService
        .getRecentlyViewedProducts(8)
        .then((res) => setServerProducts(Array.isArray(res?.products) ? res.products : []))
        .catch(() => setServerProducts([]));
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("hawola:recently-viewed-updated", hydrateLocal);
        window.removeEventListener("storage", hydrateLocal);
      }
    };
  }, [isAuthenticated, router.asPath]);

  const rows = useMemo(() => {
    const localRows = localProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      discount_price: p.discount_price,
      image: p.image_url || "/imgs/page/blog/img-big5.png",
    }));

    if (!isAuthenticated) {
      return localRows;
    }

    if (!serverProducts.length) {
      return localRows;
    }

    const serverRows = serverProducts.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        discount_price: p.discount_price,
        image:
          p.featured_image?.[0]?.image?.full_size ||
          p.featured_image?.[0]?.image_url ||
          "/imgs/page/blog/img-big5.png",
      }));

    const merged = [...localRows];
    const existing = new Set(merged.map((item) => item.id));
    serverRows.forEach((item) => {
      if (!existing.has(item.id)) {
        merged.push(item);
      }
    });
    return merged.slice(0, 8);
  }, [isAuthenticated, serverProducts, localProducts]);

  if (!rows.length) return null;

  return (
    <section className="mx-auto w-full max-w-screen-xl px-6 py-6 xl:px-0">
      <div className="mb-4 flex items-center justify-between border-b border-[#CAD6EC] pb-3">
        <h3 className="text-lg font-semibold text-primary">Recently Viewed</h3>
        {isAuthenticated ? (
          <Link href="/account?tab=recently_viewed" className="text-sm font-semibold text-deepOrange hover:underline">
            View history
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {rows.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.slug}`}
            className="rounded-lg border border-gray-200 bg-white p-2 transition hover:border-[#f59e0b] hover:shadow-sm"
          >
            <img src={item.image} alt={item.name} className="mb-2 h-20 w-full rounded object-cover" />
            <p className="line-clamp-2 text-xs font-semibold text-primary">{item.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
