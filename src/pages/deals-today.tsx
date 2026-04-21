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

export default function DealsTodayPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const isDrawerOpen = useAppSelector((state) => state.ui.isDrawerOpen);
  const dispatch = useAppDispatch();
  const itemsPerPage = 12;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await generalService.getDealsTodayPage();
        const nextBanners = response?.data?.banners || [];
        setBanners(nextBanners);
        setProducts(response?.data?.products || []);
        if (nextBanners.length > 0) {
          setHeroIndex(Math.floor(Math.random() * nextBanners.length));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hero = useMemo(() => banners[heroIndex], [banners, heroIndex]);
  const heroImage = hero?.web_banner_image || hero?.mobile_banner_image || hero?.banner_image || "";
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(totalPages, Math.max(1, page)));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      <Head>
        <title>Deals Today | Hawola</title>
      </Head>
      <Drawer isOpen={isDrawerOpen} onClose={() => dispatch(setDrawerOpen(false))} messageCount={3} />
      <div className={"mb-4"}>
        <Header />
      </div>

      <section className="max-w-screen-xl mx-auto px-6 xl:px-0 py-5 md:py-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200">Hawola Premium Edit</p>
                <h1 className="mt-2 text-2xl md:text-4xl font-bold text-white">Deals Today</h1>
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {heroImage ? (
            <div className="p-4 md:p-6 pt-5">
              <div className="relative overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="Deals hero banner" className="w-full h-[190px] md:h-[300px] object-cover" />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto px-6 xl:px-0 py-2 pb-20 md:pb-28">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">Today&apos;s Selections</h2>
          {!loading && products.length > 0 ? (
            <span className="text-xs md:text-sm rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {products.length} products
            </span>
          ) : null}
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading deals...</p>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No deals are curated yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5)
                  .map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`min-w-[38px] rounded-lg px-3 py-2 text-sm font-semibold ${
                        page === currentPage
                          ? "bg-slate-900 text-white"
                          : "border border-slate-300 text-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
