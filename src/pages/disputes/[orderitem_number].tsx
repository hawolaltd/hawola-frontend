import React, { useEffect, useState } from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAppDispatch, useAppSelector } from '@/hook/useReduxTypes';
import {
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import {getDisputes} from "@/redux/disputes/disputeSlice";
import {useRouter} from "next/router";

const DisputesPage = () => {
    const dispatch = useAppDispatch();
    const { disputes, isLoading, error } = useAppSelector((state) => state.disputes);
    const [statusFilter, setStatusFilter] = useState('all');

    console.log("disputes:", disputes)

    const { query } = useRouter()


    const filteredDisputes = [disputes?.disputes]?.filter((dispute: any) =>
        statusFilter === 'all' ? true : dispute.status === statusFilter
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <ClockIcon className="w-5 h-5 text-yellow-500" />;
            case 'under_review':
                return <ArrowPathIcon className="w-5 h-5 text-blue-500" />;
            case 'resolved':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'refund_issued':
                return <ExclamationTriangleIcon className="w-5 h-5 text-purple-500" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        return status?.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    useEffect(() => {
        dispatch(getDisputes(query?.orderitem_number as string));
    }, [dispatch, query?.orderitem_number]);

    if (isLoading) {
        return (
            <AuthLayout>
                <div className="container mx-auto px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </AuthLayout>
        );
    }
    console.log('error:',error)
    // if (error) {
    //     return (
    //         <AuthLayout>
    //             <div className="container mx-auto px-4 py-8 text-center">
    //                 <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Disputes</h2>
    //                 <p className="text-gray-600 mb-8">Please try refreshing the page or contact support.</p>
    //                 <button
    //                     onClick={() => dispatch(getDisputes(query?.orderitem_number as string))}
    //                     className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
    //                 >
    //                     Retry
    //                 </button>
    //             </div>
    //         </AuthLayout>
    //     );
    // }

    return (
        <AuthLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Disputes</h1>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-md bg-white"
                        >
                            <option value="all">All Disputes</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                            <option value="refund_issued">Refund Issued</option>
                        </select>
                    </div>

                    {/* Disputes List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {filteredDisputes?.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No disputes found
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredDisputes?.map((dispute: any) => (
                                    <div key={dispute?.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                          {/*                      <div className="flex items-center gap-2 mb-1">*/}
                          {/*                          {getStatusIcon(dispute.status)}*/}
                          {/*                          <span className="font-medium">*/}
                          {/*  Order #{dispute.orderId}*/}
                          {/*</span>*/}
                          {/*                      </div>*/}
                                                <p className="text-gray-600 text-sm">
                                                    {dispute?.dispute_reason} • Filed on{' '}
                                                    {new Date(dispute?.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                            dispute?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                dispute?.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                                    dispute?.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                        dispute?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-purple-100 text-purple-800'
                        }`}>
                          {getStatusText(dispute?.status)}
                        </span>
                                                <button className="text-sm text-primary hover:underline">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default DisputesPage;