import PromoGraphicRow, { type PromoGraphicBlock } from "@/components/promo/PromoGraphicRow";
import PromoPagination from "@/components/promo/PromoPagination";
import PromoProductReel from "@/components/promo/PromoProductReel";
import PromoContentSkeleton from "@/components/promo/PromoContentSkeleton";
import { PromoLoadingIndicator } from "@/components/promo/PromoContentSkeleton";
import PromoProductTile from "@/components/promo/PromoProductTile";
import SocialShareBar from "@/components/promo/SocialShareBar";
import type { PromoPageDesign } from "@/components/promo/promoDesignTypes";
import { getPromoSectionTheme, resolvePromoPageBackground, type PromoSectionTheme } from "@/components/promo/promoHeroTheme";
import { ProductFull } from "@/types/home";

export type { PromoGraphicBlock };
export type { PromoPageDesign };

export type PromoLandingMeta = {
  title: string;
  slug: string;
  description: string;
  banner_url: string | null;
  featured_section_title: string;
  page_design: PromoPageDesign;
  hero_gradient_from?: string;
  hero_gradient_to?: string;
  hero_icon?: string;
  hero_icon_color?: string;
  page_background?: string;
  reel_enabled?: boolean;
  reel_section_title?: string;
};

export type PromoPaginationMeta = {
  page: number;
  page_size: number;
  total_pages: number;
  count: number;
};

export type PromoDesignProps = {
  landing: PromoLandingMeta;
  featured: ProductFull[];
  reelProducts: ProductFull[];
  promoGraphicBlocks: PromoGraphicBlock[];
  products: ProductFull[];
  shareUrl: string;
  pagination: PromoPaginationMeta;
  productsLoading: boolean;
  notFound: boolean;
  initialLoading: boolean;
  onPageChange: (page: number) => void;
};

export const CURATED_TAGLINE = "Curated products just for you";

export const PRODUCT_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4";

type SectionProps = {
  featured: ProductFull[];
  reelProducts: ProductFull[];
  promoGraphicBlocks: PromoGraphicBlock[];
  products: ProductFull[];
  landing: PromoLandingMeta;
  pagination: PromoPaginationMeta;
  productsLoading: boolean;
  onPageChange: (page: number) => void;
  featuredRingClass?: string;
  sectionClass?: string;
  featuredHeaderClass?: string;
  gridTitleClass?: string;
  pageHintClass?: string;
  reelInset?: boolean;
};

function buildInterleavedGridItems(
  products: ProductFull[],
  blocks: PromoGraphicBlock[],
  page: number,
  pageSize: number
): Array<
  | { kind: "product"; product: ProductFull; key: string }
  | { kind: "graphic"; block: PromoGraphicBlock; key: string }
> {
  const offset = (page - 1) * pageSize;
  const blocksByPosition = new Map<number, PromoGraphicBlock[]>();
  for (const block of blocks) {
    const pos = block.insert_after_products;
    const list = blocksByPosition.get(pos) || [];
    list.push(block);
    blocksByPosition.set(pos, list);
  }
  for (const [, list] of blocksByPosition) {
    list.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  }

  const items: Array<
    | { kind: "product"; product: ProductFull; key: string }
    | { kind: "graphic"; block: PromoGraphicBlock; key: string }
  > = [];

  products.forEach((product, index) => {
    items.push({ kind: "product", product, key: `p-${product.id}` });
    const globalIndex = offset + index + 1;
    const matching = blocksByPosition.get(globalIndex) || [];
    matching.forEach((block) => {
      items.push({ kind: "graphic", block, key: `g-${block.id}-${globalIndex}` });
    });
  });

  return items;
}

