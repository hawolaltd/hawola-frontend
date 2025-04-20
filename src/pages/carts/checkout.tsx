import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/hook/useReduxTypes';
import AuthLayout from '@/components/layout/AuthLayout';
import { amountFormatter } from '@/util';
import { toast } from 'react-toastify';
import { updatePayment } from "@/redux/product/productSlice";
import dynamic from 'next/dynamic';
import { getUserProfile } from "@/redux/auth/authSlice";
import {wrapper} from "@/store/store";
import {PaystackProps} from "react-paystack/libs/types";

const PaystackCheckout = dynamic(
    () => import('react-paystack').then((mod) => {
        return (props: { config: PaystackProps, onSuccess: () => void }) => {
            const initializePayment = mod.usePaystackPayment(props.config);

            useEffect(() => {
                initializePayment({
                    onSuccess: () => props.onSuccess()
                });
            }, []);

            return null;
        };
    }),
    { ssr: false }
);


const CheckoutPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { orders, isLoading: loading } = useAppSelector(state => state.products);
    const { profile } = useAppSelector(state => state.auth);
    const [paymentMethod, setPaymentMethod] = useState<string>('card');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [showPaystack, setShowPaystack] = useState(false);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string;
    const config = {
        reference: orders?.payment_reference as string,
        email: profile?.email as string,
        amount: +orders?.totalPrice * 100,
        publicKey,
    };
    const handlePayment = async () => {
        setProcessingPayment(true);
        try {
            const params = {
                payment_reference: orders?.payment_reference ?? '4yrg0exv8o',
                order_id: orders?.order_number,
                payment_method: 'paystack',
                is_offline_payment: orders?.is_offline_payment
            };

            const res = await dispatch(updatePayment(params));

            if (res.type.includes('fulfilled')) {
                setShowPaystack(true);
            }
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };



    useEffect(() => {
        dispatch(getUserProfile())
    }, [dispatch]);

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
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Order not found</h2>
                    <button
                        onClick={() => router.push('/carts')}
                        className="px-6 py-2 bg-primary text-white rounded-md"
                    >
                        Back to Cart
                    </button>
                </div>
            </AuthLayout>
        );
    }



    return (
        <AuthLayout>

            <div className="container relative mx-auto px-4 py-8">
                {loading && <div  className="container absolute w-full h-full z-50 backdrop-blur-md items-center px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>}

                {showPaystack && (
                    <PaystackCheckout
                        config={config}
                        onSuccess={() => router.push('/order/order-confirmation')}
                    />
                )}


                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Order Details */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                            <div className="space-y-4">
                                {orders?.orderItems?.map((item: any) => (
                                    <div key={item?.id} className="flex justify-between border-b pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-md">
                                                <img
                                                    src={item?.product?.featured_image?.[0]?.image_url}
                                                    alt={item?.product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{item?.product?.name}</h3>
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
                                            <p className="font-semibold">${amountFormatter((item?.order_price * item?.qty).toFixed(2))}</p>
                                            <p className="text-xs text-gray-500">Shipping: ${amountFormatter((+(item?.shipping_price)).toFixed(2))}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                            <div className="space-y-2">
                                <p>{orders?.shipping_address?.address}</p>
                                <p>{orders?.shipping_address?.city.name}, {orders?.shipping_address?.state.name}</p>
                                <p>{orders?.shipping_address?.country?.name}</p>
                                <p>Phone: {orders?.shipping_address?.phone}</p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 border rounded-md">
                                    <input
                                        type="radio"
                                        id="card"
                                        name="payment"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                        className="h-5 w-5 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="card" className="flex-1">
                                        <div className="font-medium">Credit/Debit Card</div>
                                        <div className="flex gap-2 mt-1">
                                            <img src="/assets/visa.webp" alt="Visa" className="h-6" />
                                            <img src="/assets/mastercard.png" alt="Mastercard" className="h-6" />
                                            <img src="/assets/amex.jpg" alt="American Express" className="h-6" />
                                        </div>
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 p-3 border rounded-md">
                                    <input
                                        type="radio"
                                        id="paypal"
                                        name="payment"
                                        checked={paymentMethod === 'paypal'}
                                        onChange={() => setPaymentMethod('paypal')}
                                        className="h-5 w-5 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="paypal" className="flex-1">
                                        <div className="font-medium">PayPal</div>
                                        <img src="/assets/paypal.webp" alt="PayPal" className="h-6 mt-1" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Total */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Order Total</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">
                    ${amountFormatter((+(orders?.totalPrice)).toFixed(2))}
                  </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className="font-semibold">
                    ${amountFormatter((+(orders?.shippingPrice)).toFixed(2))}
                  </span>
                                </div>

                                <div className="border-t pt-4 flex justify-between">
                                    <span className="font-bold">Total:</span>
                                    <span className="font-bold text-lg">
                    ${amountFormatter((+(orders?.totalPrice)).toFixed(2))}
                  </span>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={processingPayment}
                                    className={`w-full mt-6 py-3 ${
                                        processingPayment ? 'bg-blue-300' : 'bg-primary hover:bg-primary-dark'
                                    } text-white font-medium rounded-md transition flex justify-center items-center`}
                                >
                                    {processingPayment ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing Payment...
                                        </>
                                    ) : (
                                        `Pay $${amountFormatter((+(orders?.totalPrice)).toFixed(2))}`
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
export const getServerSideProps = wrapper.getServerSideProps((store) => async (context) => {
    await store.dispatch(getUserProfile());
    // Add other necessary dispatches here if needed

    return {
        props: {},
    };
});
export default CheckoutPage;