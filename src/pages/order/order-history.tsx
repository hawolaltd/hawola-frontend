import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '@/hook/useReduxTypes';
import AuthLayout from '@/components/layout/AuthLayout';
import {amountFormatter} from '@/util';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    CheckCircleIcon,
    ClockIcon,
    TruckIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import {getOrderHistory} from "@/redux/product/productSlice";
import ProductCard from "@/components/product/ProductCard";
import FeaturesSection from "@/components/home/FeaturesSection";
import DisputeModal from "@/components/product/DisputeModal";

const OrderHistoryPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const {ordersHistory, isLoading, error, products} = useAppSelector(state => state.products);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderForDispute, setSelectedOrderForDispute] = useState<OrderDetail | null>(null);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

    const filteredOrders = ordersHistory?.detail?.filter((order: any) => {
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'delivered' && order.isDelivered) ||
            (statusFilter === 'shipped' && order.isShipped && !order.isDelivered) ||
            (statusFilter === 'pending' && !order.isShipped && !order.isDelivered);
        
        const matchesSearch = !searchQuery || 
            order.orderitem_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (order: any) => {
        if (order.isDelivered) {
            return {
                icon: <CheckCircleIcon className="w-5 h-5" />,
                text: 'Delivered',
                bgColor: 'bg-green-50',
                textColor: 'text-green-700',
                borderColor: 'border-green-200'
            };
        } else if (order.isShipped) {
            return {
                icon: <TruckIcon className="w-5 h-5" />,
                text: 'Shipped',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-200'
            };
        } else if (order.isPaid) {
            return {
                icon: <ClockIcon className="w-5 h-5" />,
                text: 'Processing',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-700',
                borderColor: 'border-yellow-200'
            };
        } else {
            return {
                icon: <ClockIcon className="w-5 h-5" />,
                text: 'Pending',
                bgColor: 'bg-gray-50',
                textColor: 'text-gray-700',
                borderColor: 'border-gray-200'
            };
        }
    };

    useEffect(() => {
        dispatch(getOrderHistory());
    }, [dispatch]);

    if (isLoading) {
        return (
            <AuthLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                            <p className="mt-4 text-gray-600 font-medium">Loading your orders...</p>
                        </div>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    if (error && !isLoading) {
        return (
            <AuthLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircleIcon className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load Orders</h2>
                            <p className="text-gray-600 mb-6">
                                {typeof error === 'string' ? error : 'Please try refreshing the page or contact support.'}
                            </p>
                            <button
                                onClick={() => dispatch(getOrderHistory())}
                                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all transform hover:scale-105 font-medium shadow-md"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12">
                <DisputeModal 
                    order={selectedOrderForDispute as OrderDetail} 
                    onClose={() => setIsDisputeModalOpen(false)} 
                    isOpen={isDisputeModalOpen}
                />
                
                <div className="container mx-auto px-4">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <ShoppingBagIcon className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Order History</h1>
                        </div>
                        <p className="text-gray-600 ml-11">Track and manage all your orders in one place</p>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Status Filter */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                >
                                    <option value="all">All Orders</option>
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>

                            {/* Search */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Order number or product name..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">{ordersHistory?.detail?.length || 0}</p>
                                <p className="text-xs text-gray-600">Total Orders</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">
                                    {ordersHistory?.detail?.filter((o: any) => o.isDelivered).length || 0}
                                </p>
                                <p className="text-xs text-gray-600">Delivered</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">
                                    {ordersHistory?.detail?.filter((o: any) => o.isShipped && !o.isDelivered).length || 0}
                                </p>
                                <p className="text-xs text-gray-600">In Transit</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                <p className="text-2xl font-bold text-yellow-600">
                                    {ordersHistory?.detail?.filter((o: any) => !o.isShipped && !o.isDelivered).length || 0}
                                </p>
                                <p className="text-xs text-gray-600">Processing</p>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {!filteredOrders || filteredOrders?.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {searchQuery || statusFilter !== 'all' 
                                        ? "No Orders Found" 
                                        : "No Orders Yet"}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {searchQuery || statusFilter !== 'all'
                                        ? "Try adjusting your filters or search terms"
                                        : "Start shopping to see your order history here!"}
                                </p>
                                {!searchQuery && statusFilter === 'all' && (
                                    <Link href="/">
                                        <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all transform hover:scale-105 font-medium shadow-md">
                                            Start Shopping
                                        </button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            filteredOrders?.map((order: any) => {
                                const statusBadge = getStatusBadge(order);
                                const isDisputed = Boolean(order.user_open_dispute || order.dispute_id != null);
                                return (
                                    <div
                                        key={order.id}
                                        className={`rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden ${
                                            isDisputed ? 'bg-red-50/50 border-2 border-red-300' : 'bg-white'
                                        }`}
                                    >
                                        <div
                                            className="p-4 md:p-6 cursor-pointer"
                                            onClick={() => router.push(`/order/details/${order.orderitem_number}`)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    router.push(`/order/details/${order.orderitem_number}`);
                                                }
                                            }}
                                        >
                                                {/* Order Header */}
                                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b">
                                                    <div className="flex items-center gap-4 mb-3 md:mb-0">
                                                        {/* Product Image */}
                                                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <img
                                                                src={order.product?.featured_image?.[0]?.image_url || '/placeholder.png'}
                                                                alt={order.product?.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        
                                                        {/* Order Info */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <span className="text-xs font-medium text-gray-500">Order #</span>
                                                                <span className="font-mono text-sm font-semibold text-primary">
                                                                    {order.orderitem_number}
                                                                </span>
                                                                {isDisputed && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                                        Disputed
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                                                                {order.product?.name || order.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor} w-fit`}>
                                                        {statusBadge.icon}
                                                        <span className="font-medium text-sm">{statusBadge.text}</span>
                                                    </div>
                                                </div>

                                                {/* Order Details */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Quantity</p>
                                                        <p className="font-semibold text-gray-800">{order.qty} item(s)</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Order Total</p>
                                                        <p className="font-bold text-primary text-lg">
                                                            ₦{amountFormatter((+order.order_price_subtotal).toFixed(2))}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Payment</p>
                                                        <p className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                                            {order.isPaid ? 'Paid' : 'Pending'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Shipping</p>
                                                        <p className="font-semibold text-gray-800">
                                                            ₦{amountFormatter((+order.shipping_price || 0).toFixed(2))}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action Buttons - stop propagation so card click doesn't run */}
                                                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {isDisputed && (
                                                        <span className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-default">
                                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                                            Disputed
                                                        </span>
                                                    )}
                                                    <Link 
                                                        href={`/order/details/${order.orderitem_number}`}
                                                        className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-medium text-sm text-center"
                                                    >
                                                        View Details
                                                    </Link>
                                                    
                                                    {!order.isDelivered && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedOrderForDispute(order);
                                                                    setIsDisputeModalOpen(true);
                                                                }}
                                                                className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium text-sm border border-red-200 flex items-center justify-center gap-2"
                                                            >
                                                                <ExclamationTriangleIcon className="w-4 h-4" />
                                                                File Dispute
                                                            </button>
                                                            
                                                            {!isDisputed && (
                                                                <Link 
                                                                    href={`/disputes/${order.orderitem_number}`}
                                                                    className="flex-1 md:flex-none px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium text-sm border border-gray-200 flex items-center justify-center gap-2"
                                                                >
                                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                                    View Dispute
                                                                </Link>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Support Section */}
                    <div className="mt-12 bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg p-8 text-white">
                        <div className="max-w-3xl mx-auto text-center">
                            <h3 className="text-2xl font-bold mb-3">Need Help With Your Order?</h3>
                            <p className="text-white/90 mb-6">
                                Our support team is available 24/7 to assist you with any questions or concerns
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="mailto:support@hawola.com"
                                    className="px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all font-medium flex items-center justify-center gap-2 shadow-md"
                                >
                                    <EnvelopeIcon className="w-5 h-5" />
                                    Email Support
                                </a>
                                <a
                                    href="tel:+2348012345678"
                                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg hover:bg-white/20 transition-all font-medium flex items-center justify-center gap-2"
                                >
                                    <PhoneIcon className="w-5 h-5" />
                                    Call Support
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Products */}
                    {products?.results?.length > 0 && (
                        <div className="mt-16">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-2xl font-bold text-gray-800">You May Also Like</h4>
                                <Link href="/" className="text-primary hover:text-primary-dark font-medium flex items-center gap-2">
                                    View All
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products?.results?.slice(0, 8)?.map((product: any, key: number) => (
                                    <ProductCard key={key} product={product} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Features Section */}
                    <div className="mt-16">
                        <FeaturesSection />
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default OrderHistoryPage;
