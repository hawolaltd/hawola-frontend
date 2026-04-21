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
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AuthLayout>
    );
  }

  if (!orders) {
    return (
      <AuthLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Order not found
          </h2>
          <button
            onClick={() => router.push("/carts")}
            className="px-6 py-2 bg-primary text-white rounded-md"
          >
            Back to Cart
          </button>
        </div>
      </AuthLayout>
    );
  }

  const showUnpaidBadges = escrowDisabled || paymentMethod === "pod";
  const primaryIsUnpaid = escrowDisabled || paymentMethod === "pod";

  return (
    <AuthLayout>
      <div className="container relative mx-auto px-4 py-8">
        {loading && (
          <div className="container absolute w-full h-full z-50 backdrop-blur-md items-center px-4 py-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {showPaystack && !escrowDisabled && paymentMethod === "card" && (
          <>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-sm text-center">
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
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-sm text-center">
              <div className="mx-auto mb-4 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              <h3 className="text-lg font-semibold mb-1">Confirming your order...</h3>
              <p className="text-sm text-gray-600">
                Please wait while we finalize your order.
              </p>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-4">
                {orders?.orderItems?.map((item: any) => (
                  <div
                    key={item?.id}
                    className="flex justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-md">
                        <img
                          src={featuredImageCardUrl(item?.product?.featured_image?.[0])}
                          alt={item?.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium flex flex-wrap items-center gap-2">
                          {item?.product?.name}
                          {showUnpaidBadges && (
                            <span className="inline-flex items-center rounded border border-yellow-300/90 bg-yellow-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-yellow-950 dark:border-yellow-300/90 dark:bg-yellow-50 dark:text-yellow-950">
                              Unpaid
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">Qty: {item?.qty}</p>
                        {item?.variant && item?.variant?.length > 0 && (
                          <div className="mt-1">
                            {item?.variant?.map((v: any, i: number) => (
                              <p key={i} className="text-xs text-gray-500">
                                {v.variant?.name}: {v.variant_value?.value}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency((item?.order_price * item?.qty).toFixed(2))}
                      </p>
                      <p className="text-xs text-gray-500">
                        Shipping:{" "}
                        {formatCurrency((+item?.shipping_price).toFixed(2))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-2">
                <p>{orders?.shipping_address?.address}</p>
                <p>
                  {orders?.shipping_address?.city.name},{" "}
                  {orders?.shipping_address?.state.name}
                </p>
                <p>{orders?.shipping_address?.country?.name}</p>
                <p>Phone: {orders?.shipping_address?.phone}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>

              {escrowDisabled ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Complete your purchase using the button in the order total.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-md border-primary/30 bg-primary/5">
                    <input
                      type="radio"
                      id="pod"
                      name="payment"
                      checked={paymentMethod === "pod"}
                      onChange={() => setPaymentMethod("pod")}
                      className="h-5 w-5 text-primary focus:ring-primary"
                    />
                    <label htmlFor="pod" className="flex-1 cursor-pointer">
                      <div className="font-medium">Pay on delivery</div>
                      <p className="text-xs text-gray-600 mt-1">
                        Pay when your order is delivered, as agreed with the seller.
                      </p>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="h-5 w-5 text-primary focus:ring-primary"
                    />
                    <label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="font-medium">Credit / debit card (Paystack)</div>
                      <div className="flex gap-2 mt-1">
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

          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Total</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    {formatCurrency((+orders?.totalPrice || 0).toFixed(2))}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold">
                    {formatCurrency((+orders?.shippingPrice || 0).toFixed(2))}
                  </span>
                </div>

                <div className="border-t pt-4 flex justify-between">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(
                      (+(orders?.totalPriceDue || orders?.totalPrice) || 0).toFixed(2)
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void onPrimaryCheckout()}
                  disabled={processingPayment}
                  className={`w-full mt-6 py-3 ${
                    processingPayment
                      ? "bg-blue-300"
                      : "bg-primary hover:bg-primary-dark"
                  } text-white font-medium rounded-md transition flex justify-center items-center`}
                >
                  {processingPayment ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
