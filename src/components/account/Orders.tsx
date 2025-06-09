import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import {useAppSelector} from "@/hook/useReduxTypes";

const Orders: NextPage = () => {
    const [currentPage, setCurrentPage] = useState(1);

    const {ordersHistory} = useAppSelector(state => state.products)

    const itemsPerPage = 2;
    const totalPages = Math.ceil(ordersHistory?.detail.length / itemsPerPage);
    const paginatedOrders = ordersHistory?.detail.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="">
                {/* Orders List */}
                <div className="space-y-4">
                    {paginatedOrders.map((order) => (
                        <div
                            key={order.id}
                            className="border border-detailsBorder rounded p-4"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-blue-900">
                                        Order ID: {order.id}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Date: {order.createdAt}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                  <span
                      className={`px-2 py-1 rounded text-sm ${
                          order.isDelivered
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                      }`}
                  >
                    {order.isDelivered ? "Delivered" : order.isPaid ? "Paid" : order.isShipped ? "Shipped" : "Reviewed" }
                  </span>
                                    <button className="bg-blue-900 text-white px-4 py-2 rounded text-sm">
                                        View Order
                                    </button>
                                </div>
                            </div>
                                <div

                                    className="flex items-center justify-between py-2 border-t last:border-b-0"
                                >
                                    <div className="flex items-center">
                                        <img
                                            src={order?.product?.featured_image?.[0]?.image?.thumbnail}
                                            alt={order?.product?.name}
                                            className="w-16 h-16 object-contain mr-4"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900">
                                                {order?.product?.name}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Quantity: {order?.qty}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-900">${(+(order?.product?.price)).toFixed(2)}</p>
                                </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
            <div className="flex justify-start mt-6 space-x-2">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-gray-600 disabled:text-gray-300 rotate-180"
                >
                    <svg width="10" height="10" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.93974 14.281C5.81307 14.281 5.68641 14.2343 5.58641 14.1343C5.39307 13.941 5.39307 13.621 5.58641 13.4277L9.93307 9.08099C10.2531 8.76099 10.2531 8.24099 9.93307 7.92099L5.58641 3.57432C5.39307 3.38099 5.39307 3.06099 5.58641 2.86766C5.77974 2.67432 6.09974 2.67432 6.29307 2.86766L10.6397 7.21432C10.9797 7.55432 11.1731 8.01432 11.1731 8.50099C11.1731 8.98766 10.9864 9.44766 10.6397 9.78766L6.29307 14.1343C6.19307 14.2277 6.06641 14.281 5.93974 14.281Z" fill="#25396F"/>
                    </svg>

                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 py-1 rounded text-xs font-bold flex items-center justify-center ${
                            currentPage === page
                                ? 'bg-orange text-white'
                                : 'text-primary border border-primary'
                        }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-gray-600 disabled:text-gray-300"
                >
                    <svg width="10" height="10" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.93974 14.281C5.81307 14.281 5.68641 14.2343 5.58641 14.1343C5.39307 13.941 5.39307 13.621 5.58641 13.4277L9.93307 9.08099C10.2531 8.76099 10.2531 8.24099 9.93307 7.92099L5.58641 3.57432C5.39307 3.38099 5.39307 3.06099 5.58641 2.86766C5.77974 2.67432 6.09974 2.67432 6.29307 2.86766L10.6397 7.21432C10.9797 7.55432 11.1731 8.01432 11.1731 8.50099C11.1731 8.98766 10.9864 9.44766 10.6397 9.78766L6.29307 14.1343C6.19307 14.2277 6.06641 14.281 5.93974 14.281Z" fill="#25396F"/>
                    </svg>

                </button>
            </div>
        </div>
    );
};

export default Orders;