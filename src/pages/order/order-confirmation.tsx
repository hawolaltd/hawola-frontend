import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hook/useReduxTypes';
import AuthLayout from '@/components/layout/AuthLayout';
import { amountFormatter } from '@/util';
import Link from 'next/link';
import { CheckCircleIcon, TruckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import FeaturesSection from "@/components/home/FeaturesSection";
import { sanitizeRichNotice } from "@/util/sanitizeRichNotice";
import {
  buildContentsFromOrderItems,
  trackTikTokPlaceAnOrder,
  trackTikTokPurchase,
  tikTokIdentityFromProfile,
} from "@/lib/tiktokPixel";

const OrderConfirmationPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { orders } = useAppSelector(state => state.products);
    const { profile } = useAppSelector(state => state.auth);
    const siteSettings = useAppSelector((state) => state.general.siteSettings);
    const tikTokIdentity = tikTokIdentityFromProfile(profile);

    const offlineMerchantPaymentNoticeSafe = useMemo(() => {
        if (!orders?.is_offline_payment) return "";
        const raw = (siteSettings?.non_escrow_cart_notice_html as string | undefined)?.trim();
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

    // Redirect to cart if no order data
    useEffect(() => {
        if (!orders || !orders.id || !orders.order_number) {
            router.push('/carts');
        }
    }, [orders, router]);

    if (!orders || !orders.id || !orders.order_number) {
        return (
            <AuthLayout>
                <div className="container mx-auto px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </AuthLayout>
        );
    }

    const orderDetailsSlug =
        orders.orderItems?.[0]?.orderitem_number?.trim() || String(orders.id);

    return (
        <AuthLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                            Thank you for your order!
                        </h1>
                        <p className="text-gray-600">
                            A confirmation email has been sent to {profile?.email}
                        </p>
                    </div>

                    {/* Order Summary */}
                    <div className="border rounded-lg p-6 mb-8">
                        <div className="flex flex-wrap justify-between items-center mb-4">
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-lg font-semibold text-gray-800">Order #{orders.order_number}</h3>
                                <p className="text-gray-600 text-sm">
                                    Placed on {new Date(orders?.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            {(orders?.isPaid || !orders?.is_offline_payment || offlinePaymentBadgeLabel) && (
                                <div
                                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                        orders?.isPaid
                                            ? "bg-green-100 text-green-800"
                                            : orders?.is_offline_payment && offlinePaymentBadgeLabel
                                              ? "bg-amber-100 text-amber-900"
                                              : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {orders?.isPaid
                                        ? "Payment successful"
                                        : orders?.is_offline_payment
                                          ? offlinePaymentBadgeLabel
                                          : "Payment pending"}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Delivery Information */}
                            <div>
                                <p className="text-gray-600 mt-2">
                                    {orders?.shipping_address?.address}
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
                                </p>
                            </div>

                            {/* Order Details */}
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <ShoppingBagIcon className="w-5 h-5"/>
                                    Order Details
                                </h4>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Items ({orders.orderItems.length}):</span>
                                    <span
                                        className="font-medium">₦{amountFormatter((+(orders.totalPrice)).toFixed(2))}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span
                                        className="font-medium">₦{amountFormatter((+(orders?.shippingPrice)).toFixed(2))}</span>
                                </div>
                                <div className="flex justify-between mt-2 pt-2 border-t">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-semibold text-lg">
                    ₦{amountFormatter((+(orders.totalPriceDue)).toFixed(2))}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {offlineMerchantPaymentNoticeSafe ? (
                        <div
                            className="mb-8 rounded-lg border border-amber-200/90 bg-amber-50/90 p-4 text-sm text-slate-800 shadow-sm prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
                            dangerouslySetInnerHTML={{ __html: offlineMerchantPaymentNoticeSafe }}
                        />
                    ) : null}

                    {/* Next Steps */}
                    <div className="border rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <TruckIcon className="w-6 h-6 text-blue-600"/>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800">Track Your Order</h4>
                                    <p className="text-gray-600 text-sm">
                                        You'll receive shipping updates via email
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition flex items-center justify-center gap-2"
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href={`/order/details/${orderDetailsSlug}`}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2"
                        >
                            View Order Details
                        </Link>
                    </div>
                </div>

                <div className={'m-12'}>
                    <FeaturesSection/>
                </div>
            </div>
        </AuthLayout>
    );
};

export default OrderConfirmationPage;
