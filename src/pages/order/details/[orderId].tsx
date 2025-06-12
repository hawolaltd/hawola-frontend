import type { NextPage } from 'next';
import { useState } from 'react';
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useRouter} from "next/router";

// Define validation schema
const disputeSchema = yup.object().shape({
    dispute_reason: yup.string().required('Dispute reason is required'),
    proof_image: yup.mixed().test(
        'fileSize',
        'File too large',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        value => !value || (value && value.size <= 5000000) // 5MB max
    ),
    want_full_refund: yup.boolean().required()
});

type DisputeFormData = {
    orderitem_number: string;
    dispute_reason: string;
    proof_image?: File;
    want_full_refund: boolean;
};

const OrderDetails: NextPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<DisputeFormData>({
        resolver: yupResolver(disputeSchema),
        defaultValues: {
            orderitem_number: 'ED137C63',
            want_full_refund: true
        }
    });

    // Function to determine payment status message
    const getPaymentStatusMessage = () => {
        const {
            isPaid,
            payment_confirmed,
            is_offline_payment
        } = order.statusBooleans;

        if (is_offline_payment) {
            return payment_confirmed
                ? "Offline payment confirmed, please process order"
                : "Offline payment pending confirmation";
        }

        if (isPaid) {
            return payment_confirmed
                ? "Payment confirmed, please process order"
                : "Payment received, pending confirmation";
        }

        return "Payment not yet received";
    };


    // Sample order data
    const [order, setOrder] = useState({
        id: '803453449',
        name: 'LEARN & LIVE First Aid',
        customer: {
            name: 'Bello Oluwasegun',
            address: 'No 90 Kwarme Nkrumah Asokoro, Wuse 2',
            phone: '8037910749',
            altPhone: '8037910749'
        },
        quantity: 3,
        orderPrice: 40000.00,
        shippingPrice: 20000.00,
        subtotal: 600000.00,
        paymentStatus: 'Payment confirmed, please process order',
        trackingNumber: '782y348huwer',
        expectedArrival: 'June 5, 2025',
        logisticCompany: 'GIG',
        status: 'shipped',
        statusBooleans: {
            isShipped: false,
            isPaid: true,
            payment_confirmed: false,
            is_offline_payment: false,
            isDelivered: false,
            is_reviewed: false,
            is_merchant_reviewed: false,
        },
        updates: [
            {
                date: 'MAY 30.2025,8:05 P.M.',
                message: 'Your order arrived lagos',
                status: 'delivered'
            },
            {
                date: 'MAY 30.2025,8:04 P.M.',
                message: 'Your order is on its way.',
                status: 'in-transit'
            },
            {
                date: 'MAY 30.2025,8:04 P.M.',
                message: 'We have shipped your order',
                status: 'shipped'
            }
        ]
    });

    const onSubmitDispute = async (data: DisputeFormData) => {
        if (order.status !== 'received') return;

        setIsSubmitting(true);
        try {
            // Here you would typically send the data to your API
            console.log('Submitting dispute:', data);

            // Create form data for file upload
            const formData = new FormData();
            formData.append('orderitem_number', data.orderitem_number);
            formData.append('dispute_reason', data.dispute_reason);
            if (data.proof_image) {
                formData.append('proof_image', data.proof_image);
            }
            formData.append('want_full_refund', String(data.want_full_refund));

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Dispute submitted successfully!');
            reset();
        } catch (error) {
            console.error('Error submitting dispute:', error);
            alert('Failed to submit dispute. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormActive = order.status === 'received';

    return (
        <AuthLayout>
            <div className="!p-0 bg-gray-50">
                <Head>
                    <title>Order Details</title>
                </Head>
                <div className="min-h-screen px-6 py-12">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="mb-6 flex items-center text-primary container mx-auto"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Back to Orders
                    </button>
                    <div className="container mx-auto overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className={'flex flex-col gap-4'}>

                            {/* Order Header */}
                            <div className="p-6 flex flex-col rounded-lg shadow">
                                <div className="flex justify-between items-start w-full">
                                    <div className={'w-full'}>
                                        <h1 className="text-xl font-bold text-gray-800">Order Number: <span className={'text-xs'}>{order.id}</span></h1>

                                        <div className="flex items-center w-full">
                                            <img
                                                src={'/assets/tvPlama.jpg'}
                                                alt={'tvPlama'}
                                                width={'100%'}
                                                height={'100px'}
                                            />
                                        </div>

                                        <h2 className="text-sm font-semibold text-gray-700 mt-1">{order.name}</h2>
                                    </div>
                                    <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        order.status === 'received' ? 'bg-green-100 text-green-800' :
                                            order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                    }`}>
                                        {order.status === 'received' ? 'Received' :
                                            order.status === 'delivered' ? 'Delivered' :
                                                order.status === 'in-transit' ? 'In Transit' : 'Shipped'}
                                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="p-6 rounded-lg shadow flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name:</p>
                                        <p className="text-gray-800 font-medium">{order.customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Shipping address:</p>
                                        <p className="text-gray-800 font-medium">{order.customer.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Contact Phone:</p>
                                        <p className="text-gray-800 font-medium">{order.customer.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Alternative Contact Phone:</p>
                                        <p className="text-gray-800 font-medium">{order.customer.altPhone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Information */}
                            <div className="p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Quantity:</p>
                                        <p className="text-gray-800 font-medium">{order.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Order Price:</p>
                                        <p className="text-gray-800 font-medium">₦{order.orderPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Shipping Price:</p>
                                        <p className="text-gray-800 font-medium">₦{order.shippingPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Subtotal:</p>
                                        <p className="text-gray-800 font-medium">₦{order.subtotal.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Status</h3>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        order.statusBooleans.payment_confirmed
                                            ? 'bg-green-500'
                                            : order.statusBooleans.isPaid
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                    }`}></div>
                                    <p className="text-gray-700">
                                        {getPaymentStatusMessage()}
                                    </p>
                                </div>
                                {order.statusBooleans.is_offline_payment && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        This is an offline payment
                                    </p>
                                )}
                            </div>

                        </div>

                        <div className={`flex flex-col gap-4`}>

                            {/* Shipping Updates */}
                            <div className="p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tracking Information</h3>
                                <div className="space-y-4">
                                    {order.updates.map((update, index) => (
                                        <div key={index} className="flex">
                                            <div className="flex flex-col items-center mr-4">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    update.status === 'delivered' ? 'bg-green-500' :
                                                        update.status === 'in-transit' ? 'bg-yellow-500' :
                                                            'bg-purple-500'
                                                }`}></div>
                                                {index < order.updates.length - 1 && (
                                                    <div className="w-px h-8 bg-gray-300 my-1"></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">{update.date}</p>
                                                <p className="text-gray-700">{update.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="p-6 rounded-lg shadow ">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Shipping Updates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Tracking Number:</p>
                                        <p className="text-gray-800 font-medium">{order.trackingNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Expected Date of Arrival:</p>
                                        <p className="text-gray-800 font-medium">{order.expectedArrival}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Logistic Company:</p>
                                        <p className="text-gray-800 font-medium">{order.logisticCompany}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dispute Form (always visible but disabled until status is 'received') */}
                        <div className={`p-6 rounded-lg shadow h-fit ${!isFormActive ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Submit Dispute
                                {!isFormActive && (
                                    <span className="ml-2 text-sm text-red-500">
                                            (Available after order is received)
                                        </span>
                                )}
                            </h3>
                            <form onSubmit={handleSubmit(onSubmitDispute)} className="space-y-4">
                                <input type="hidden" {...register('orderitem_number')} />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dispute Reason *
                                    </label>
                                    <textarea
                                        {...register('dispute_reason')}
                                        rows={4}
                                        className={`w-full px-3 py-2 border rounded-md ${errors.dispute_reason ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Explain the reason for your dispute"
                                        disabled={!isFormActive}
                                    />
                                    {errors.dispute_reason && (
                                        <p className="mt-1 text-sm text-red-600">{errors.dispute_reason.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Proof Image (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                register('proof_image').onChange({
                                                    target: {
                                                        name: 'proof_image',
                                                        value: e.target.files[0]
                                                    }
                                                });
                                            }
                                        }}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        disabled={!isFormActive}
                                    />
                                    {errors.proof_image && (
                                        <p className="mt-1 text-sm text-red-600">{errors.proof_image.message}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">Max 5MB (JPG, PNG, GIF)</p>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="want_full_refund"
                                        {...register('want_full_refund')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={!isFormActive}
                                    />
                                    <label htmlFor="want_full_refund" className="ml-2 block text-sm text-gray-700">
                                        I want a full refund
                                    </label>
                                </div>

                                {isFormActive && (
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => reset()}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default OrderDetails;