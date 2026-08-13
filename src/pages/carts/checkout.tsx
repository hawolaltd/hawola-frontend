import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import AuthLayout from "@/components/layout/AuthLayout";
import { formatCurrency, featuredImageCardUrl } from "@/util";
import { toast } from "sonner";
import { updatePayment } from "@/redux/product/productSlice";
import dynamic from "next/dynamic";
import { getUserProfile } from "@/redux/auth/authSlice";
import { getSiteSettings } from "@/redux/general/generalSlice";
import { wrapper } from "@/store/store";
import type { PaystackProps } from "react-paystack/libs/types";
import Link from "next/link";
import {
  richTextHasVisibleContent,
  sanitizeRichNotice,
} from "@/util/sanitizeRichNotice";
import {
  buildContentsFromOrderItems,
  trackTikTokAddPaymentInfo,
  tikTokIdentityFromProfile,
} from "@/lib/tiktokPixel";
import {
  orderHasSelfPurchase,
  SELF_PURCHASE_CHECKOUT_MESSAGE,
} from "@/util/merchantSelfPurchase";

/** Opens Paystack once when mounted — no dependency on changing `config` objects (avoids re-initializing on every render). */
const PaystackOpenOnce = dynamic(
  () =>
    import("react-paystack").then((mod) => {
      function Inner(props: { config: PaystackProps; onSuccess: () => void }) {
        const initializePayment = mod.usePaystackPayment(props.config);
        useEffect(() => {
          initializePayment({ onSuccess: () => props.onSuccess() });
          // Intentionally once per mount; parent remounts via `key` when opening checkout payment.
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return null;
      }
      return Inner;
    }),
  { ssr: false }
);

type PaymentChoice = "pod" | "card";

const CheckoutPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orders, isLoading: loading } = useAppSelector(
    (state) => state.products
  );
  const { profile } = useAppSelector((state) => state.auth);
  const tikTokIdentity = tikTokIdentityFromProfile(profile);
  const siteSettings = useAppSelector((state) => state.general.siteSettings);
  const siteSettingsLoaded = useAppSelector(
    (state) => state.general.siteSettingsLoaded
  );
  const escrowDisabled =
    siteSettings != null && siteSettings.accept_escrow_payment === false;

  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("pod");

  const nonEscrowCheckoutNoticeSafe = useMemo(() => {
    if (!escrowDisabled) return "";
    const raw = (
      siteSettings?.non_escrow_cart_notice_html as string | undefined
    )?.trim();
    if (!raw) return "";
    return sanitizeRichNotice(raw);
  }, [escrowDisabled, siteSettings?.non_escrow_cart_notice_html]);

  const offlineDisclaimerSafe = useMemo(() => {
    const raw = (
      siteSettings?.offline_payment_disclaimer as string | undefined
    )?.trim();
    if (!raw) return "";
    return sanitizeRichNotice(raw);
  }, [siteSettings?.offline_payment_disclaimer]);

  const shippingAddressLine = useMemo(() => {
    const addr = orders?.shipping_address;
    if (!addr) return "";
    const city =
      typeof addr.city === "object" && addr.city !== null
        ? addr.city.name
        : typeof addr.city === "string"
          ? addr.city
          : "";
    const state =
      typeof addr.state === "object" && addr.state !== null
        ? addr.state.name
        : typeof addr.state === "string"
          ? addr.state
          : "";
    return [city, state].filter(Boolean).join(", ");
  }, [orders?.shipping_address]);

  const shippingCountryLine = useMemo(() => {
    const country = orders?.shipping_address?.country;
    if (!country) return "";
    if (typeof country === "object" && country !== null && "name" in country) {
      return String(country.name || "");
    }
    return typeof country === "string" ? country : "";
  }, [orders?.shipping_address?.country]);

  const showUnpaidBadges =
    Boolean(orders) && (escrowDisabled || paymentMethod === "pod");
  const primaryIsUnpaid = showUnpaidBadges;
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);
  const [paymentConfirming, setPaymentConfirming] = useState(false);
  /** Bumps when we open Paystack so the dynamic component remounts and runs `initializePayment` exactly once. */
  const [paystackMountKey, setPaystackMountKey] = useState(0);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string;

  React.useEffect(() => {
    if (publicKey && publicKey.startsWith("sk_")) {
      console.error(
        "ERROR: Paystack secret key (sk_) detected in NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY."
      );
      toast.error("Payment configuration error. Please contact support.");
    }
  }, [publicKey]);

  const checkoutContents = useMemo(
    () => buildContentsFromOrderItems(orders?.orderItems || []),
    [orders?.orderItems]
  );
  const checkoutValue = useMemo(
    () => Number(orders?.totalPriceDue || orders?.totalPrice || 0),
    [orders?.totalPriceDue, orders?.totalPrice]
  );

  const couponDiscount = useMemo(
    () => Number((orders as any)?.coupon_discount || 0),
    [orders]
  );
  const couponCode = useMemo(
    () => String((orders as any)?.coupon_code || "").trim(),
    [orders]
  );
  const goodsTotal = useMemo(
    () => Number(orders?.totalPrice || 0),
    [orders?.totalPrice]
  );
  const shippingTotal = useMemo(
    () => Number(orders?.shippingPrice || 0),
    [orders?.shippingPrice]
  );
  const dueTotal = useMemo(
    () => Number(orders?.totalPriceDue || orders?.totalPrice || 0),
    [orders?.totalPriceDue, orders?.totalPrice]
  );
  const beforeCouponTotal = useMemo(
    () => dueTotal + (couponDiscount > 0 ? couponDiscount : 0),
    [dueTotal, couponDiscount]
  );

  const checkoutBlockedBySelfPurchase = useMemo(
    () => orderHasSelfPurchase(orders?.orderItems, profile),
    [orders?.orderItems, profile]
  );

  useEffect(() => {
    if (!orders?.order_number) return;
    trackTikTokAddPaymentInfo({
      value: checkoutValue,
      contents: checkoutContents,
      identity: tikTokIdentity,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders?.order_number]);

  const paystackConfig = useMemo<PaystackProps>(
    () => ({
      reference: (orders?.payment_reference as string) || "",
      email: (profile?.email as string) || "",
      amount: Math.round(
        Number(orders?.totalPriceDue || orders?.totalPrice || 0) * 100
      ),
      publicKey: publicKey || "",
    }),
    [
      orders?.payment_reference,
      orders?.totalPriceDue,
      orders?.totalPrice,
      profile?.email,
      publicKey,
    ]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = sessionStorage.getItem("PAYMENT_COMPLETED");
      if (done === "1") {
        setShowPaystack(false);
        setPaymentConfirming(false);
      }
    }
    return () => {
      setShowPaystack(false);
      setPaymentConfirming(false);
    };
  }, []);

  /** Pay on delivery or direct-merchant path (no online capture). */
  const handleUnpaidComplete = useCallback(
    async (method: "pay_on_delivery" | "direct_merchant") => {
      if (!orders?.order_number) return;
      if (checkoutBlockedBySelfPurchase) {
        toast.error(SELF_PURCHASE_CHECKOUT_MESSAGE);
        return;
      }
      setProcessingPayment(true);
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("PAYMENT_COMPLETED", "1");
        }
        const res = await dispatch(
          updatePayment({
            payment_reference: `${method}-${orders.order_number}`,
            order_id: orders.order_number,
            payment_method: method,
            is_offline_payment: true,
          })
        );
        if (res.type.includes("fulfilled")) {
          toast.success("Order placed.");
          router.push("/order/order-confirmation");
        } else {
          toast.error("Could not complete order. Please try again.");
        }
      } catch {
        toast.error("Could not complete order.");
      } finally {
        setProcessingPayment(false);
      }
    },
    [dispatch, orders?.order_number, router, checkoutBlockedBySelfPurchase]
  );

  const handleCardPay = async () => {
    if (checkoutBlockedBySelfPurchase) {
      toast.error(SELF_PURCHASE_CHECKOUT_MESSAGE);
      return;
    }
    if (escrowDisabled) {
      toast.error("Card payment is not available while escrow is disabled.");
      return;
    }
    if (!publicKey || publicKey.startsWith("sk_")) {
      toast.error("Card payment is not configured.");
      return;
    }
    setProcessingPayment(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("PAYMENT_COMPLETED");
      }
      const res = await dispatch(
        updatePayment({
          payment_reference: orders?.payment_reference ?? "4yrg0exv8o",
          order_id: orders?.order_number,
          payment_method: "paystack",
          is_offline_payment: false,
        })
      );

      if (res.type.includes("fulfilled")) {
        trackTikTokAddPaymentInfo({
          value: checkoutValue,
          contents: checkoutContents,
          identity: tikTokIdentity,
        });
        setPaystackMountKey((k) => k + 1);
        setShowPaystack(true);
      }
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const onPrimaryCheckout = () => {
    if (checkoutBlockedBySelfPurchase) {
      toast.error(SELF_PURCHASE_CHECKOUT_MESSAGE);
      return;
    }
    if (escrowDisabled || paymentMethod === "pod") {
      void handleUnpaidComplete(
        escrowDisabled ? "direct_merchant" : "pay_on_delivery"
      );
      return;
    }
    void handleCardPay();
  };

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (!siteSettingsLoaded) {
      void dispatch(getSiteSettings());
    }
  }, [dispatch, siteSettingsLoaded]);

  if (loading) {
    return (
      <AuthLayout>
        <div className="bg-gradient-to-b from-[#f4f6fb] via-white to-white">
          <div className="mx-auto flex w-full max-w-screen-xl justify-center px-4 py-20 md:px-6 xl:px-0">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-detailsBorder border-t-primary" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!orders) {
    return (
      <AuthLayout>
        <div className="bg-gradient-to-br from-headerBg/10 via-white to-secondaryTextColor/20">
          <div className="mx-auto w-full max-w-screen-xl px-4 py-16 text-center md:px-6 xl:px-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondaryTextColor">
              Hawola
            </p>
            <h2 className="mt-3 font-sans text-3xl font-bold text-headerBg">
              Order not found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Your checkout session may have expired. Return to the cart to start
              again.
            </p>
            <button
              type="button"
              onClick={() => router.push("/carts")}
              className="mt-6 inline-flex rounded-full bg-headerBg px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-primary"
            >
              Back to cart
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const itemCount = orders?.orderItems?.length || 0;
  const ctaLabel = processingPayment
    ? primaryIsUnpaid
      ? "Placing order…"
      : "Processing payment…"
    : checkoutBlockedBySelfPurchase
      ? "Cannot buy from your store"
      : primaryIsUnpaid
        ? escrowDisabled
          ? "Complete order"
          : "Place order"
        : `Pay ${formatCurrency(dueTotal.toFixed(2))} with card`;

  const paymentHint = escrowDisabled
    ? "Pay the seller directly"
    : paymentMethod === "pod"
      ? "Pay on delivery"
      : "Card via Paystack";

  const orderTotalCard = (
    <div id="checkout-order-total" className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f4d] via-[#152d5c] to-[#1e3a7a] p-5 shadow-[0_10px_40px_rgba(11,31,77,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
          Order total
        </p>
        <p className="mt-2 text-[2.5rem] font-extrabold leading-none tracking-tight text-white">
          {formatCurrency(dueTotal.toFixed(2))}
        </p>
        <p className="mt-3 text-xs text-white/70">{paymentHint}</p>
        {couponDiscount > 0 ? (
          <p className="mt-2 inline-flex rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
            Coupon savings {formatCurrency(couponDiscount.toFixed(2))}
            {couponCode ? ` · ${couponCode}` : ""}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md">
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold tabular-nums text-headerBg">
              {formatCurrency(goodsTotal.toFixed(2))}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="font-semibold tabular-nums text-headerBg">
              {formatCurrency(shippingTotal.toFixed(2))}
            </span>
          </div>
          {couponDiscount > 0 ? (
            <div className="flex justify-between text-secondaryTextColor">
              <span>Coupon discount</span>
              <span className="font-semibold tabular-nums">
                -{formatCurrency(couponDiscount.toFixed(2))}
              </span>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void onPrimaryCheckout()}
          disabled={processingPayment || checkoutBlockedBySelfPurchase}
          className={`mt-5 flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition ${
            processingPayment || checkoutBlockedBySelfPurchase
              ? "cursor-not-allowed bg-primary/40 shadow-none"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {processingPayment ? (
            <>
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {ctaLabel}
            </>
          ) : (
            ctaLabel
          )}
        </button>
        <p className="mt-3 text-center text-xs leading-relaxed text-textPadded">
          By placing this order you agree to Hawola’s terms and the seller’s
          delivery arrangements.
        </p>
      </div>
    </div>
  );

  return (
    <AuthLayout>
      <div className="min-h-[70vh] bg-gradient-to-b from-[#f4f6fb] via-white to-white max-lg:pb-[calc(7.25rem+env(safe-area-inset-bottom))]">
        <div className="bg-[#0b1f4d]">
          <div className="mx-auto flex w-full max-w-screen-xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b9c7ea] md:px-6 xl:px-0">
            <span>Secure checkout</span>
            {orders?.order_number ? (
              <span className="normal-case tracking-normal text-white/90">
                Order {orders.order_number}
              </span>
            ) : null}
          </div>
        </div>

        {showPaystack && !escrowDisabled && paymentMethod === "card" && (
          <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-headerBg/50 px-4">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-md">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-detailsBorder border-t-primary" />
                <h3 className="font-sans text-xl font-bold text-headerBg">
                  Waiting for payment…
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Complete your payment in the Paystack window.
                </p>
              </div>
            </div>
            <PaystackOpenOnce
              key={paystackMountKey}
              config={paystackConfig}
              onSuccess={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("PAYMENT_COMPLETED", "1");
                }
                setShowPaystack(false);
                setPaymentConfirming(true);
                router.push("/order/order-confirmation");
              }}
            />
          </>
        )}

        {paymentConfirming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-headerBg/50 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-md">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-detailsBorder border-t-primary" />
              <h3 className="font-sans text-xl font-bold text-headerBg">
                Confirming your order…
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Please wait while we finalize your order.
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-6 md:py-8 xl:px-0">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-deepOrange">
                Almost there
              </p>
              <h1 className="mt-1 font-sans text-3xl font-bold text-headerBg md:text-4xl">
                Checkout
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Review your items, delivery address, and payment to finish this
                order.
              </p>
            </div>
            <Link
              href="/carts"
              className="text-sm font-semibold text-primary underline-offset-4 hover:text-deepOrange hover:underline"
            >
              ← Back to cart
            </Link>
          </div>

          {checkoutBlockedBySelfPurchase ? (
            <div
              className="mb-6 rounded-2xl border border-amber-300/90 bg-amber-50 p-5 text-sm text-amber-950"
              role="alert"
            >
              <p className="font-semibold">{SELF_PURCHASE_CHECKOUT_MESSAGE}</p>
              <p className="mt-2 text-amber-900/80">
                Remove your products from the cart and create a new order to
                continue.
              </p>
              <button
                type="button"
                onClick={() => router.push("/carts")}
                className="mt-4 rounded-full bg-headerBg px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary"
              >
                Back to cart
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-1 flex-col gap-4 lg:w-2/3">
              <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md">
                <div className="bg-gradient-to-br from-headerBg to-primary px-5 py-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    Bag
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold">
                    Your items ({itemCount})
                  </h2>
                </div>
                <div className="divide-y divide-slate-100 px-4 sm:px-5">
                  {orders?.orderItems?.map((item: any) => (
                    <div
                      key={item?.id}
                      className="flex gap-3 py-4 first:pt-4 last:pb-4"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-filterBg ring-1 ring-slate-200/80">
                        <img
                          src={featuredImageCardUrl(
                            item?.product?.featured_image?.[0]
                          )}
                          alt={item?.product?.name || "Product"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-headerBg">
                          <span className="truncate">{item?.product?.name}</span>
                          {showUnpaidBadges ? (
                            <span className="inline-flex shrink-0 rounded-full bg-deepOrange/15 px-2 py-0.5 text-[10px] font-bold text-headerBg">
                              Unpaid
                            </span>
                          ) : null}
                        </h3>
                        <p className="mt-1 text-sm text-textPadded">
                          Qty {item?.qty}
                        </p>
                        {item?.variant?.length > 0 ? (
                          <div className="mt-1 space-y-0.5">
                            {item.variant.map((v: any, i: number) => (
                              <p key={i} className="text-xs text-slate-500">
                                {v.variant?.name}: {v.variant_value?.value}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold tabular-nums text-headerBg">
                          {formatCurrency(
                            (item?.order_price * item?.qty).toFixed(2)
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-textPadded">
                          Ship{" "}
                          {formatCurrency((+item?.shipping_price).toFixed(2))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md">
                <div className="border-b border-[#CAD6EC] pb-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-textPadded">
                    Delivery
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-primary">
                    Shipping address
                  </h2>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-slate-700">
                  <p className="font-semibold text-headerBg">
                    {orders?.shipping_address?.first_name}{" "}
                    {orders?.shipping_address?.last_name}
                  </p>
                  <p className="mt-1">{orders?.shipping_address?.address}</p>
                  {shippingAddressLine ? <p>{shippingAddressLine}</p> : null}
                  {shippingCountryLine ? <p>{shippingCountryLine}</p> : null}
                  {orders?.shipping_address?.phone ? (
                    <p className="mt-2 text-textPadded">
                      Phone {orders.shipping_address.phone}
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md">
                <div className="border-b border-[#CAD6EC] pb-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-textPadded">
                    Pay
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-primary">
                    Payment method
                  </h2>
                </div>
                <div className="mt-4 space-y-3">
                  {escrowDisabled &&
                  richTextHasVisibleContent(nonEscrowCheckoutNoticeSafe) ? (
                    <div
                      className="rounded-xl border border-amber-200/90 bg-amber-50 p-4 text-sm text-slate-800 prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{
                        __html: nonEscrowCheckoutNoticeSafe,
                      }}
                    />
                  ) : null}
                  {(escrowDisabled || paymentMethod === "pod") &&
                  richTextHasVisibleContent(offlineDisclaimerSafe) ? (
                    <div
                      className="rounded-xl border border-slate-200 bg-filterBg p-4 text-sm text-slate-700 prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{
                        __html: offlineDisclaimerSafe,
                      }}
                    />
                  ) : null}

                  {escrowDisabled ? (
                    <p className="text-sm text-slate-600">
                      Complete your purchase with the button in the order total.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("pod")}
                        className={`rounded-2xl border px-4 py-3.5 text-left transition ${
                          paymentMethod === "pod"
                            ? "border-primary bg-primary/[0.06] ring-1 ring-primary"
                            : "border-slate-200 bg-white hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-headerBg">
                            Pay on delivery
                          </p>
                          <span
                            className={`h-4 w-4 rounded-full border-2 ${
                              paymentMethod === "pod"
                                ? "border-primary bg-primary"
                                : "border-slate-300"
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Pay when your order arrives, as agreed with the
                          seller.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`rounded-2xl border px-4 py-3.5 text-left transition ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/[0.06] ring-1 ring-primary"
                            : "border-slate-200 bg-white hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-headerBg">
                            Card (Paystack)
                          </p>
                          <span
                            className={`h-4 w-4 rounded-full border-2 ${
                              paymentMethod === "card"
                                ? "border-primary bg-primary"
                                : "border-slate-300"
                            }`}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <img
                            src="/assets/visa.webp"
                            alt="Visa"
                            className="h-5"
                          />
                          <img
                            src="/assets/mastercard.png"
                            alt="Mastercard"
                            className="h-5"
                          />
                          <img
                            src="/assets/amex.jpg"
                            alt="American Express"
                            className="h-5"
                          />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="hidden w-full lg:sticky lg:top-24 lg:block lg:w-1/3">
              {orderTotalCard}
            </aside>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#0b1f4d]/20 bg-gradient-to-br from-[#0b1f4d] via-[#152d5c] to-[#1e3a7a] px-4 pt-3 shadow-[0_-10px_30px_rgba(11,31,77,0.25)] lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-screen-xl items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                Order total
              </p>
              <p className="mt-0.5 truncate text-xl font-extrabold tabular-nums text-white">
                {formatCurrency(dueTotal.toFixed(2))}
              </p>
              <p className="mt-0.5 truncate text-xs text-white/65">
                {paymentHint}
                {couponDiscount > 0 ? " · coupon on" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void onPrimaryCheckout()}
              disabled={processingPayment || checkoutBlockedBySelfPurchase}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
                processingPayment || checkoutBlockedBySelfPurchase
                  ? "cursor-not-allowed bg-white/20"
                  : "bg-primary active:bg-primary/90"
              }`}
            >
              {processingPayment
                ? "…"
                : checkoutBlockedBySelfPurchase
                  ? "Blocked"
                  : primaryIsUnpaid
                    ? escrowDisabled
                      ? "Complete"
                      : "Place order"
                    : "Pay now"}
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    await store.dispatch(getUserProfile());
    await store.dispatch(getSiteSettings());
    return {
      props: {},
    };
  }
);

export default CheckoutPage;
