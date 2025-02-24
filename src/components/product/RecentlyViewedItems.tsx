import React from 'react';
import Ads2 from "@/components/svg/ads2";
import Ads3 from "@/components/svg/ads3";
import NewsSection from "@/components/home/NewsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import SubscribeSection from "@/components/home/SubscribeSection";

interface ProductCardProps {
    image: string;
    title: string;
    rating: number;
    reviews: number;
    originalPrice: string;
    discountedPrice: string;
    discountPercentage: number;
}


function RecentlyViewedItems() {
    return (
        <section className="max-w-screen-2xl flex flex-col gap-4 items-center justify-center py-4">

            <div className="max-w-screen-xl flex flex-col justify-center py-4">
                <div
                    className="flex flex-col mx-auto text-left mb-8 w-full pb-4">
                    <div className={'flex flex-col '}>
                        <h2 className="text-2xl font-bold text-primary">Recently viewed items</h2>
                    </div>

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full border-b-[#dde4f0] border-b pb-8">
                    {product.map((item, key) => {

                        return (<div key={key}
                                     className={`bg-white relative flex  pb-1 pt-4 pl-4 pr-4 overflow-hidden`}>
                            <div className="relative">
                                {item.discountPercentage && (<span
                                    className="absolute -top-2 left-0 bg-orange-500 text-white text-xs font-semibold py-1 px-1 rounded">
                                     -{item.discountPercentage}% </span>)}
                                <img src={item.image} alt={item.title}
                                     className="w-full h-20 object-cover"/>
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-primary">{item.title}</h3>
                                <div className={'flex items-center gap-1'}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg className={'w-4 h-4'} key={star} viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path d="m0 0h24v24h-24z" fill="#fff" opacity="0"
                                                  transform="matrix(0 1 -1 0 24 0)"/>
                                            <path
                                                d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                                                fill="#FFB067"/>
                                        </svg>))}<span
                                    className={'text-[10px] text-textPadded font-normal'}>(65)</span>
                                </div>
                                <p className="text-sm text-primary">{item.reviews} reviews</p>
                                <div className="flex gap-2 items-center">
                                        <span
                                            className="text-sm font-bold text-primary ">{item.discountedPrice}</span>
                                    <span
                                        className="text-sm line-through text-textPadded">{item.originalPrice}</span>
                                </div>
                            </div>


                        </div>)
                    })}
                </div>

            </div>

        </section>
    );
}

const product: ProductCardProps[] = [{
    image: "/imgs/page/homepage1/imgsp1.png",
    title: "LG 65\" Class 4K UHD Smart TV OLED A1 Series",
    rating: 4,
    reviews: 65,
    originalPrice: "$3225.6",
    discountedPrice: "$2556.3",
    discountPercentage: 17,
}, {
    image: "/imgs/page/homepage1/imgsp2.png",
    title: "Chromecast with Google TV – Streaming Entertainment",
    rating: 5,
    reviews: 65,
    originalPrice: "$3225.6",
    discountedPrice: "$2556.3",
    discountPercentage: 17,
}, {
    image: "/imgs/page/homepage1/imgsp1.png",
    title: "2022 Apple iMac with Retina 5K Display 8GB RAM, 256GB SSD",
    rating: 4,
    reviews: 65,
    originalPrice: "$3225.6",
    discountedPrice: "$2556.3",
    discountPercentage: 17,
}, {
    image: "/imgs/page/homepage1/imgsp7.png",
    title: "RCA 43\" Class 4K Ultra HD (2160P) HDR Roku Smart",
    rating: 5,
    reviews: 65,
    originalPrice: "$3225.6",
    discountedPrice: "$2556.3",
    discountPercentage: 17,
}]

export default RecentlyViewedItems;