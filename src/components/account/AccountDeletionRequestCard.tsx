import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import authService from "@/redux/auth/authService";

type AccountDeletionRequestCardProps = {
  compact?: boolean;
};

export default function AccountDeletionRequestCard({
  compact = false,
}: AccountDeletionRequestCardProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!confirmed) {
      toast.error("Please confirm that you understand this action.");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.requestAccountDeletion(
        message.trim() || undefined
      );
      toast.success(data.detail || "Your request has been submitted.");
      setMessage("");
      setConfirmed(false);
      setSubmitted(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(
        err.response?.data?.detail ||
          "Could not submit your request. Try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-5 text-sm text-green-900">
        <p className="font-semibold">Request received</p>
        <p className="mt-2 text-green-800">
          Support will confirm by email when your account and associated data have been handled.
          Some records may be retained where required by law or for open orders.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50/40 ${
        compact ? "px-4 py-4" : "px-5 py-6"
      }`}
    >
      <h3 className="text-base font-semibold text-[#0E224D]">
        Request account deletion
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Ask Hawola to permanently close your account and remove associated personal data,
        including your profile, saved addresses, wishlist, buying requests, and chat history
        where applicable. Order records may be kept for legal, tax, or dispute-resolution
        purposes. This cannot be undone once processed.
      </p>

      <div className="mt-4">
        <label
          htmlFor="deletion-message"
          className="block text-sm font-medium text-gray-700"
        >
          Optional message
        </label>
        <textarea
          id="deletion-message"
          rows={compact ? 3 : 4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          placeholder="Add context (optional), e.g. reason or linked email if different from login."
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
        />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-deepOrange focus:ring-deepOrange"
        />
        <span>
          I understand that my account deletion will be reviewed by Hawola, may affect my orders
          and saved data, and cannot be undone once processed.
        </span>
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Submitting…" : "Submit deletion request"}
        </button>
        {!compact ? (
          <Link
            href="/account?tab=profile"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to account
          </Link>
        ) : null}
      </div>
    </div>
  );
}