export function PromoFeaturedSection({
  featured,
  landing,
  theme,
}: {
  featured: ProductFull[];
  landing: PromoLandingMeta;
  theme: PromoSectionTheme;
}) {
  if (!featured.length) return null;
  const wrapClass = theme.featuredRingClass;
  return (
    <section className={theme.featuredSectionClass} aria-label="Featured products">
      <div
        className={`mb-6 flex flex-wrap items-end justify-between gap-4 border-b pb-4 ${theme.featuredHeaderClass}`}
      >
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.25em] ${theme.featuredEyebrowClass}`}>
            Top picks
          </p>
          <h2 className={`mt-1 text-2xl font-black sm:text-3xl ${theme.featuredTitleClass}`}>
            {landing.featured_section_title || "Our choice products for you today"}
          </h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${theme.featuredBadgeClass}`}>
          Editor&apos;s choice
        </span>
      </div>
      <div className={theme.productGridClass}>
        {featured.map((product) =>
          wrapClass ? (
            <div key={product.id} className={wrapClass}>
              <PromoProductTile product={product} variant={theme.productCardVariant} isPromoted />
            </div>
          ) : (
            <PromoProductTile
              key={product.id}
              product={product}
              variant={theme.productCardVariant}
              isPromoted
            />
          )
        )}
      </div>
    </section>
  );
}

export function PromoProductsSection({
  featured,
  promoGraphicBlocks,
  products,
  landing,
  pagination,
  productsLoading,
  onPageChange,
  sectionClass = "",
  gridTitleClass = "text-slate-900",
  pageHintClass = "text-slate-500",
  theme,
}: Omit<SectionProps, "reelProducts" | "reelInset"> & { theme: PromoSectionTheme }) {
  const showGrid =
    products.length > 0 ||
    promoGraphicBlocks.length > 0 ||
    (pagination.total_pages > 0 && pagination.page > 1);

  if (!showGrid) return null;

  const gridTitle =
    featured.length > 0 ? "More from this sale" : landing.title || "Sale products";

  const gridItems = buildInterleavedGridItems(
    products,
    promoGraphicBlocks,
    pagination.page,
    pagination.page_size
  );

  return (
    <section className={sectionClass} aria-label="Sale products">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className={`text-xl font-bold sm:text-2xl ${gridTitleClass}`}>{gridTitle}</h2>
        {pagination.total_pages > 1 ? (
          <span className={`text-sm ${pageHintClass}`}>
            Page {pagination.page} of {pagination.total_pages}
          </span>
        ) : null}
      </div>

      {productsLoading ? (
        <>
          <PromoLoadingIndicator
            message="Updating products"
            className="pb-4"
            spinnerClass={theme.loadingSpinnerClass}
          />
          <div className={theme.productGridClass}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="aspect-[3/4] motion-safe:animate-pulse bg-slate-200/80" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-1/2 motion-safe:animate-pulse rounded bg-slate-200/80" />
                  <div className="h-4 w-full motion-safe:animate-pulse rounded bg-slate-200/80" />
                  <div className="h-4 w-2/3 motion-safe:animate-pulse rounded bg-slate-200/80" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : gridItems.length > 0 ? (
        <div className={theme.productGridClass}>
          {gridItems.map((item) =>
            item.kind === "product" ? (
              <PromoProductTile key={item.key} product={item.product} variant={theme.productCardVariant} />
            ) : (
              <PromoGraphicRow key={item.key} block={item.block} />
            )
          )}
        </div>
      ) : (
        <p className="py-8 text-center text-slate-500">No products on this page.</p>
      )}

      <PromoPagination
        page={pagination.page}
        totalPages={pagination.total_pages}
        loading={productsLoading}
        onPageChange={onPageChange}
      />
    </section>
  );
}

export function PromoShareFooter({
  shareUrl,
  title,
  className = "mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 p-8 text-center text-white shadow-2xl sm:p-12",
}: {
  shareUrl: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-2xl font-black sm:text-3xl">Love these deals?</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
        Share this sale with friends — they&apos;ll thank you later.
      </p>
      <div className="mt-6 flex justify-center">
        <SocialShareBar pageUrl={shareUrl} title={title} variant="dark" />
      </div>
    </div>
  );
}

export function PromoNotFound() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
        🛍️
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Promotion not found</h2>
      <p className="mt-2 text-slate-600">This sale may have ended or the link is incorrect.</p>
      <a
        href="/"
        className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white"
      >
        Back to Hawola
      </a>
    </div>
  );
}

