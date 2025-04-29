import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '@/hook/useReduxTypes';
import AuthLayout from '@/components/layout/AuthLayout';
import {amountFormatter} from '@/util';
import Link from 'next/link';
import {CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon} from '@heroicons/react/24/outline';
import {getOrderHistory} from "@/redux/product/productSlice";
import ProductCard from "@/components/product/ProductCard";
import FeaturesSection from "@/components/home/FeaturesSection";
import DisputeModal from "@/components/product/DisputeModal";

const OrderHistoryPage = () => {
    const dispatch = useAppDispatch();
    const {ordersHistory, isLoading, error, products} = useAppSelector(state => state.products);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrderForDispute, setSelectedOrderForDispute] = useState< OrderDetail | null>(null);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);



    console.log("error", error)

    const filteredOrders = ordersHistory?.detail?.filter((order: any) => statusFilter === 'all' ? true : order?.status === statusFilter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'processing':
                return <ClockIcon className="w-5 h-5 text-blue-500"/>;
            case 'shipped':
                return <TruckIcon className="w-5 h-5 text-purple-500"/>;
            case 'delivered':
                return <CheckCircleIcon className="w-5 h-5 text-green-500"/>;
            case 'cancelled':
                return <XCircleIcon className="w-5 h-5 text-red-500"/>;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500"/>;
        }
    };

    useEffect(() => {
        dispatch(getOrderHistory());
    }, [dispatch]);

    if (isLoading) {
        return (<AuthLayout>
                <div className="container mx-auto px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </AuthLayout>);
    }

    if (error) {
        return (<AuthLayout>
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Orders</h2>
                    <p className="text-gray-600 mb-8">Please try refreshing the page or contact support.</p>
                    <button
                        onClick={() => dispatch(getOrderHistory())}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                    >
                        Retry
                    </button>
                </div>
            </AuthLayout>);
    }

    return (<AuthLayout>
            <div className="container mx-auto px-4 py-8">
                <DisputeModal order={selectedOrderForDispute as OrderDetail}  onClose={()=>{
                    setIsDisputeModalOpen(false)
                }} isOpen={isDisputeModalOpen}/>
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Order History</h1>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-md bg-white"
                        >
                            <option value="all">All Orders</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="w-full px-4 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 border-b gap-4">
                            <div className="col-span-2 font-medium">Order Number</div>
                            <div className="col-span-2 font-medium">Date</div>
                            <div className="col-span-2 font-medium">Status</div>
                            <div className="col-span-3 font-medium">Items</div>
                            <div className="col-span-3 font-medium text-right">Total</div>
                        </div>

                        {/* Orders */}
                        {filteredOrders?.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No orders found matching your criteria
                            </div>) :
                            (filteredOrders?.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/order/${order.id}`}
                                    className="block hover:bg-gray-50 border-b last:border-b-0"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-12 p-4 gap-4">
                                        {/* Order Number */}
                                        <div className="md:col-span-2">
                                            <div className="md:hidden text-sm text-gray-500 mb-1">Order #</div>
                                            <div className="font-medium text-primary">#{order.id}</div>
                                        </div>

                                        {/* Date */}
                                        <div className="md:col-span-2">
                                            <div className="md:hidden text-sm text-gray-500 mb-1">Date</div>
                                            <div className="text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="md:col-span-2">
                                            <div className="md:hidden text-sm text-gray-500 mb-1">Status</div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(order?.isDelivered ? 'delivered' : order?.isShipped ? "shipped" : 'pending')}
                                                <span
                                                    className={`text-sm ${order.isDelivered ? 'text-green-600' : order.isShipped ? 'text-purple-600' : 'text-orange'}`}>
                                                    {order?.isDelivered ? 'delivered'.toUpperCase() : order?.isShipped ? "shipped".toUpperCase() : "pending".toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="md:col-span-3">
                                            <div className="md:hidden text-sm text-gray-500 mb-1">Items</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">

                                                    <img

                                                        src={order.product.featured_image?.[0]?.image_url}
                                                        alt={order.product.name}
                                                        className="w-8 h-8 rounded-full border-2 border-white"
                                                    />

                                                    {/*{order.orderItems.length > 3 && (*/}
                                                    {/*    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs">*/}
                                                    {/*        +{order.orderItems.length - 3}*/}
                                                    {/*    </div>*/}
                                                    {/*)}*/}
                                                </div>
                                                {/*                        <span className="text-sm text-gray-600">*/}
                                                {/*  {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}*/}
                                                {/*</span>*/}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="md:col-span-3 flex justify-end items-center gap-2">
                                            <div className="md:hidden text-sm text-gray-500 mb-1">Total</div>
                                            <div className="text-right font-medium">
                                                ${amountFormatter((+(order.order_price_subtotal)).toFixed(2))}
                                            </div>

                                            {!order.isDelivered && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedOrderForDispute(order);
                                                        setIsDisputeModalOpen(true);
                                                    }}
                                                    className="ml-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs hover:bg-red-100"
                                                >
                                                    File Dispute
                                                </button>
                                            )}

                                            {!order.isDelivered && (
                                                <Link href={`/disputes/${order.orderitem_number}`}>
                                                    <p
                                                        className="text-primary text-xs underline"
                                                    >
                                                        View Dispute
                                                    </p>
                                                </Link>

                                            )}
                                        </div>
                                    </div>
                                </Link>))
                            )
                        }
                    </div>

                    {/* Support CTA */}
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
                        <h3 className="text-lg font-medium mb-2">Need help with an order?</h3>
                        <p className="text-gray-600 mb-4">
                            Contact our support team 24/7 for assistance with your purchases
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="mailto:support@yourstore.com"
                                className="px-4 py-2 bg-white border rounded-md hover:bg-gray-100"
                            >
                                Email Support
                            </a>
                            <a
                                href="tel:+18001234567"
                                className="px-4 py-2 bg-white border rounded-md hover:bg-gray-100"
                            >
                                Call Support
                            </a>
                        </div>
                    </div>
                </div>

                {/* Recommended Products */}
                <div className={'m-8'}>
                    <div className={'flex justify-between items-center'}>
                        <h4 className={'font-bold text-2xl text-primary py-6'}>You May Also Like</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        {products?.results?.slice(0, 8)?.map((product, key) => (
                            <ProductCard key={key} product={product}/>))}
                    </div>
                </div>
                <div className={'m-12'}>
                    <FeaturesSection/>
                </div>

            </div>
        </AuthLayout>);
};

export default OrderHistoryPage;