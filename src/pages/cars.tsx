import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/home/Footer";
import Drawer from "@/components/header/MobileMenuDrawer";
import { setDrawerOpen } from "@/redux/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import productService from "@/redux/product/productService";
import { ProductFull } from "@/types/home";
import VehicleShowcaseCard from "@/components/product/VehicleShowcaseCard";
import SiteSettingsPreloader from "@/components/SiteSettingsPreloader";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function orderPromotedFirst(promoted: ProductFull[], products: ProductFull[]) {
  const promotedIds = new Set(promoted.map((p) => p.id));
  const rest = shuffle(products.filter((p) => !promotedIds.has(p.id)));
  return [...promoted, ...rest];
}

function toProduct(item: any): ProductFull | null {
  // Some endpoints may return promoted rows as either Product or { product: Product }.
  const candidate = item?.product && typeof item.product === "object" ? item.product : item;
  if (!candidate || !candidate?.id || !candidate?.name) return null;
  if (!candidate?.slug || typeof candidate.slug !== "string" || !candidate.slug.trim()) {
    return null;
  }
  return candidate as ProductFull;
}

export default function CarsCuratedPage() {
  const isDrawerOpen = useAppSelector((state) => state.ui.isDrawerOpen);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [promotedIds, setPromotedIds] = useState<Set<number>>(new Set());
  const [categoryLabel, setCategoryLabel] = useState("Vehicles");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await productService.getCuratedSurfaceProducts("vehicles");
        if (!data) {
          setProducts([]);
          return;
        }

        const promotedMap = new Map<number, ProductFull>();
        const regularMap = new Map<number, ProductFull>();
        const promotedItems: ProductFull[] = (data?.promoted_products || [])
          .map((row: any) => toProduct(row))
          .filter(Boolean) as ProductFull[];
        const regularItems: ProductFull[] = (data?.products || [])
          .map((row: any) => toProduct(row))
          .filter(Boolean) as ProductFull[];
        for (const p of promotedItems) promotedMap.set(p.id, p);
        for (const p of regularItems) {
          if (!promotedMap.has(p.id)) regularMap.set(p.id, p);
        }

        const promoted = Array.from(promotedMap.values());
        const regular = Array.from(regularMap.values());
        setCategoryLabel(data?.surface?.name || "Vehicles");
        setPromotedIds(new Set(promoted.map((p) => p.id)));
        setProducts(orderPromotedFirst(promoted, regular));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div>
      <Head>
        <title>Cars & Vehicles | Hawola</title>
      </Head>
      {loading ? <SiteSettingsPreloader /> : null}
      <Drawer isOpen={isDrawerOpen} onClose={() => dispatch(setDrawerOpen(false))} messageCount={3} />
      <Header />

      <section className="relative overflow-hidden border-b border-slate-800 bg-[radial-gradient(circle_at_15%_20%,#0f172a_0%,#020617_65%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.12),rgba(245,158,11,0.12))]" />
        <div className="relative mx-auto w-full max-w-screen-xl px-6 py-12 xl:px-0">
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
            Cars & Vehicles Marketplace
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
            Discover varities of cars, SUVs, buses, trucks, motorcycles, and auto parts from sellers.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              Promoted
            </span>
            <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
              Curated just for you
            </span>
            <Link href="/" className="ml-auto text-xs font-semibold uppercase tracking-wider text-white/85 hover:text-white">
              Back Home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-xl px-6 py-8 xl:px-0">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No vehicle listings are available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <VehicleShowcaseCard
                key={product.id}
                product={product}
                promoted={promotedIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