export function PromoShareStrip({
  landing,
  shareUrl,
  className = "border-b border-rose-100/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm",
}: {
  landing: PromoLandingMeta;
  shareUrl: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 xl:px-0">
        <p className="text-xs font-medium text-slate-600 truncate max-w-[200px] sm:max-w-none">
          <span className="text-rose-600 font-semibold">Live sale</span>
          <span className="hidden sm:inline"> · {landing.title}</span>
        </p>
        <SocialShareBar
          pageUrl={shareUrl}
          title={landing.title}
          variant="light"
          className="!flex-row !items-center !gap-2 sm:!gap-3"
        />
      </div>
    </div>
  );
}

export function PromoBody({
  props,
  children,
}: {
  props: PromoDesignProps;
  children: React.ReactNode;
}) {
  const { landing, featured, reelProducts, promoGraphicBlocks, products, shareUrl, pagination, productsLoading, notFound, initialLoading, onPageChange } =
    props;
  const hasProducts =
    featured.length > 0 ||
    products.length > 0 ||
    pagination.count > 0 ||
    promoGraphicBlocks.length > 0 ||
    (landing.reel_enabled && reelProducts.length >= 5);

  const theme = getPromoSectionTheme(landing.page_design || "classic");
  const pageBackground = resolvePromoPageBackground(landing);
  const sectionPadding =
    theme.sectionPadding ?? "px-4 py-10 sm:px-6 sm:py-14 xl:px-0";
  const showReel = landing.reel_enabled && reelProducts.length >= 5;

  const productsSection = (
    <section
      id="promo-products"
      className={`mx-auto w-full max-w-screen-xl ${sectionPadding} ${theme.sectionShell}`}
      aria-busy={initialLoading || productsLoading}
    >
      {notFound ? <PromoNotFound /> : null}

      {!notFound && initialLoading ? (
        <PromoContentSkeleton theme={theme} showReelHint={Boolean(landing.reel_enabled)} />
      ) : null}

      {!notFound && !initialLoading ? (
        <>
          <PromoFeaturedSection featured={featured} landing={landing} theme={theme} />

          {showReel ? (
            <PromoProductReel
              title={landing.reel_section_title || "Shop the reel"}
              products={reelProducts}
              className="mb-10 sm:mb-12"
              inset={theme.reelInset}
              eyebrowClass={theme.reelEyebrowClass}
              countBadgeClass={theme.reelCountBadgeClass}
              fadeClass={theme.reelFadeClass}
            />
          ) : null}

          <PromoProductsSection
            featured={featured}
            promoGraphicBlocks={promoGraphicBlocks}
            products={products}
            landing={landing}
            pagination={pagination}
            productsLoading={productsLoading}
            onPageChange={onPageChange}
            gridTitleClass={theme.gridTitleClass}
            pageHintClass={theme.pageHintClass}
            theme={theme}
          />
        </>
      ) : null}

      {!notFound && !initialLoading && !hasProducts ? (
        <p className="py-16 text-center text-slate-500">Products coming soon — check back shortly.</p>
      ) : null}

      {!notFound && hasProducts && shareUrl ? (
        <PromoShareFooter shareUrl={shareUrl} title={landing.title} className={theme.shareFooterClass} />
      ) : null}
    </section>
  );

  return (
    <div className="promo-landing min-h-screen" style={{ backgroundColor: pageBackground }}>
      {children}

      {theme.sectionOuterClass ? (
        <div className={theme.sectionOuterClass}>{productsSection}</div>
      ) : (
        productsSection
      )}
    </div>
  );
}
