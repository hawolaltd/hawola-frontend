import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/home/Footer";
import Drawer from "@/components/header/MobileMenuDrawer";
import { setDrawerOpen } from "@/redux/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { ProductFull, Banner } from "@/types/home";
import ProductCard from "@/components/product/ProductCard";
import generalService from "@/redux/general/generalService";

export default function RecommendedTodayPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState(true);
  const isDrawerOpen = useAppSelector((state) => state.ui.isDrawerOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await generalService.getRecommendedTodayPage();
        setBanners(response?.data?.banners || []);
        setProducts(response?.data?.products || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hero = useMemo(
    () => banners[Math.floor(Math.random() * Math.max(banners.length, 1))],
    [banners]
  );
  const heroImage = hero?.web_banner_image || hero?.mobile_banner_image || hero?.banner_image || "";

  return (
    <div>
      <Head>
        <title>Recommended Today | Hawola</title>
      </Head>
      <Drawer isOpen={isDrawerOpen} onClose={() => dispatch(setDrawerOpen(false))} messageCount={3} />
      <div className={"mb-4"}>
        <Header />
      </div>

      <section className="max-w-screen-xl mx-auto px-6 xl:px-0 py-4">
        <div className="rounded-xl overflow-hidden bg-slate-100">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="Recommended hero banner" className="w-full h-[220px] md:h-[320px] object-cover" />
          ) : null}
          <div className="p-5 md:p-6 bg-white border border-slate-100 border-t-0">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Recommended Today</h1>
            <p className="mt-2 text-sm text-slate-600">
              Personalized picks from curated Hawola Specials using your visit and search history.
            </p>
            <div className="mt-3">
              <Link href="/" className="text-sm text-deepOrange hover:underline">Back to Home</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto px-6 xl:px-0 py-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading recommendations...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-slate-500">No recommendations available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
