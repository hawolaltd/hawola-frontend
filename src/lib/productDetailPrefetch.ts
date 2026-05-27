import productService from "@/redux/product/productService";
import {
  DEFAULT_PRODUCT_DETAIL_LOAD,
  type ProductDetailSectionStatus,
} from "@/redux/product/productSlice";
import type { ProductByIdResponse } from "@/types/product";
import type { AppDispatch } from "@/store/store";
import {
  clearProductById,
  fetchProductDetailGallery,
  fetchProductDetailMain,
  fetchProductDetailRelated,
  getMerchantReviews,
  setProductDetailBundle,
} from "@/redux/product/productSlice";

type ProductDetailLoadState = {
  gallery: ProductDetailSectionStatus;
  main: ProductDetailSectionStatus;
  related: ProductDetailSectionStatus;
};

type DetailCacheEntry = {
  slug: string;
  product: ProductByIdResponse;
  load: ProductDetailLoadState;
  updatedAt: number;
};

const HOVER_DELAY_MS = 120;
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 12;

const cache = new Map<string, DetailCacheEntry>();
const inflight = new Map<string, Promise<void>>();
const hoverTimers = new Map<string, ReturnType<typeof setTimeout>>();
/** Avoid duplicate concurrent review API calls (e.g. React StrictMode double-mount). */
const merchantReviewsInflight = new Map<string, Promise<void>>();

const emptyProduct = (): ProductByIdResponse =>
  ({ product: {} } as ProductByIdResponse);

function mergeDetail(
  prev: ProductByIdResponse,
  patch: Partial<ProductByIdResponse> & {
    product_variant_options?: unknown[];
  }
): ProductByIdResponse {
  const product_variant =
    patch.product_variant ??
    patch.product_variant_options ??
    prev.product_variant;
  return {
    ...prev,
    ...patch,
    ...(product_variant !== undefined ? { product_variant } : {}),
    product: patch.product
      ? ({ ...prev.product, ...patch.product } as ProductByIdResponse["product"])
      : prev.product,
  };
}

function pruneCache(): void {
  if (cache.size <= MAX_CACHE_ENTRIES) return;
  const sorted = [...cache.entries()].sort(
    (a, b) => a[1].updatedAt - b[1].updatedAt
  );
  const remove = sorted.length - MAX_CACHE_ENTRIES;
  for (let i = 0; i < remove; i++) {
    cache.delete(sorted[i][0]);
  }
}

function isCacheFresh(entry: DetailCacheEntry): boolean {
  return Date.now() - entry.updatedAt < CACHE_TTL_MS;
}

function isCoreReady(load: ProductDetailLoadState): boolean {
  return load.gallery === "succeeded" && load.main === "succeeded";
}

function getOrCreateEntry(slug: string): DetailCacheEntry {
  const existing = cache.get(slug);
  if (existing) return existing;
  const entry: DetailCacheEntry = {
    slug,
    product: emptyProduct(),
    load: { ...DEFAULT_PRODUCT_DETAIL_LOAD },
    updatedAt: Date.now(),
  };
  cache.set(slug, entry);
  return entry;
}

function commitEntry(entry: DetailCacheEntry): void {
  entry.updatedAt = Date.now();
  cache.set(entry.slug, entry);
  pruneCache();
}

function dispatchMerchantReviewsDeduped(dispatch: AppDispatch, slug: string): void {
  if (merchantReviewsInflight.has(slug)) return;
  const p = dispatch(getMerchantReviews(slug))
    .unwrap()
    .catch(() => {
      /* logged in slice; avoid unhandled rejection */
    })
    .finally(() => {
      merchantReviewsInflight.delete(slug);
    });
  merchantReviewsInflight.set(slug, p);
}

async function fetchIntoCache(slug: string): Promise<void> {
  const entry = getOrCreateEntry(slug);
  entry.load = {
    gallery: "pending",
    main: "pending",
    related: "pending",
  };

  const [gallery, main, related] = await Promise.allSettled([
    productService.getProductDetailGallery(slug),
    productService.getProductDetailMain(slug),
    productService.getProductDetailRelated(slug),
  ]);

  if (gallery.status === "fulfilled") {
    entry.product = mergeDetail(entry.product, gallery.value);
    entry.load.gallery = "succeeded";
  } else {
    entry.load.gallery = "failed";
  }

  if (main.status === "fulfilled") {
    entry.product = mergeDetail(entry.product, main.value);
    entry.load.main = "succeeded";
  } else {
    entry.load.main = "failed";
  }

  if (related.status === "fulfilled") {
    entry.product = mergeDetail(entry.product, related.value);
    entry.load.related = "succeeded";
  } else {
    entry.load.related = "failed";
  }

  commitEntry(entry);
}

