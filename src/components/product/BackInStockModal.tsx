"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getBackInStockStatus,
  resendBackInStockCode,
  subscribeBackInStock,
  verifyBackInStock,
} from "@/services/backInStockService";
import { getUserProfile } from "@/redux/auth/authSlice";
import { useAppDispatch } from "@/hook/useReduxTypes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  isAuthenticated: boolean;
  userEmail?: string | null;
  userPhone?: string | null;
  /** Parent already knows user is on the waitlist */
  alreadySubscribed?: boolean;
  registeredDateLabel?: string | null;
  onSubscribed?: (meta?: { registeredDateLabel?: string | null }) => void;
};

type Step = "form" | "verify" | "done" | "already";

function shortProductName(name: string, max = 42) {
  const trimmed = name.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function alreadyCopy(dateLabel?: string | null) {
  const date = dateLabel || "earlier";
  return (
    `We already know you need this one. ` +
    `We locked in your interest on ${date}, and the moment it restocks, ` +
    `you'll hear from us. Rest easy, we've got you.`
  );
}

export default function BackInStockModal({
  isOpen,
  onClose,
  productId,
  productName,
  isAuthenticated,
  userEmail,
  userPhone,
  alreadySubscribed = false,
  registeredDateLabel = null,
  onSubscribed,
}: Props) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dateLabel, setDateLabel] = useState<string | null>(registeredDateLabel);

  useEffect(() => {
    if (!isOpen) return;
    setCode("");
    setMessage("");
    setEmail(userEmail || "");
    setPhone(userPhone || "");
    setDateLabel(registeredDateLabel || null);

    if (alreadySubscribed) {
      setStep("already");
      setMessage(alreadyCopy(registeredDateLabel));
      return;
    }

    setStep("form");

    if (!isAuthenticated || !productId) return;
    let cancelled = false;
    getBackInStockStatus(productId)
      .then((data) => {
        if (cancelled || !data.subscribed) return;
        setDateLabel(data.registered_date_label || null);
        setMessage(data.detail || alreadyCopy(data.registered_date_label));
        setStep("already");
        onSubscribed?.({ registeredDateLabel: data.registered_date_label });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    userEmail,
    userPhone,
    alreadySubscribed,
    registeredDateLabel,
    isAuthenticated,
    productId,
    onSubscribed,
  ]);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }
    setBusy(true);
    try {
      const data = await subscribeBackInStock({
        product_id: productId,
        email: trimmedEmail,
        phone_number: trimmedPhone,
        source: "web",
      });
      setMessage(data.detail || "");
      setDateLabel(data.registered_date_label || null);
      if (data.needs_verification) {
        setStep("verify");
        toast.message("Check your email for a verification code");
      } else if (data.already_subscribed) {
        setStep("already");
        onSubscribed?.({ registeredDateLabel: data.registered_date_label });
      } else {
        setStep("done");
        onSubscribed?.({ registeredDateLabel: data.registered_date_label });
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not save your request");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error("Enter the verification code");
      return;
    }
    setBusy(true);
    try {
      const data = await verifyBackInStock({
        product_id: productId,
        email: email.trim(),
        code: code.trim(),
      });
      if (data.access) {
        try {
          await dispatch(getUserProfile()).unwrap();
        } catch {
          // Cookies already set; profile refresh is best-effort
        }
      }
      setMessage(data.detail || "We'll let you know when it's available.");
      setStep("done");
      onSubscribed?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Invalid or expired code");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    try {
      const data = await resendBackInStockCode({
        product_id: productId,
        email: email.trim(),
      });
      toast.success(data.detail || "Code resent");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not resend code");
    } finally {
      setBusy(false);
    }
  };

  const title =
    step === "already"
      ? "We've got you covered"
      : step === "done"
        ? "You're on the list"
        : `You will be the first to know when ${
            productName ? `the ${shortProductName(productName)}` : "this product"
          } is available`;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="back-in-stock-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              Out of stock
            </p>
            <h2
              id="back-in-stock-title"
              className="mt-1 text-xl font-bold text-gray-900"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {step === "form" && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-gray-600">
              {isAuthenticated
                ? "Confirm your email. We’ll email you once when it’s back — we won’t spam you."
                : "Enter your email. If you’re new, we’ll send a quick verification code (same as signup) to prevent spam. We promise not to spam you."}
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isAuthenticated && !!userEmail}
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary disabled:bg-gray-50"
                placeholder="you@email.com"
              />
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-3">
              <label className="mb-1 block text-xs font-semibold text-sky-900">
                Phone number <span className="font-normal text-sky-700">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm outline-none focus:border-sky-400"
                placeholder="e.g. 0803…"
              />
              <p className="mt-2 text-xs leading-relaxed text-sky-800">
                Add your number if you want Telegram or WhatsApp alerts when this
                product is available again. Email notification still works without it.
              </p>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              By requesting this service, you agree to our{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-2 hover:text-[#354a73]"
              >
                Terms and Conditions
              </Link>
              .
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handleSubscribe}
              className="mt-2 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-[#354a73] disabled:opacity-60"
            >
              {busy ? "Saving…" : "Notify me when available"}
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-gray-600">
              {message ||
                "Enter the 6-digit code we emailed you. This helps us guide against spam."}
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-center text-lg tracking-[0.3em] outline-none focus:border-primary"
                placeholder="••••••"
                maxLength={6}
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleVerify}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-[#354a73] disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Confirm email"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleResend}
              className="w-full text-sm font-medium text-primary hover:underline disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
        )}

        {(step === "done" || step === "already") && (
          <div className="mt-5">
            <div
              className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                step === "already"
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {step === "already"
                ? message || alreadyCopy(dateLabel)
                : message ||
                  "We'll let you know when this product is available again. We won't spam you."}
            </div>
            {step === "already" && dateLabel ? (
              <p className="mt-3 text-center text-xs font-medium text-gray-500">
                Registered · {dateLabel}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-[#354a73]"
            >
              {step === "already" ? "Alright, thanks" : "Done"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
