import { useEffect, useState } from "react";
import { useAppSelector } from "@/hook/useReduxTypes";
import productService from "@/redux/product/productService";

type PageMeta = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export function useMerchantStoreProducts() {
  const profile = useAppSelector((state) => state.products.merchantProfile);
  const slug = profile?.merchant_details?.slug || "";
  const [products, setProducts] = useState(profile?.recent_products || []);
  const [meta, setMeta] = useState<PageMeta | null>(profile?.products_pagination ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProducts(profile?.recent_products || []);
    setMeta(profile?.products_pagination ?? null);
  }, [slug, profile?.products_pagination?.count, profile?.recent_products]);

  async function goToPage(page: number) {
    if (!slug || loading) return;
    const total = meta?.total_pages || 1;
    const next = Math.min(Math.max(1, page), total);
    setLoading(true);
    try {
      const data = await productService.getMerchantProfile(slug, next);
      setProducts(data.recent_products || []);
      setMeta(data.products_pagination ?? null);
      document.getElementById("store-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setLoading(false);
    }
  }

  return {
    products,
    count: meta?.count ?? products.length,
    page: meta?.page || 1,
    pageSize: meta?.page_size || products.length || 12,
    totalPages: meta?.total_pages || 1,
    loading,
    goToPage,
  };
}
