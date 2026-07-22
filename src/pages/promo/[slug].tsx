import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/home/Footer";
import {
  PromoDesignRenderer,
  type PromoLandingMeta,
} from "@/components/promo/designs";
import { parsePromoPageDesign } from "@/components/promo/promoDesignTypes";
import PromoHeroSkeleton from "@/components/promo/PromoHeroSkeleton";
import productService from "@/redux/product/productService";
import { getPromoPageUrl } from "@/lib/promoShare";
import { ProductFull } from "@/types/home";

type PaginationMeta = {
  page: number;
  page_size: number;
  total_pages: number;
  count: number;
};

const PAGE_SIZE = 24;
const CONTENT_INCLUDE =
  "featured_products,reel_products,promo_graphic_blocks,products,pagination";
const PRODUCTS_INCLUDE = "products,pagination";

function toProduct(item: unknown): ProductFull | null {
  const candidate =
    item && typeof item === "object" && "product" in (item as object)
      ? (item as { product: ProductFull }).product
      : item;
  if (!candidate || typeof candidate !== "object") return null;
  const p = candidate as ProductFull;
  if (!p.id || !p.name || !p.slug) return null;
  return p;
}

function parsePageQuery(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function parseLandingMeta(meta: Record<string, unknown> | null | undefined): PromoLandingMeta | null {
  if (!meta) return null;
  return {
    title: String(meta.title || ""),
    slug: String(meta.slug || ""),
    description: String(meta.description || ""),
    banner_url: (meta.banner_url as string | null) ?? null,
    featured_section_title: String(meta.featured_section_title || ""),
    page_design: parsePromoPageDesign(meta.page_design),
    hero_gradient_from: String(meta.hero_gradient_from || ""),
    hero_gradient_to: String(meta.hero_gradient_to || ""),
    hero_icon: String(meta.hero_icon || ""),
    hero_icon_color: String(meta.hero_icon_color || "#ffffff"),
    page_background: String(meta.page_background || ""),
    reel_enabled: Boolean(meta.reel_enabled),
    reel_section_title: String(meta.reel_section_title || "Shop the reel"),
  };
}

function mapProducts(rows: unknown[] | undefined): ProductFull[] {
  return (rows || []).map((row) => toProduct(row)).filter(Boolean) as ProductFull[];
}

export default function PromoLandingPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const queryPage = parsePageQuery(router.query.page);
  const shuffleSeedRef = useRef<string>("");

  const [metaLoading, setMetaLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [landing, setLanding] = useState<PromoLandingMeta | null>(null);
  const [featured, setFeatured] = useState<ProductFull[]>([]);
  const [reelProducts, setReelProducts] = useState<ProductFull[]>([]);
  const [promoGraphicBlocks, setPromoGraphicBlocks] = useState<
    import("@/components/promo/PromoGraphicRow").PromoGraphicBlock[]
  >([]);
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 0,
    count: 0,
  });
  const [notFound, setNotFound] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  if (!shuffleSeedRef.current) {
    shuffleSeedRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  useEffect(() => {
    if (!slug) return;
    setShareUrl(getPromoPageUrl(slug));
  }, [slug]);

  const applyPagination = useCallback((data: Record<string, unknown>, page: number) => {
    setPagination({
      page: Number(data.page ?? page),
      page_size: Number(data.page_size ?? PAGE_SIZE),
      total_pages: Number(data.total_pages ?? 0),
      count: Number(data.count ?? 0),
    });
  }, []);

  const loadMeta = useCallback(async () => {
    if (!slug) return false;
    setMetaLoading(true);
    setNotFound(false);
    try {
      const data = await productService.getSalesLandingPage(slug, { include: "landing" });
      if (data?.inactive && data?.redirect_url) {
        const target = String(data.redirect_url);
        if (/^https?:\/\//i.test(target)) {
          window.location.replace(target);
        } else {
          void router.replace(target.startsWith("/") ? target : `/${target}`);
        }
        return false;
      }
      setLanding(parseLandingMeta(data?.landing as Record<string, unknown>));
      return true;
    } catch {
      setNotFound(true);
      setLanding(null);
      return false;
    } finally {
      setMetaLoading(false);
    }
  }, [slug, router]);

  const loadContent = useCallback(
    async (page: number, { productsOnly = false }: { productsOnly?: boolean } = {}) => {
      if (!slug) return;
      if (productsOnly) setProductsLoading(true);
      else setContentLoading(true);
      try {
        const data = await productService.getSalesLandingPage(slug, {
          page,
          page_size: PAGE_SIZE,
          shuffle_seed: shuffleSeedRef.current,
          include: productsOnly ? PRODUCTS_INCLUDE : CONTENT_INCLUDE,
        });

        if (data?.inactive && data?.redirect_url) {
          return;
        }

        if (!productsOnly) {
          setFeatured(mapProducts(data?.featured_products));
          setReelProducts(mapProducts(data?.reel_products));
          setPromoGraphicBlocks(
            Array.isArray(data?.promo_graphic_blocks) ? data.promo_graphic_blocks : []
          );
        }

        setProducts(mapProducts(data?.products));
        applyPagination(data as Record<string, unknown>, page);
      } catch {
        if (!productsOnly) {
          setFeatured([]);
          setReelProducts([]);
          setPromoGraphicBlocks([]);
        }
        setProducts([]);
        setPagination({ page: 1, page_size: PAGE_SIZE, total_pages: 0, count: 0 });
      } finally {
        if (productsOnly) setProductsLoading(false);
        else setContentLoading(false);
      }
    },
    [slug, applyPagination]
  );

  const prevSlugRef = useRef("");
  const initialContentLoadedRef = useRef(false);

  useEffect(() => {
    if (!slug || !router.isReady) return;

    const slugChanged = prevSlugRef.current !== slug;
    if (slugChanged) {
      shuffleSeedRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      prevSlugRef.current = slug;
      initialContentLoadedRef.current = false;
      setFeatured([]);
      setReelProducts([]);
      setPromoGraphicBlocks([]);
      setProducts([]);
      void (async () => {
        const ok = await loadMeta();
        if (ok) {
          await loadContent(queryPage, { productsOnly: false });
          initialContentLoadedRef.current = true;
        }
      })();
      return;
    }

    if (!initialContentLoadedRef.current || !landing) return;
    void loadContent(queryPage, { productsOnly: true });
  }, [slug, queryPage, router.isReady, landing, loadMeta, loadContent]);

  const handlePageChange = (nextPage: number) => {
    if (!slug || nextPage < 1 || nextPage === pagination.page) return;
    if (pagination.total_pages > 0 && nextPage > pagination.total_pages) return;
    const path = nextPage <= 1 ? `/promo/${slug}` : `/promo/${slug}?page=${nextPage}`;
    void router.push(path, undefined, { shallow: true, scroll: false }).then(() => {
      document.getElementById("promo-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const skeletonDesign = landing?.page_design || "classic";
  const pageTitle = landing?.title ? `${landing.title} | Hawola` : "Promo | Hawola";
  const ogDescription =
    landing?.description?.trim() || "Shop curated deals on Hawola — curated products just for you.";
  const ogImage = landing?.banner_url || undefined;

  const designProps = {
    featured,
    reelProducts,
    promoGraphicBlocks,
    products,
    shareUrl,
    pagination,
    productsLoading: productsLoading || contentLoading,
    notFound,
    initialLoading: contentLoading,
    onPageChange: handlePageChange,
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={landing?.title || "Hawola Promo"} />
        <meta property="og:description" content={ogDescription} />
        {shareUrl ? <meta property="og:url" content={shareUrl} /> : null}
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={landing?.title || "Hawola Promo"} />
        <meta name="twitter:description" content={ogDescription} />
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      </Head>
      <Header />

      {metaLoading && !landing ? <PromoHeroSkeleton design={skeletonDesign} /> : null}

      {landing ? (
        <PromoDesignRenderer landing={landing} {...designProps} />
      ) : notFound ? (
        <PromoDesignRenderer
          landing={{
            title: "",
            slug: slug || "",
            description: "",
            banner_url: null,
            featured_section_title: "",
            page_design: "classic",
          }}
          {...designProps}
          productsLoading={false}
          initialLoading={false}
          notFound
        />
      ) : null}

      <Footer />
    </>
  );
}
