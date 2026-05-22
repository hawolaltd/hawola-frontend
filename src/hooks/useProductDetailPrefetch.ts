import { useCallback } from "react";
import { useRouter } from "next/router";
import {
  cancelProductDetailPrefetch,
  scheduleProductDetailPrefetch,
} from "@/lib/productDetailPrefetch";

/**
 * Attach returned handlers to product links/cards so PDP data loads on hover/focus
 * before navigation.
 */
export function useProductDetailPrefetch(slug: string | undefined | null) {
  const router = useRouter();

  const onMouseEnter = useCallback(() => {
    if (!slug) return;
    scheduleProductDetailPrefetch(slug);
    void router.prefetch(`/product/${encodeURIComponent(slug)}`);
  }, [router, slug]);

  const onMouseLeave = useCallback(() => {
    cancelProductDetailPrefetch(slug);
  }, [slug]);

  const onFocus = useCallback(() => {
    if (!slug) return;
    scheduleProductDetailPrefetch(slug);
  }, [slug]);

  /** Mobile: start prefetch on touch before click completes. */
  const onTouchStart = useCallback(() => {
    if (!slug) return;
    scheduleProductDetailPrefetch(slug);
  }, [slug]);

  return { onMouseEnter, onMouseLeave, onFocus, onTouchStart };
}
