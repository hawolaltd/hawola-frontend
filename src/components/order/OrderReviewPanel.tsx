import React, { useEffect, useState } from "react";
import productService from "@/redux/product/productService";
import { toast } from "sonner";

type ReviewStatus = {
  sale_concluded: boolean;
  can_review: boolean;
  can_edit?: boolean;
  can_add_follow_up?: boolean;
  is_reviewed: boolean;
  is_merchant_reviewed: boolean;
  customer_review?: {
    rating_shipping: number;
    rating_communication: number;
    rating_experience: number;
    rating_overall: number;
    comment?: string;
    show_first_name?: boolean;
    user_review_images?: { id?: number; image?: string }[];
    created_at?: string;
  } | null;
  follow_up_reviews?: ReviewStatus["customer_review"][];
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
  const [showFirstName, setShowFirstName] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [editing, setEditing] = useState(false);
  const [addingMore, setAddingMore] = useState(false);
  const [followComment, setFollowComment] = useState("");
  const [followImages, setFollowImages] = useState<File[]>([]);
  const [now, setNow] = useState(() => Date.now());

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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const review = status?.customer_review;
  const postedAt = review?.created_at ? new Date(review.created_at).getTime() : 0;
  const canEdit = Boolean(review) && (postedAt ? now < postedAt + 60_000 : Boolean(status?.can_edit));

  useEffect(() => {
    if (editing && !canEdit && !submitting) setEditing(false);
  }, [canEdit, editing, submitting]);

  const startEdit = () => {
    if (!review) return;
    setRatingShipping(Number(review.rating_shipping) || 5);
    setRatingCommunication(Number(review.rating_communication) || 5);
    setRatingExperience(Number(review.rating_experience) || 5);
    setComment(review.comment || "");
    setShowFirstName(Boolean(review.show_first_name));
    setImages([]);
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !status?.can_review) return;
    setSubmitting(true);
    try {
      await productService.submitProductReview({
        orderitem_number: orderitemNumber,
        title: productName ? `Review for ${productName}` : "Order review",
        rating_shipping: ratingShipping,
        rating_communication: ratingCommunication,
        rating_experience: ratingExperience,
        comment,
        show_first_name: showFirstName,
        images,
      });
      toast.success(editing ? "Your review has been updated." : "Thank you! Your review has been submitted.");
      setEditing(false);
      setImages([]);
      const refreshed = await productService.getOrderReviewStatus(orderitemNumber);
      setStatus(refreshed);
      onSubmitted?.();
    } catch (err: any) {
      const data = err?.response?.data;
      let detail = data?.detail || data?.error;
      if (detail && typeof detail !== "string") {
        const first = Object.values(detail).flat().find((item) => typeof item === "string");
        detail = first;
      }
      if (err?.code === "ECONNABORTED") {
        detail = "The review took too long to upload. Please try again.";
      }
      toast.error(typeof detail === "string" ? detail : "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followComment.trim() && followImages.length === 0) {
      toast.error("Add some text or a photo.");
      return;
    }
    setSubmitting(true);
    try {
      await productService.submitProductReview({
        orderitem_number: orderitemNumber,
        title: "Additional review",
        rating_shipping: ratingShipping,
        rating_communication: ratingCommunication,
        rating_experience: ratingExperience,
        comment: followComment,
        show_first_name: showFirstName,
        follow_up: true,
        images: followImages,
      });
      toast.success("Your additional review has been added.");
      setAddingMore(false);
      setFollowComment("");
      setFollowImages([]);
      const refreshed = await productService.getOrderReviewStatus(orderitemNumber);
      setStatus(refreshed);
      onSubmitted?.();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Could not add that review.");
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

  const followUps = status?.follow_up_reviews || [];
  const hasReview = Boolean(review) || followUps.length > 0;
  if (!status?.sale_concluded && !hasReview) {
    return null;
  }

  const photoCount =
    images.length > 0
      ? images.length
      : editing
        ? review?.user_review_images?.length || 0
        : 0;
  const showForm = Boolean(editing || (status?.can_review && !review));
  const merchantReview = status?.merchant_review_of_you;

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
        Review this order
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        You confirmed this delivery. Share how shipping, communication, and the overall
        experience went. You can show your first name, or stay anonymous.
      </p>

      {review && !editing ? (
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
          {canEdit ? (
            <div className="mt-3">
              <p className="text-xs text-gray-500">
                You can edit this review for 1 minute after posting.
              </p>
              <button
                type="button"
                onClick={startEdit}
                className="mt-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit review
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {followUps.map((extra) => (
        <div key={extra?.created_at || extra?.comment} className="mb-4 rounded-lg border border-white bg-white p-4">
          <p className="text-sm font-semibold text-gray-800">Additional review</p>
          {extra?.comment ? <p className="mt-2 text-sm text-gray-700">{extra.comment}</p> : null}
          {extra?.user_review_images && extra.user_review_images.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {extra.user_review_images.map((photo) =>
                photo.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photo.id || photo.image}
                    src={photo.image}
                    alt="Additional review photo"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : null
              )}
            </div>
          ) : null}
        </div>
      ))}

      {review && !editing && !addingMore && followUps.length === 0 && status?.can_add_follow_up ? (
        <button
          type="button"
          onClick={() => {
            setShowFirstName(Boolean(review.show_first_name));
            setAddingMore(true);
          }}
          className="mb-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Add additional review
        </button>
      ) : null}

      {addingMore ? (
        <form onSubmit={handleFollowUp} className="mb-4 space-y-3 rounded-lg border border-white bg-white p-4">
          <p className="text-sm font-medium text-gray-800">Add additional review</p>
          <p className="text-xs text-gray-500">Text and photos only. No stars. You can add this once.</p>
          <textarea
            value={followComment}
            onChange={(e) => setFollowComment(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Add more about this order."
          />
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
              setFollowImages(picked);
            }}
            className="block w-full text-sm text-gray-600"
          />
          <p className="text-xs text-gray-500">{followImages.length} out of 5 images</p>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Add additional review"}
            </button>
            <button type="button" onClick={() => setAddingMore(false)} className="px-3 py-2 text-sm text-gray-600">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {showForm ? (
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
            <p className="mt-1 text-xs text-gray-500">{photoCount} out of 5 images</p>
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showFirstName}
              onChange={(e) => setShowFirstName(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Show my first name on this review
              <span className="mt-0.5 block text-xs text-gray-500">
                Leave this off to stay anonymous.
              </span>
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : editing ? "Save review" : "Leave a review"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md px-3 py-2 text-sm text-gray-600"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {merchantReview ? (
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-sm font-semibold text-gray-800">
            {merchantStoreName || "The store"} rated this order
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Average: {merchantReview.rating_overall}/5 · Communication:{" "}
            {merchantReview.rate_communication}/5 · Payment speed:{" "}
            {merchantReview.rate_payment_speed}/5 · Response:{" "}
            {merchantReview.rate_response_time}/5
          </p>
          {merchantReview.comment ? (
            <p className="mt-2 text-sm text-gray-700">
              {merchantReview.comment}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