/** Start loading gallery + main + related in the background (hover / focus). */
export function prefetchProductDetail(slug: string | undefined | null): void {
  if (!slug || typeof window === "undefined") return;

  const cached = cache.get(slug);
  if (cached && isCacheFresh(cached) && isCoreReady(cached.load)) {
    return;
  }
  if (inflight.has(slug)) return;

  const run = fetchIntoCache(slug).finally(() => {
    inflight.delete(slug);
  });
  inflight.set(slug, run);
}

/** Debounced hover prefetch — call from onMouseEnter / onFocus. */
export function scheduleProductDetailPrefetch(
  slug: string | undefined | null
): void {
  if (!slug) return;
  const existing = hoverTimers.get(slug);
  if (existing) clearTimeout(existing);
  hoverTimers.set(
    slug,
    setTimeout(() => {
      hoverTimers.delete(slug);
      prefetchProductDetail(slug);
    }, HOVER_DELAY_MS)
  );
}

export function cancelProductDetailPrefetch(
  slug: string | undefined | null
): void {
  if (!slug) return;
  const t = hoverTimers.get(slug);
  if (t) {
    clearTimeout(t);
    hoverTimers.delete(slug);
  }
}

export function getCachedProductDetailBundle(
  slug: string
): { slug: string; product: ProductByIdResponse; productDetailLoad: ProductDetailLoadState } | null {
  const entry = cache.get(slug);
  if (!entry || !isCacheFresh(entry) || !isCoreReady(entry.load)) {
    return null;
  }
  return {
    slug: entry.slug,
    product: entry.product,
    productDetailLoad: { ...entry.load },
  };
}

/**
 * Load PDP data — uses hover cache when available, otherwise fetches all sections.
 */
export async function ensureProductDetailLoaded(
  dispatch: AppDispatch,
  slug: string
): Promise<{ notFound: boolean }> {
  const cached = getCachedProductDetailBundle(slug);
  if (cached) {
    dispatch(setProductDetailBundle(cached));
    dispatchMerchantReviewsDeduped(dispatch, slug);
    if (cached.productDetailLoad.related !== "succeeded") {
      const relatedRes = await dispatch(fetchProductDetailRelated(slug));
      if (fetchProductDetailRelated.fulfilled.match(relatedRes)) {
        const entry = getOrCreateEntry(slug);
        entry.product = mergeDetail(
          entry.product,
          relatedRes.payload as Partial<ProductByIdResponse>
        );
        entry.load.related = "succeeded";
        commitEntry(entry);
      }
    }
    return { notFound: false };
  }

  await dispatch(clearProductById());

  const [galleryRes, mainRes, relatedRes] = await Promise.all([
    dispatch(fetchProductDetailGallery(slug)),
    dispatch(fetchProductDetailMain(slug)),
    dispatch(fetchProductDetailRelated(slug)),
  ]);

  if (fetchProductDetailMain.rejected.match(mainRes)) {
    const err = mainRes.payload as { status?: number } | undefined;
    if (err?.status === 404) {
      return { notFound: true };
    }
  }

  const mainPayload = fetchProductDetailMain.fulfilled.match(mainRes)
    ? (mainRes.payload as ProductByIdResponse)
    : null;
  if (
    !mainPayload?.product?.id &&
    fetchProductDetailGallery.rejected.match(galleryRes)
  ) {
    return { notFound: true };
  }

  dispatchMerchantReviewsDeduped(dispatch, slug);

  const entry = getOrCreateEntry(slug);
  entry.product = emptyProduct();
  entry.load = { ...DEFAULT_PRODUCT_DETAIL_LOAD };
  if (fetchProductDetailGallery.fulfilled.match(galleryRes)) {
    entry.product = mergeDetail(
      entry.product,
      galleryRes.payload as Partial<ProductByIdResponse>
    );
    entry.load.gallery = "succeeded";
  }
  if (fetchProductDetailMain.fulfilled.match(mainRes)) {
    entry.product = mergeDetail(
      entry.product,
      mainRes.payload as Partial<ProductByIdResponse>
    );
    entry.load.main = "succeeded";
  }
  if (fetchProductDetailRelated.fulfilled.match(relatedRes)) {
    entry.product = mergeDetail(
      entry.product,
      relatedRes.payload as Partial<ProductByIdResponse>
    );
    entry.load.related = "succeeded";
  }
  commitEntry(entry);

  return { notFound: false };
}
