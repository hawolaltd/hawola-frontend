import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useAppSelector } from "@/hook/useReduxTypes";

type ApiReview = {
  id?: number;
  rating_overall?: number | string;
  rating_shipping?: number | string;
  rating_communication?: number | string;
  rating_experience?: number | string;
  rating_product?: number | string;
  rating_merchant?: number | string;
  comment?: string | null;
  created_at?: string;
  reviewer_label?: string;
  is_follow_up?: boolean;
  user_review_images?: { id?: number; image?: string }[];
  additional_review?: {
    id?: number;
    comment?: string | null;
    created_at?: string;
    user_review_images?: { id?: number; image?: string }[];
  } | null;
};

function reviewStars(review: ApiReview): number {
  const raw = review.rating_overall ?? review.rating_experience ?? review.rating_product ?? 0;
  return Math.max(0, Math.min(5, Math.round(Number(raw) || 0)));
}

function ReviewPhotoPopup({
  review,
  startIndex,
  onClose,
}: {
  review: ApiReview;
  startIndex: number;
  onClose: () => void;
}) {
  const photos = (review.user_review_images || []).filter((photo) => photo.image);
  const scroller = useRef<HTMLDivElement>(null);
  const reviewerName = review.reviewer_label || "Anonymous";
  const stars = review.is_follow_up ? 0 : reviewStars(review);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const width = node.clientWidth || 1;
    node.scrollTo({ left: startIndex * width, behavior: "auto" });
  }, [startIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      const node = scroller.current;
      if (!node) return;
      const width = node.clientWidth || 1;
      if (event.key === "ArrowRight") {
        node.scrollBy({ left: width, behavior: "smooth" });
      }
      if (event.key === "ArrowLeft") {
        node.scrollBy({ left: -width, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Review photos"
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative bg-slate-100">
          <div
            ref={scroller}
            className="flex snap-x snap-mandatory overflow-x-auto"
          >
            {photos.map((photo) => (
              <img
                key={photo.id || photo.image}
                src={photo.image}
                alt="Review photo"
                className="h-[58vh] w-full shrink-0 snap-center object-contain"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800"
          >
            Close
          </button>
          {photos.length > 1 ? (
            <p className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
              Scroll for {photos.length} photos
            </p>
          ) : null}
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-primary">{reviewerName}</p>
            {review.is_follow_up ? (
              <p className="text-xs font-medium text-slate-500">Additional review</p>
            ) : (
              <p className="text-orange">
                {"★".repeat(stars)}
                {"☆".repeat(5 - stars)}
              </p>
            )}
          </div>
          {review.comment ? (
            <p className="mt-3 text-sm leading-6 text-slate-800">{review.comment}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No written review.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function score(value: number | string | undefined, fallback?: number | string) {
  const primary = Number(value);
  const number = primary > 0 ? primary : Number(fallback);
  if (!number) return null;
  return number.toFixed(1).replace(/\.0$/, "");
}

const CustomerReviews = () => {
  const { merchantReviews } = useAppSelector((state) => state.products);
  const [viewer, setViewer] = useState<{ review: ApiReview; index: number } | null>(null);
  const reviews: ApiReview[] = merchantReviews?.results || [];
  const ratedReviews = reviews.filter((review) => !review.is_follow_up);

  const ratings = useMemo(() => {
    if (!ratedReviews.length) return [];
    const ratingCounts = [0, 0, 0, 0, 0];
    ratedReviews.forEach((review) => {
      const stars = reviewStars(review);
      if (stars >= 1 && stars <= 5) ratingCounts[stars - 1]++;
    });
    const totalReviews = ratedReviews.length;
    return ratingCounts
      .map((count, index) => ({
        stars: index + 1,
        count,
        percentage: Math.round((count / totalReviews) * 100),
      }))
      .reverse();
  }, [ratedReviews]);

  const averageRating = ratedReviews.length
    ? (
        ratedReviews.reduce((sum, review) => sum + reviewStars(review), 0) / ratedReviews.length
      ).toFixed(1)
    : "0";

  return (
    <>
    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <h2 className="mb-4 text-xl font-semibold text-primary">Customer reviews</h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => {
              const stars = review.is_follow_up ? 0 : reviewStars(review);
              const reviewerName = review.reviewer_label || "Anonymous";
              return (
                <div
                  key={review.id ?? index}
                  className="flex items-start space-x-4 rounded-lg border border-[#dde4f0] p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {reviewerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-primary">
                        {reviewerName}
                      </p>
                      {review.is_follow_up ? (
                        <p className="text-xs font-medium text-slate-500">Additional review</p>
                      ) : (
                        <div className="text-orange">
                          {"★".repeat(stars)}
                          {"☆".repeat(5 - stars)}
                        </div>
                      )}
                    </div>
                    {review.created_at ? (
                      <p className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString()}
                        {!review.is_follow_up && score(review.rating_overall)
                          ? ` · Average ${score(review.rating_overall)}/5`
                          : ""}
                      </p>
                    ) : null}
                    {review.is_follow_up ? null : (
                      <p className="mt-1 text-xs text-slate-600">
                        Shipping {score(review.rating_shipping) || "—"}/5 · Communication{" "}
                        {score(review.rating_communication, review.rating_merchant) || "—"}/5 · Overall
                        experience {score(review.rating_experience, review.rating_product) || "—"}/5
                      </p>
                    )}
                    {review.comment ? (
                      <p className="mt-2 text-sm text-primary">{review.comment}</p>
                    ) : null}
                    {review.additional_review ? (
                      <div className="mt-3 rounded-lg border border-[#e8edf6] bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-600">Additional review</p>
                        {review.additional_review.comment ? (
                          <p className="mt-2 text-sm text-primary">{review.additional_review.comment}</p>
                        ) : null}
                        {review.additional_review.user_review_images &&
                        review.additional_review.user_review_images.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {review.additional_review.user_review_images.map((photo, photoIndex) =>
                              photo.image ? (
                                <button
                                  key={photo.id || photo.image}
                                  type="button"
                                  onClick={() =>
                                    setViewer({
                                      review: {
                                        comment: review.additional_review?.comment,
                                        reviewer_label: reviewerName,
                                        is_follow_up: true,
                                        user_review_images: review.additional_review?.user_review_images,
                                      },
                                      index: photoIndex,
                                    })
                                  }
                                  className="overflow-hidden rounded-lg"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={photo.image}
                                    alt="Additional review photo"
                                    className="h-16 w-16 object-cover"
                                  />
                                </button>
                              ) : null
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {review.user_review_images && review.user_review_images.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.user_review_images.map((photo, photoIndex) =>
                          photo.image ? (
                            <button
                              key={photo.id || photo.image}
                              type="button"
                              onClick={() => setViewer({ review, index: photoIndex })}
                              className="overflow-hidden rounded-lg"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.image}
                                alt="Review photo"
                                className="h-20 w-20 object-cover"
                              />
                            </button>
                          ) : null
                        )}
                      </div>
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
        {ratedReviews.length > 0 ? (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-orange">★★★★★</span>
              <span className="text-sm font-semibold text-primary">
                {averageRating} out of 5
              </span>
              <span className="text-sm text-gray-500">({ratedReviews.length} reviews)</span>
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
    {viewer ? (
      <ReviewPhotoPopup
        review={viewer.review}
        startIndex={viewer.index}
        onClose={() => setViewer(null)}
      />
    ) : null}
    </>
  );
};

export default CustomerReviews;
