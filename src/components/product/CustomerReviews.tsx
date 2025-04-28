import React from 'react';
import Image from "next/image";
import {useAppSelector} from "@/hook/useReduxTypes";

const CustomerReviews = () => {
    const { merchantReviews } = useAppSelector(state => state.products);
    const reviews = merchantReviews?.results || [];

    // Calculate ratings from reviews data
    const calculateRatings = () => {
        if (!reviews.length) return [];

        // Count how many reviews for each star rating
        const ratingCounts = [0, 0, 0, 0, 0]; // [1-star, 2-star, 3-star, 4-star, 5-star]

        reviews.forEach((review: any) => {
            if (review.rating >= 1 && review.rating <= 5) {
                ratingCounts[review.rating - 1]++;
            }
        });

        // Calculate percentages
        const totalReviews = reviews.length;
        return ratingCounts.map((count, index) => ({
            stars: 5 - index, // Show from 5-star to 1-star
            count,
            percentage: Math.round((count / totalReviews) * 100)
        })).reverse(); // Reverse to show 5-star first
    };

    // Calculate average rating
    const averageRating = reviews.length
        ? (reviews.reduce((sum, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const ratings = calculateRatings();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-primary mb-4">Customer questions & answers</h2>

                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review: any, index: number) => (
                            <div key={index} className="flex items-start space-x-4 p-4 border border-[#dde4f0] rounded-lg">
                                <div>
                                    <img
                                        src={'/assets/author-3.png'}
                                        alt="Profile"
                                        width={'200px'}
                                        height={'50px'}
                                        className={'rounded-full object-cover'}
                                    />
                                    <p className="font-bold text-center text-primary text-sm">{review.name}</p>
                                </div>
                                <div>
                                    <div>
                                        <div className={'flex justify-between items-center'}>
                                            <p className="text-sm text-primary">{review.date}</p>
                                            <div className="ml-auto text-orange">
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>

                                        <div className={'flex items-center gap-2'}>
                                            <p className="mt-2 text-primary text-sm font-bold flex items-center gap-0">{review.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 border border-[#dde4f0] rounded-lg text-center">
                        <Image
                            src="/assets/no-reviews.webp"
                            alt="No reviews"
                            width={150}
                            height={150}
                            className="mx-auto mb-4"
                        />
                        <h3 className="text-lg font-medium text-primary mb-2">No reviews yet</h3>
                        <p className="text-sm text-gray-500">Be the first to share your thoughts about this product!</p>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold text-primary mb-4">Customer reviews</h2>
                {reviews.length > 0 ? (
                    <>
                        <div className="flex items-center space-x-2">
                            <span className="text-orange text-sm">★★★★★</span>
                            <span className="text-sm text-primary font-semibold">{averageRating} out of 5</span>
                            <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                        </div>

                        <div className="mt-4 space-y-2">
                            {ratings.map((rating, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <span className="text-xs text-[#08a9ed] w-[15%]">{rating.stars} star</span>
                                    <div className="w-full h-4 bg-[#f2f2f2]">
                                        <div
                                            className="h-4 bg-[#08a9ed] flex items-center justify-center"
                                            style={{width: `${rating.percentage}%`}}
                                        >
                                            <span className="text-xs text-white">
                                                {rating.count} ({rating.percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="mt-4 text-sm text-gray-500">
                        No ratings yet. Be the first to review this product!
                    </div>
                )}

                <p className="mt-4 text-sm text-gray-500 underline cursor-pointer">How are ratings calculated?</p>
            </div>
        </div>
    );
};

export default CustomerReviews;