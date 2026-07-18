import React, { useMemo } from "react";
import Image from "next/image";
import { useAppSelector } from "@/hook/useReduxTypes";

type ApiReview = {
  id?: number;
  rating_overall?: number | string;
  rating_product?: number | string;
  comment?: string | null;
  created_at?: string;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string;
  } | null;
};

function reviewStars(review: ApiReview): number {
  const raw = review.rating_overall ?? review.rating_product ?? 0;
  return Math.max(0, Math.min(5, Math.round(Number(raw) || 0)));
}

function reviewerName(review: ApiReview): string {
  const user = review.user;
  if (!user) return "Customer";
  const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return full || user.username || "Customer";
}

const CustomerReviews = () => {
  const { merchantReviews } = useAppSelector((state) => state.products);
  const reviews: ApiReview[] = merchantReviews?.results || [];

  const ratings = useMemo(() => {
    if (!reviews.length) return [];
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      const stars = reviewStars(review);
      if (stars >= 1 && stars <= 5) ratingCounts[stars - 1]++;
    });
    const totalReviews = reviews.length;
    return ratingCounts
      .map((count, index) => ({
        stars: index + 1,
        count,
        percentage: Math.round((count / totalReviews) * 100),
      }))
      .reverse();
  }, [reviews]);

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + reviewStars(review), 0) / reviews.length
      ).toFixed(1)
    : "0";

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <h2 className="mb-4 text-xl font-semibold text-primary">Customer reviews</h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => {
              const stars = reviewStars(review);
              return (
                <div
                  key={review.id ?? index}
                  className="flex items-start space-x-4 rounded-lg border border-[#dde4f0] p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {reviewerName(review).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-primary">{reviewerName(review)}</p>
                      <div className="text-orange">
                        {"★".repeat(stars)}
                        {"☆".repeat(5 - stars)}
                      </div>
                    </div>
                    {review.created_at ? (
                      <p className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    ) : null}
                    {review.comment ? (
                      <p className="mt-2 text-sm text-primary">{review.comment}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-[#dde4f0] p-8 text-center">
            <Image
              src="/assets/no-reviews.webp"
              alt="No reviews"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="mb-2 text-lg font-medium text-primary">No reviews yet</h3>
            <p className="text-sm text-gray-500">
              Be the first to share your thoughts about this product!
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-primary">Rating summary</h2>
        {reviews.length > 0 ? (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-orange">★★★★★</span>
              <span className="text-sm font-semibold text-primary">
                {averageRating} out of 5
              </span>
              <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
            </div>

            <div className="mt-4 space-y-2">
              {ratings.map((rating) => (
                <div key={rating.stars} className="flex items-center space-x-2">
                  <span className="w-[15%] text-xs text-[#08a9ed]">{rating.stars} star</span>
                  <div className="h-4 w-full bg-[#f2f2f2]">
                    <div
                      className="flex h-4 items-center justify-center bg-[#08a9ed]"
                      style={{ width: `${rating.percentage}%` }}
                    >
                      <span className="text-xs text-white">
                        {rating.count} ({rating.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4 text-sm text-gray-500">
            No ratings yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReviews;
