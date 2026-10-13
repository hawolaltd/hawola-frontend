import React, { useEffect, useState } from "react";
import productService from "@/redux/product/productService";
import { toast } from "sonner";

type ReviewStatus = {
  sale_concluded: boolean;
  can_review: boolean;
  is_reviewed: boolean;
  is_merchant_reviewed: boolean;
  customer_review?: {
    rating_shipping: number;
    rating_communication: number;
    rating_experience: number;
    rating_overall: number;
    comment?: string;
    user_review_images?: { id?: number; image?: string }[];
    created_at?: string;
  } | null;
  merchant_review_of_you?: {
    rating_overall: number;
    rate_communication: number;
    rate_payment_speed: number;
    rate_response_time: number;
    comment?: string;
    created_at?: string;
  } | null;
};

function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-xl ${
              star <= value ? "text-amber-400" : "text-gray-300"
            }`}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OrderReviewPanel({
  orderitemNumber,
  productName,
  merchantStoreName,
  onSubmitted,
}: {
  orderitemNumber: string;
  productName?: string;
  merchantStoreName?: string;
  onSubmitted?: () => void;
}) {
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratingShipping, setRatingShipping] = useState(5);
  const [ratingCommunication, setRatingCommunication] = useState(5);
  const [ratingExperience, setRatingExperience] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (!orderitemNumber) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await productService.getOrderReviewStatus(orderitemNumber);
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) setStatus(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderitemNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status?.can_review) return;
    setSubmitting(true);
    try {
      await productService.submitProductReview({
        orderitem_number: orderitemNumber,
        title: productName ? `Review for ${productName}` : "Order review",
        rating_shipping: ratingShipping,
        rating_communication: ratingCommunication,
        rating_experience: ratingExperience,
        comment,
        images,
      });
      toast.success("Thank you! Your review has been submitted.");
      const refreshed = await productService.getOrderReviewStatus(orderitemNumber);
      setStatus(refreshed);
      onSubmitted?.();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.response?.data?.error;
      toast.error(typeof detail === "string" ? detail : "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-500">
        Loading review options…
      </div>
    );
  }

  if (!status?.sale_concluded) {
    return null;
  }

  const review = status.customer_review;

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
        Review this order
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        You confirmed this delivery. Share how shipping, communication, and the overall
        experience went. Your name stays hidden on the product page.
      </p>

      {review ? (
        <div className="mb-4 rounded-lg border border-white bg-white p-4">
          <p className="text-sm font-semibold text-gray-800">Your review</p>
          <p className="mt-2 text-sm text-gray-600">
            Shipping: {review.rating_shipping}/5 · Communication: {review.rating_communication}/5 ·
            Overall experience: {review.rating_experience}/5 · Average: {review.rating_overall}/5
          </p>
          {review.comment ? (
            <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
          ) : null}
          {review.user_review_images && review.user_review_images.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {review.user_review_images.map((photo) =>
                photo.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photo.id || photo.image}
                    src={photo.image}
                    alt="Your review photo"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : null
              )}
            </div>
          ) : null}
        </div>
      ) : status.can_review ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-white bg-white p-4">
          <p className="text-sm font-medium text-gray-800">
            Rate {productName || "this product"}
            {merchantStoreName ? ` from ${merchantStoreName}` : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <StarPicker value={ratingShipping} onChange={setRatingShipping} label="Shipping" />
            <StarPicker
              value={ratingCommunication}
              onChange={setRatingCommunication}
              label="Communication"
            />
            <StarPicker
              value={ratingExperience}
              onChange={setRatingExperience}
              label="Overall experience"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Written review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Tell other shoppers how this order went."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Photos (up to 5)
            </label>
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={(e) => {
                const picked = Array.from(e.target.files || []).slice(0, 5);
                const tooLarge = picked.find((file) => file.size > 20 * 1024 * 1024);
                if (tooLarge) {
                  toast.error("Each photo must be 20 MB or smaller.");
                  e.target.value = "";
                  return;
                }
                setImages(picked);
              }}
              className="block w-full text-sm text-gray-600"
            />
            <p className="mt-1 text-xs text-gray-500">
              iPhone photos are fine up to 20 MB each. They are reduced before they are saved.
              {images.length ? ` ${images.length} of 5 selected.` : ""}
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      ) : null}

      {status.merchant_review_of_you ? (
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-sm font-semibold text-gray-800">
            {merchantStoreName || "The store"} rated this order
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Average: {status.merchant_review_of_you.rating_overall}/5 · Communication:{" "}
            {status.merchant_review_of_you.rate_communication}/5 · Payment speed:{" "}
            {status.merchant_review_of_you.rate_payment_speed}/5 · Response:{" "}
            {status.merchant_review_of_you.rate_response_time}/5
          </p>
          {status.merchant_review_of_you.comment ? (
            <p className="mt-2 text-sm text-gray-700">
              {status.merchant_review_of_you.comment}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
