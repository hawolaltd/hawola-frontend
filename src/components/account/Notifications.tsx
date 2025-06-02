import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';

const Notifications: NextPage = () => {
    const [currentPage, setCurrentPage] = useState(1);

    const notifications = [
        {
            id: '1',
            image: '/imgs/page/homepage1/electric.png',
            title: 'COD payment confirmed',
            message: 'Order 220914QR92BXNH has been confirmed. Please check the estimated delivery time in the order details section!',
        },
        {
            id: '2',
            image: '/imgs/page/homepage1/electric.png',
            title: 'COD payment confirmed',
            message: 'Order 220914QR92BXNH has been confirmed. Please check the estimated delivery time in the order details section!',
        },
        {
            id: '3',
            image: '/imgs/page/homepage1/electric.png',
            title: 'COD payment confirmed',
            message: 'Order 220914QR92BXNH has been confirmed. Please check the estimated delivery time in the order details section!',
        },
        {
            id: '4',
            image: '/imgs/page/homepage1/electric.png',
            title: 'COD payment confirmed',
            message: `Order 220914QR92BXNH has been confirmed. Please check the estimated delivery time in the order details section!`,
        },
    ];

    const itemsPerPage = 4;
    const totalPages = Math.ceil(notifications.length / itemsPerPage);
    const paginatedNotifications = notifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
            <main className="">
                {/* Notifications List */}
                <div className="space-y-4">
                    {paginatedNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="flex items-center p-4 rounded-lg border border-detailsBorder"
                        >
                            <img
                                src={notification.image}
                                alt={notification.title}
                                className="w-16 h-16 object-contain mr-4"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-primary">
                                    {notification.title}
                                </p>
                                <p className="text-xs text-primary">
                                    {notification.message}
                                </p>
                            </div>
                            <button className="bg-primary text-white px-4 py-2 rounded text-sm">
                                View Details
                            </button>
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
            </main>
    );
};

export default Notifications;