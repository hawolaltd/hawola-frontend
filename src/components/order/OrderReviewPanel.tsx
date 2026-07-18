import React, { useEffect, useState } from "react";
import productService from "@/redux/product/productService";
import { toast } from "sonner";

type ReviewStatus = {
  sale_concluded: boolean;
  can_review: boolean;
  is_reviewed: boolean;
  is_merchant_reviewed: boolean;
  customer_review?: {
    rating_product: number;
    rating_shipping: number;
    rating_merchant: number;
    comment?: string;
    merchant_comment?: string;
    created_at?: string;
  } | null;
  merchant_review_of_you?: {
    rating_overall: number;
    rate_communication: number;
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
  const [ratingProduct, setRatingProduct] = useState(5);
  const [ratingShipping, setRatingShipping] = useState(5);
  const [ratingMerchant, setRatingMerchant] = useState(5);
  const [comment, setComment] = useState("");
  const [merchantComment, setMerchantComment] = useState("");

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
        rating_product: ratingProduct,
        rating_shipping: ratingShipping,
        rating_merchant: ratingMerchant,
        comment,
        merchant_comment: merchantComment,
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

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
        Reviews
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Help other shoppers and merchants by sharing your experience after this completed sale.
      </p>

      {status.customer_review ? (
        <div className="mb-4 rounded-lg border border-white bg-white p-4">
          <p className="text-sm font-semibold text-gray-800">Your review</p>
          <p className="mt-2 text-sm text-gray-600">
            Product: {status.customer_review.rating_product}/5 · Shipping:{" "}
            {status.customer_review.rating_shipping}/5 · Merchant:{" "}
            {status.customer_review.rating_merchant}/5
          </p>
          {status.customer_review.comment ? (
            <p className="mt-2 text-sm text-gray-700">{status.customer_review.comment}</p>
          ) : null}
          {status.customer_review.merchant_comment ? (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-medium">About {merchantStoreName || "the merchant"}:</span>{" "}
              {status.customer_review.merchant_comment}
            </p>
          ) : null}
        </div>
      ) : status.can_review ? (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-white bg-white p-4">
          <p className="text-sm font-medium text-gray-800">
            Rate {productName || "this product"} and {merchantStoreName || "the merchant"}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <StarPicker value={ratingProduct} onChange={setRatingProduct} label="Product" />
            <StarPicker value={ratingShipping} onChange={setRatingShipping} label="Shipping" />
            <StarPicker
              value={ratingMerchant}
              onChange={setRatingMerchant}
              label={merchantStoreName ? `${merchantStoreName}` : "Merchant"}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Product review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="What did you think of the product?"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Merchant review
            </label>
            <textarea
              value={merchantComment}
              onChange={(e) => setMerchantComment(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="How was the store's service and communication?"
            />
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
            {merchantStoreName || "Merchant"} reviewed you
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Overall: {status.merchant_review_of_you.rating_overall}/5 · Communication:{" "}
            {status.merchant_review_of_you.rate_communication}/5 · Response time:{" "}
            {status.merchant_review_of_you.rate_response_time}/5
          </p>
          {status.merchant_review_of_you.comment ? (
            <p className="mt-2 text-sm text-gray-700">
              {status.merchant_review_of_you.comment}
            </p>
          ) : null}
        </div>
      ) : status.is_merchant_reviewed ? null : (
        <p className="mt-4 text-xs text-gray-500">
          The merchant may also leave a review about this purchase once the sale is concluded.
        </p>
      )}
    </div>
  );
}
