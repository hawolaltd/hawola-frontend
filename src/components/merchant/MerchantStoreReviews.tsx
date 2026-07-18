import React, { useEffect, useMemo, useState } from "react";
import productService from "@/redux/product/productService";

type StoreReview = {
  id: number;
  rating_merchant?: number | string;
  rating_overall?: number | string;
  merchant_comment?: string | null;
  comment?: string | null;
  created_at?: string;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string;
  } | null;
};

function reviewRating(review: StoreReview): number {
  const raw = review.rating_merchant ?? review.rating_overall ?? 0;
  return Math.round(Number(raw) || 0);
}

function reviewerName(review: StoreReview): string {
  const user = review.user;
  if (!user) return "Customer";
  const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return full || user.username || "Customer";
}

export default function MerchantStoreReviews({ merchantSlug }: { merchantSlug: string }) {
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [storeRating, setStoreRating] = useState(0);
  const [storeNumReviews, setStoreNumReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!merchantSlug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await productService.getMerchantStoreReviews(merchantSlug);
        if (cancelled) return;
        setReviews(Array.isArray(data?.results) ? data.results : []);
        setStoreRating(Number(data?.store_rating || 0));
        setStoreNumReviews(Number(data?.store_num_reviews || 0));
      } catch {
        if (!cancelled) {
          setReviews([]);
          setStoreRating(0);
          setStoreNumReviews(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [merchantSlug]);

  const averageRating = useMemo(() => {
    if (storeNumReviews > 0) return storeRating.toFixed(1);
    if (!reviews.length) return "0";
    const sum = reviews.reduce((acc, review) => acc + reviewRating(review), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, storeNumReviews, storeRating]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading reviews…</p>;
  }

  if (!reviews.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-8 text-center">
        <h3 className="text-lg font-medium text-slate-800">No store reviews yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Reviews appear here after customers complete a purchase and confirm delivery.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-amber-400">
          {"★".repeat(Math.round(Number(averageRating) || 0))}
          {"☆".repeat(5 - Math.round(Number(averageRating) || 0))}
        </div>
        <span className="text-sm font-semibold text-slate-800">
          {averageRating} out of 5
        </span>
        <span className="text-sm text-slate-500">
          ({storeNumReviews || reviews.length} review
          {(storeNumReviews || reviews.length) !== 1 ? "s" : ""})
        </span>
      </div>

      <div className="space-y-0 divide-y divide-slate-100">
        {reviews.map((review) => {
          const rating = reviewRating(review);
          const text = review.merchant_comment || review.comment || "";
          return (
            <div key={review.id} className="py-5 first:pt-0">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-700">
                  {reviewerName(review).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-slate-900">{reviewerName(review)}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {"★".repeat(rating)}
                      {"☆".repeat(5 - rating)}
                    </div>
                    {review.created_at ? (
                      <span className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              {text ? (
                <p className="text-[0.9375rem] leading-relaxed text-slate-600">{text}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
