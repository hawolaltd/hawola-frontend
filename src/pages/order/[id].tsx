import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import {useAppDispatch, useAppSelector} from '@/hook/useReduxTypes';
import AuthLayout from '@/components/layout/AuthLayout';
import { amountFormatter } from '@/util';
import Link from 'next/link';
import { TruckIcon, CreditCardIcon, ShoppingBagIcon, EnvelopeIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import FeaturesSection from "@/components/home/FeaturesSection";
import ProductCard from "@/components/product/ProductCard";
import {getSingleOrder} from "@/redux/product/productSlice";

const OrderDetailsPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { orders, singleOrder, isLoading, products } = useAppSelector(state => state.products);

    console.log("singleOrder:", singleOrder)

    // const dispatch = useAppDispatch()
    //
    // useEffect(() => {
    //         dispatch(getSingleOrder(id as string));
    // }, [dispatch, id]);

    if (isLoading) {
        return (
            <AuthLayout>
                <div className="container mx-auto px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </AuthLayout>
        );
    }

    console.log("orders:",orders)

    if (!orders) {
        return (
            <AuthLayout>
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Order Not Found</h2>
                    <p className="text-gray-600 mb-8">We couldn't find details for this order. Please check your order history or contact support.</p>
                    <Link href="/order/order-history" className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
                        View Order History
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
                    {/* Order Header */}
                    <div className="mb-8">
                        <div className="flex flex-wrap justify-between items-center mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order #{orders.id}</h1>
                                <p className="text-gray-600 mt-1">
                                    Placed on {new Date(orders.createdAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-full ${
                                orders?.isDelivered ? 'bg-green-100 text-green-800' :
                                    !orders?.isDelivered ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                            }`}>
                                {orders.isDelivered ? "delivered".toUpperCase() : "Shipped"?.toUpperCase()}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                                <PrinterIcon className="w-5 h-5"/>
                                Print Order
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                                <DocumentArrowDownIcon className="w-5 h-5"/>
                                Download Invoice
                            </button>
                        </div>
                    </div>

                    {/* Order Content */}
                    <div className="space-y-8">
                        {/* Order Items */}
                        <div className="border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <ShoppingBagIcon className="w-5 h-5"/>
                                {orders?.orderItems?.length} Item{orders?.orderItems?.length > 1 ? 's' : ''}
                            </h3>

                            <div className="space-y-6">
                                {orders?.orderItems.map((item: any) => (
                                    <div key={item.id}
                                         className="flex flex-col md:flex-row justify-between border-b pb-6 last:border-b-0">
                                        <div className="flex gap-4 mb-4 md:mb-0">
                                            <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                                                {item.variant && item.variant.length > 0 && (
                                                    <div className="mt-1 space-y-1">
                                                        {item.variant.map((v: any, i: number) => (
                                                            <p key={i} className="text-sm text-gray-500">
                                                                {v.variant.name}: {v.variant_value.value}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500 mt-2">SKU: {item.product.sku}</p>
                                            </div>
                                        </div>

                                        <div className="md:text-right">
                                            <p className="font-medium">${amountFormatter((item.price * item.qty).toFixed(2))}</p>
                                            <p className="text-sm text-gray-500">Qty: {item?.qty}</p>
                                            <p className="text-sm text-gray-500">${amountFormatter(item?.price?.toFixed(2))} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping & Payment Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <TruckIcon className="w-5 h-5"/>
                                    Shipping Information
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-medium">{orders.shipping_address?.first_name} {orders.shipping_address?.last_name}</p>
                                    <p>{orders.shipping_address.address}</p>
                                    <p>{orders.shipping_address?.city?.name}, {orders.shipping_address.state.name}</p>
                                    <p>{orders.shipping_address.country}</p>
                                    <p className="mt-2">Phone: {orders.shipping_address.phone}</p>
                                    {orders?.order_number && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium">Tracking Number:</p>
                                            <a
                                                href={'#'}
                                                className="text-primary hover:underline break-all"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {orders.order_number}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <CreditCardIcon className="w-5 h-5"/>
                                    Payment Information
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-medium">{orders.paymentMethod} ending
                                        in {orders.paymentMethod}</p>
                                    <p>Payment Status: {orders.isPaid}</p>
                                    <p>Paid on {new Date(orders.createdAt).toLocaleDateString()}</p>

                                    {/* this should be the billing address */}
                                    <div className="mt-4">
                                        <p className="text-sm font-medium">Billing Address:</p>
                                        <p>{orders?.shipping_address?.address}</p>
                                        <p>{orders.shipping_address?.city?.name}, {orders.shipping_address?.state.name}</p>
                                        <p>{orders.shipping_address?.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal ({orders.orderItems.length} items):</span>
                                    <span>${amountFormatter((+(orders.totalPrice)).toFixed(2))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping & Handling:</span>
                                    <span>${amountFormatter((+(orders.shippingPrice)).toFixed(2))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>${amountFormatter((+(orders?.taxPrice ?? 0.00)).toFixed(2))}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t font-semibold">
                                    <span>Total:</span>
                                    <span>${amountFormatter((+(orders.paidAmount ?? 0.00)).toFixed(2))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Support Section */}
                        <div className="border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <EnvelopeIcon className="w-5 h-5"/>
                                Need Help With This Order?
                            </h3>
                            <div className="space-y-2">
                                <p>Contact our support team:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Email: <a href="mailto:support@yourstore.com"
                                                  className="text-primary hover:underline">support@yourstore.com</a>
                                    </li>
                                    <li>Phone: <a href="tel:+18001234567" className="text-primary hover:underline">+1
                                        (800) 123-4567</a></li>
                                    <li>Live Chat: Available Mon-Fri 9am-5pm EST</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition text-center"
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href="/order/order-history"
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-center"
                        >
                            View Order History
                        </Link>
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

export default OrderDetailsPage;