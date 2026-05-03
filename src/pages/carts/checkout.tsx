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
  const siteSettings = useAppSelector((state) => state.general.siteSettings);
  const siteSettingsLoaded = useAppSelector(
    (state) => state.general.siteSettingsLoaded
  );
  const escrowDisabled =
    siteSettings != null && siteSettings.accept_escrow_payment === false;

  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("pod");
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
    [dispatch, orders?.order_number, router]
  );

  const handleCardPay = async () => {
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
    if (escrowDisabled || paymentMethod === "pod") {
      void handleUnpaidComplete(escrowDisabled ? "direct_merchant" : "pay_on_delivery");
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
        <div className="mx-auto flex w-full max-w-screen-xl justify-center max-md:bg-slate-100 max-md:px-3 max-md:py-8 md:px-6 md:py-8 xl:px-0">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AuthLayout>
    );
  }

  if (!orders) {
    return (
      <AuthLayout>
        <div className="mx-auto w-full max-w-screen-xl max-md:bg-slate-100 max-md:px-3 max-md:py-8 md:px-6 md:py-8 xl:px-0 text-center">
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-red-600 max-md:text-lg">
              Order not found
            </h2>
            <button
              type="button"
              onClick={() => router.push("/carts")}
              className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-dark"
            >
              Back to cart
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const showUnpaidBadges = escrowDisabled || paymentMethod === "pod";
  const primaryIsUnpaid = escrowDisabled || paymentMethod === "pod";

  const cardShell =
    "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";

  return (
    <AuthLayout>
      <div className="relative mx-auto w-full max-w-screen-xl max-md:bg-slate-100 max-md:px-3 max-md:py-5 md:px-6 md:py-8 xl:px-0">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {showPaystack && !escrowDisabled && paymentMethod === "card" && (
          <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
                <div className="mx-auto mb-4 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
                <h3 className="text-lg font-semibold mb-1">Waiting for payment...</h3>
                <p className="text-sm text-gray-600">
                  Please complete your payment in the Paystack window.
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
              <div className="mx-auto mb-4 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              <h3 className="text-lg font-semibold mb-1">Confirming your order...</h3>
              <p className="text-sm text-gray-600">
                Please wait while we finalize your order.
              </p>
            </div>
          </div>
        )}

        <h1 className="mb-8 text-3xl font-bold text-headerBg max-md:mb-4 max-md:text-xl">
          Checkout
        </h1>

        {/* Single column on all breakpoints — matches mobile cart flow site-wide */}
        <div className="flex flex-col gap-4">
          <div className={cardShell}>
            <div className="p-4 md:p-6">
              <h2 className="mb-4 text-xl font-bold text-headerBg max-md:text-lg">
                Order summary
              </h2>

              <div className="space-y-0 divide-y divide-slate-100">
                {orders?.orderItems?.map((item: any) => (
                  <div
                    key={item?.id}
                    className="flex gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                      <img
                        src={featuredImageCardUrl(item?.product?.featured_image?.[0])}
                        alt={item?.product?.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="flex flex-wrap items-center gap-2 font-semibold text-slate-800">
                        {item?.product?.name}
                        {showUnpaidBadges && (
                          <span className="inline-flex items-center rounded border border-yellow-300/90 bg-yellow-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-yellow-950">
                            Unpaid
                          </span>
                        )}
                      </h3>
                      <p className="mt-0.5 text-sm text-slate-500">Qty: {item?.qty}</p>
                      {item?.variant && item?.variant?.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item?.variant?.map((v: any, i: number) => (
                            <p key={i} className="text-xs text-slate-500">
                              {v.variant?.name}: {v.variant_value?.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency((item?.order_price * item?.qty).toFixed(2))}
                      </p>
                      <p className="text-xs text-slate-500">
                        Shipping{" "}
                        {formatCurrency((+item?.shipping_price).toFixed(2))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cardShell}>
            <div className="p-4 md:p-6">
              <h2 className="mb-3 text-xl font-bold text-headerBg max-md:text-lg">
                Shipping address
              </h2>
              <div className="space-y-1.5 text-sm text-slate-700">
                <p>{orders?.shipping_address?.address}</p>
                <p>
                  {orders?.shipping_address?.city.name},{" "}
                  {orders?.shipping_address?.state.name}
                </p>
                <p>{orders?.shipping_address?.country?.name}</p>
                <p className="pt-1 text-slate-600">
                  Phone: {orders?.shipping_address?.phone}
                </p>
              </div>
            </div>
          </div>

          <div className={cardShell}>
            <div className="p-4 md:p-6">
              <h2 className="mb-4 text-xl font-bold text-headerBg max-md:text-lg">
                Payment method
              </h2>

              {escrowDisabled ? (
                <p className="text-sm text-slate-600">
                  Complete your purchase using the button in the order total below.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-3">
                    <input
                      type="radio"
                      id="pod"
                      name="payment"
                      checked={paymentMethod === "pod"}
                      onChange={() => setPaymentMethod("pod")}
                      className="h-5 w-5 text-primary focus:ring-primary"
                    />
                    <label htmlFor="pod" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-slate-800">Pay on delivery</div>
                      <p className="mt-1 text-xs text-slate-600">
                        Pay when your order is delivered, as agreed with the seller.
                      </p>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="h-5 w-5 text-primary focus:ring-primary"
                    />
                    <label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-slate-800">
                        Credit / debit card (Paystack)
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <img src="/assets/visa.webp" alt="Visa" className="h-6" />
                        <img
                          src="/assets/mastercard.png"
                          alt="Mastercard"
                          className="h-6"
                        />
                        <img
                          src="/assets/amex.jpg"
                          alt="American Express"
                          className="h-6"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            id="checkout-order-total"
            className={cardShell}
          >
            <div className="p-4 md:p-6">
              <h2 className="mb-4 text-xl font-bold text-headerBg max-md:text-lg">
                Order total
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency((+orders?.totalPrice || 0).toFixed(2))}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Shipping</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency((+orders?.shippingPrice || 0).toFixed(2))}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-4">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-lg tabular-nums text-headerBg">
                    {formatCurrency(
                      (+(orders?.totalPriceDue || orders?.totalPrice) || 0).toFixed(2)
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void onPrimaryCheckout()}
                  disabled={processingPayment}
                  className={`mt-2 flex w-full items-center justify-center rounded-xl py-3.5 font-medium text-white transition ${
                    processingPayment
                      ? "cursor-not-allowed bg-slate-300"
                      : "bg-primary hover:bg-primary-dark"
                  }`}
                >
                  {processingPayment ? (
                    <>
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {primaryIsUnpaid ? "Placing order…" : "Processing payment…"}
                    </>
                  ) : primaryIsUnpaid ? (
                    escrowDisabled ? (
                      "Complete order"
                    ) : (
                      "Place order"
                    )
                  ) : (
                    `Pay ${formatCurrency(
                      (+(orders?.totalPriceDue || orders?.totalPrice) || 0).toFixed(2)
                    )} with card`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8 text-center">
          <Link
            href="/carts"
            className="text-sm font-semibold text-primary underline-offset-4 hover:text-deepOrange hover:underline"
          >
            Back to cart
          </Link>
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
