import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/hook/useReduxTypes";
import AuthLayout from "@/components/layout/AuthLayout";
import { amountFormatter, formatCurrency } from "@/util";
import Link from "next/link";
import {
  CheckCircleIcon,
  TruckIcon,
  ShoppingBagIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import FeaturesSection from "@/components/home/FeaturesSection";
import {
  richTextHasVisibleContent,
  sanitizeRichNotice,
} from "@/util/sanitizeRichNotice";
import {
  buildContentsFromOrderItems,
  trackTikTokPlaceAnOrder,
  trackTikTokPurchase,
  tikTokIdentityFromProfile,
} from "@/lib/tiktokPixel";

const OrderConfirmationPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { orders } = useAppSelector((state) => state.products);
  const { profile } = useAppSelector((state) => state.auth);
  const siteSettings = useAppSelector((state) => state.general.siteSettings);
  const tikTokIdentity = tikTokIdentityFromProfile(profile);

  const offlineMerchantPaymentNoticeSafe = useMemo(() => {
    if (!orders?.is_offline_payment) return "";
    const raw = (
      siteSettings?.non_escrow_cart_notice_html as string | undefined
    )?.trim();
    if (!raw) return "";
    return sanitizeRichNotice(raw);
  }, [
    orders?.is_offline_payment,
    siteSettings?.non_escrow_cart_notice_html,
  ]);

  const offlinePaymentBadgeLabel = useMemo(() => {
    const custom = (
      siteSettings?.offline_order_confirmation_badge_text as string | undefined
    )?.trim();
    return custom || "";
  }, [siteSettings?.offline_order_confirmation_badge_text]);

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

  useEffect(() => {
    if (!orders || !id) return;

    const contents = buildContentsFromOrderItems(orders.orderItems || []);
    const value = Number(orders.totalPriceDue || orders.totalPrice || 0);
    const orderId = String(orders.order_number || orders.id);

    trackTikTokPlaceAnOrder({
      orderId,
      value,
      contents,
      identity: tikTokIdentity,
    });

    if (orders.isPaid) {
      trackTikTokPurchase({
        orderId,
        value,
        contents,
        identity: tikTokIdentity,
      });
    }
  }, [orders, id, tikTokIdentity]);

  useEffect(() => {
    if (!orders || !orders.id || !orders.order_number) {
      router.push("/carts");
    }
  }, [orders, router]);

  if (!orders || !orders.id || !orders.order_number) {
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

  const orderDetailsSlug =
    orders.orderItems?.[0]?.orderitem_number?.trim() || String(orders.id);

  const itemCount = orders.orderItems?.length || 0;
  const placedLabel = orders?.createdAt
    ? new Date(orders.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const paymentStatusLabel = orders?.isPaid
    ? "Payment successful"
    : orders?.is_offline_payment
      ? offlinePaymentBadgeLabel || "Arrange payment with seller"
      : "Payment pending";

  const showPaymentBadge =
    Boolean(orders?.isPaid) ||
    !orders?.is_offline_payment ||
    Boolean(offlinePaymentBadgeLabel) ||
    Boolean(orders?.is_offline_payment);

  const paymentHint = orders?.isPaid
    ? "Your payment was received."
    : orders?.is_offline_payment
      ? "Pay the seller directly — Hawola is not collecting this payment."
      : "We’re waiting for payment confirmation.";

  return (
    <AuthLayout>
      <div className="min-h-[70vh] bg-gradient-to-b from-[#f4f6fb] via-white to-white">
        <div className="bg-[#0b1f4d]">
          <div className="mx-auto flex w-full max-w-screen-xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b9c7ea] md:px-6 xl:px-0">
            <span>Order confirmed</span>
            <span className="normal-case tracking-normal text-white/90">
              #{orders.order_number}
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-screen-xl px-4 py-8 md:px-6 md:py-10 xl:px-0">
          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-slate-200/90 bg-gradient-to-br from-headerBg/10 via-white to-secondaryTextColor/20 px-6 py-8 text-center shadow-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200/80">
              <CheckCircleIcon className="h-8 w-8 text-secondaryTextColor" />
            </div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-secondaryTextColor">
              Hawola
            </p>
            <h1 className="mt-2 font-sans text-3xl font-bold text-headerBg md:text-4xl">
              Thank you for your order
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              {profile?.email
                ? `A confirmation email has been sent to ${profile.email}.`
                : "Your order is confirmed. Keep this page for your records."}
            </p>
            {showPaymentBadge ? (
              <span
                className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  orders?.isPaid
                    ? "bg-secondaryTextColor/20 text-headerBg"
                    : "bg-deepOrange/15 text-headerBg"
                }`}
              >
                {paymentStatusLabel}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-1 flex-col gap-4 lg:w-2/3">
              <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md">
                <div className="bg-gradient-to-br from-headerBg to-primary px-5 py-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    Receipt
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold">
                    Order #{orders.order_number}
                  </h2>
                  {placedLabel ? (
                    <p className="mt-1 text-xs text-white/70">
                      Placed {placedLabel}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-6 px-5 py-5 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-headerBg">
                      <MapPinIcon className="h-4 w-4 text-primary" />
                      Delivery
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {orders?.shipping_address?.address || "—"}
                      {shippingAddressLine ? (
                        <>
                          <br />
                          {shippingAddressLine}
                        </>
                      ) : null}
                      {shippingCountryLine ? (
                        <>
                          <br />
                          {shippingCountryLine}
                        </>
                      ) : null}
                      {orders?.shipping_address?.phone ? (
                        <>
                          <br />
                          <span className="text-textPadded">
                            Phone {orders.shipping_address.phone}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-headerBg">
                      <ShoppingBagIcon className="h-4 w-4 text-primary" />
                      Order details
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Items ({itemCount})</span>
                        <span className="font-semibold tabular-nums text-headerBg">
                          ₦{amountFormatter((+orders.totalPrice).toFixed(2))}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Shipping</span>
                        <span className="font-semibold tabular-nums text-headerBg">
                          ₦
                          {amountFormatter(
                            (+(orders?.shippingPrice || 0)).toFixed(2)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#CAD6EC] pt-2 font-bold text-headerBg">
                        <span>Total</span>
                        <span className="tabular-nums">
                          {formatCurrency(
                            Number(orders.totalPriceDue || 0).toFixed(2)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {richTextHasVisibleContent(offlineMerchantPaymentNoticeSafe) ? (
                <div
                  className="rounded-2xl border border-amber-200/90 bg-amber-50 p-4 text-sm text-slate-800 prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html: offlineMerchantPaymentNoticeSafe,
                  }}
                />
              ) : null}

              <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md">
                <div className="border-b border-[#CAD6EC] pb-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-textPadded">
                    Next
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-primary">
                    What happens now
                  </h2>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                    <TruckIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-headerBg">
                      Track your order
                    </h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                      You&apos;ll receive shipping updates by email as the
                      seller prepares and dispatches your items.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="w-full space-y-4 lg:sticky lg:top-24 lg:w-1/3">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f4d] via-[#152d5c] to-[#1e3a7a] p-5 shadow-[0_10px_40px_rgba(11,31,77,0.22)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  Order total
                </p>
                <p className="mt-2 text-[2.5rem] font-extrabold leading-none tracking-tight text-white">
                  {formatCurrency(
                    Number(orders.totalPriceDue || 0).toFixed(2)
                  )}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-white/70">
                  {paymentHint}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md">
                <Link
                  href={`/order/details/${orderDetailsSlug}`}
                  className="flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-primary/90"
                >
                  View order details
                </Link>
                <Link
                  href="/"
                  className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-primary/30 bg-white py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>

          <div className="mt-12">
            <FeaturesSection />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default OrderConfirmationPage;
