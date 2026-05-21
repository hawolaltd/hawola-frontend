import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/home/Footer";
import productService from "@/redux/product/productService";
import { ProductFull } from "@/types/home";
import RealEstateShowcaseCard from "@/components/product/RealEstateShowcaseCard";
import SiteSettingsPreloader from "@/components/SiteSettingsPreloader";
import { useAppSelector } from "@/hook/useReduxTypes";
import {
  getRealEstateCopy,
  realEstateStatChips,
} from "@/util/curatedVerticalCopy";

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

export default function RealEstateCuratedPage() {
  const siteSettings = useAppSelector((s) => s.general.siteSettings);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [promotedIds, setPromotedIds] = useState<Set<number>>(new Set());
  const [categoryLabel, setCategoryLabel] = useState("Real Estate");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const catRes = await productService.getAllCategories();
        const categories = catRes?.categories || [];
        const targetCategory = categories.find((c: any) => /real\s*estate/i.test(c?.name || ""));
        if (!targetCategory?.slug) {
          setProducts([]);
          return;
        }

        setCategoryLabel(targetCategory?.name || "Real Estate");
        const data = await productService.getAllProductBaseOnCategories(targetCategory.slug);
        const promoted: ProductFull[] = (data?.promoted_products || []).filter((p: ProductFull) => p?.name);
        const regular: ProductFull[] = (data?.products || []).filter((p: ProductFull) => p?.name);
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

  const heroStats = useMemo(() => {
    const promotedCount = Array.from(promotedIds).length;
    return {
      total: products.length,
      promoted: promotedCount,
      curated: Math.max(products.length - promotedCount, 0),
    };
  }, [products.length, promotedIds]);

  const copy = getRealEstateCopy(siteSettings, categoryLabel);
  const statChips = realEstateStatChips(siteSettings, heroStats);

  return (
    <div>
      <Head>
        <title>{copy.pageTitle}</title>
      </Head>
      {loading ? <SiteSettingsPreloader /> : null}
      <Header />

      <section className="border-b border-emerald-100 bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-700">
        <div className="mx-auto w-full max-w-screen-xl px-6 py-12 xl:px-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/90">{copy.heroEyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">{copy.heroTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm text-emerald-50 md:text-base">
            {copy.heroDescription}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {statChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white"
              >
                {chip}
              </span>
            ))}
            <Link href="/" className="ml-auto text-xs font-semibold uppercase tracking-wider text-white/90 hover:text-white">
              Back Home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-xl px-6 py-8 xl:px-0">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">{copy.emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {products.map((product) => (
              <RealEstateShowcaseCard
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
