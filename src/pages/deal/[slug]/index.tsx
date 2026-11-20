import Header from "@/components/header";
import Footer from "@/components/home/Footer";
import { liveDeal, liveDealPath } from "@/lib/hawolaLive";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/** Older `/deal/{promoSlug}` links redirect to `/deal/{store}/{promoSlug}`. */
export default function HawolaLiveDealLegacyRedirect() {
  const router = useRouter();
  const slug = String(router.query.slug || "");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    liveDeal(slug)
      .then((promo) => {
        const next = liveDealPath(promo.store?.slug, promo.slug || slug);
        if (next) void router.replace(next);
        else setMissing(true);
      })
      .catch(() => setMissing(true));
  }, [slug, router.replace]);

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      <Header />
      <main className="px-4 py-24 text-center text-sm text-white/55">
        {missing ? "This deal page is gone." : "Opening tonight’s deals…"}
      </main>
      <Footer />
    </div>
  );
}
