import React from 'react';
import Image from "next/image";

const reviews = [
    { name: 'Sienna', date: 'December 4, 2022 at 3:12 pm', rating: 5, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Delectus, suscipit exercitationem accusantium obcaecati quos voluptate nesciunt facilis itaque modi commodi dignissimos sequi repudiandae minus ab deleniti totam officia id incidunt?' },
    { name: 'Brenna', date: 'December 4, 2022 at 3:12 pm', rating: 5, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Delectus, suscipit exercitationem accusantium obcaecati quos voluptate nesciunt facilis itaque modi commodi dignissimos sequi repudiandae minus ab deleniti totam officia id incidunt?', reply: true },
    { name: 'Gemma', date: 'December 4, 2022 at 3:12 pm', rating: 4, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Delectus, suscipit exercitationem accusantium obcaecati quos voluptate nesciunt facilis itaque modi commodi dignissimos sequi repudiandae minus ab deleniti totam officia id incidunt?' }
];

const ratings = [
    { stars: 5, percentage: 50 },
    { stars: 4, percentage: 25 },
    { stars: 3, percentage: 45 },
    { stars: 2, percentage: 65 },
    { stars: 1, percentage: 85 }
];

const CustomerReviews = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-primary mb-4">Customer questions & answers</h2>
                <div className="space-y-4">
                    {reviews.map((review, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 border border-[#dde4f0] rounded-lg ">
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
                                   <p className="mt-2 text-primary text-sm font-bold flex items-center gap-0">{review.text } </p>
                                   {/*{review.reply && <a href="#" className="text-blue-500 text-sm font-medium mt-1 block">Reply</a>}*/}
                               </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-primary mb-4">Customer reviews</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-orange text-sm">★★★★★</span>
                    <span className="text-sm text-primary font-semibold">4.8 out of 5</span>
                </div>

                <div className="mt-4 space-y-2">
                    {ratings.map((rating, index) => (
                        <div key={index} className="flex items-center space-x-2">
                        <span className="text-xs text-[#08a9ed] w-[15%]">{rating.stars} star</span>
                            <div className="w-full h-4 bg-[#f2f2f2]">
                                <div
                                    className="h-4 bg-[#08a9ed] flex items-center justify-center"
                                    style={{width: `${rating.percentage}%`}}
                                ><span className="text-xs text-white">{rating.percentage}%</span></div>
                            </div>

                        </div>
                    ))}
                </div>

                <p className="mt-4 text-sm text-gray-500 underline cursor-pointer">How are ratings calculated?</p>
            </div>
        </div>
    );
};

export default CustomerReviews;
