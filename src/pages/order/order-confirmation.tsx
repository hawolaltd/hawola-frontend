import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hook/useReduxTypes';
import AuthLayout from '@/components/layout/AuthLayout';
import { amountFormatter } from '@/util';
import Link from 'next/link';
import { CheckCircleIcon, TruckIcon, ShoppingBagIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import FeaturesSection from "@/components/home/FeaturesSection";
import ProductCard from "@/components/product/ProductCard";

const OrderConfirmationPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { orders, products } = useAppSelector(state => state.products);
    const { profile } = useAppSelector(state => state.auth);

    // Track conversion in analytics
    useEffect(() => {
        if (orders && id) {
            // Implement your analytics tracking here
            console.log('Track conversion for order:', orders.id);
        }
    }, [orders, id]);

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

    console.log("orders--", orders)

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
                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full">
                                Payment Successful
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Delivery Information */}
                            <div>
                                {/* <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <TruckIcon className="w-5 h-5"/>
                                    Delivery Information
                                </h4>
                                <p className="text-gray-600">
                                    Estimated delivery: {new Date(
                                    new Date().setDate(new Date().getDate() + 3)
                                ).toLocaleDateString()}
                                </p> */}
                                <p className="text-gray-600 mt-2">
                                    {orders?.shipping_address?.address}<br/>
                                    {orders.shipping_address.city?.name}, {orders.shipping_address.state.name}<br/>
                                    {orders.shipping_address?.country}
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

                            <div className="flex items-center gap-4">
                                <div className="bg-purple-100 p-2 rounded-full">
                                    <EnvelopeIcon className="w-6 h-6 text-purple-600"/>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800">Need Help?</h4>
                                    <p className="text-gray-600 text-sm">
                                        Contact our <a href="/support" className="text-primary hover:underline">support
                                        team</a>
                                        or call +1 (800) 123-4567
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
                            href={`/order/${orders.id}`}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2"
                        >
                            View Order Details
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 pt-8 border-t text-center">
                        <div className="flex flex-wrap justify-center gap-6 mb-4">
                            <img src="/assets/secure-checkout.jpg" alt="Secure Checkout" className="h-12"/>
                            <img src="/assets/money-back.jpg" alt="30-Day Money Back" className="h-12"/>
                            <img src="/assets/ssl-secure.jpg" alt="SSL Secure" className="h-12"/>
                        </div>
                        <p className="text-sm text-gray-500">
                            Your purchase is protected by our 100% satisfaction guarantee
                        </p>
                    </div>
                </div>


                {/* Recommended Products */}
                <div className={'m-8'}>
                    <div className={'flex justify-between items-center'}>
                        <h4 className={'font-bold text-2xl text-primary py-6'}>You May Also Like</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        {products?.results?.slice(0, 8)?.map((product, key) => (
                            <ProductCard key={key} product={product}/>
                        ))}
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