import React from 'react';
import BannerAds1 from "@/components/svg/banner-ads1";
import ProductCard from "@/components/product/ProductCard";
import ProductCard2 from "@/components/product/ProductCard2";

const products = [{
    id: 1,
    manufacturer: "HP",
    name: 'HP 22 All-in-One PC, Intel Pentium Silver J5040, 4GB RAM',
    price: '$2856.3',
    image: '/imgs/page/homepage1/imgsp1.png'
}, {
    id: 2,
    manufacturer: "Gateway",
    name: 'HP 22 All-in-One PC, Intel Pentium Silver J5040, 4GB RAM',
    price: '$2856.3',
    image: '/imgs/page/homepage1/imgsp2.png'
}, {
    id: 3,
    manufacturer: "Dell",
    name: 'Dell Optiplex 9020 Small Form Business Desktop Tower PC',
    price: '$2856.3',
    image: '/imgs/page/homepage1/imgsp3.png'
}, {
    id: 4,
    manufacturer: "SAMSUNG",
    name: 'HP 24 All-in-One PC, Intel Core i3-1115G4, 4GB RAM',
    price: '$2856.3',
    image: '/imgs/page/homepage1/imgsp4.png'
}, {
    id: 5,
    manufacturer: "HP",
    name: 'Gateway 23.8" All-in-one Desktop, Fully Adjustable Stand',
    price: '$2856.3',
    image: '/imgs/page/homepage1/imgsp5.png'
}, {
    id: 6,
    manufacturer: "Gateway",
    name: 'HP 22 All-in-One PC, Intel Pentium Silver J5040, 4GB RAM',
    price: '$2856.3',
    image: '/imgs/page/homepage1/imgsp6.png'
}, {
    id: 7,
    manufacturer: "HP",
    name: 'HP Slim Desktop, Intel Celeron J4025, 4GB RAM, 256GB SSD',
    price: '$2856.3',
    image: '/imgs/page/homepage1/imgsp7.png'
}, {
    id: 8,
    manufacturer: "HP",
    name: 'HP Slim Desktop, Intel Celeron J4025, 4GB RAM, 256GB SSD',
    price: '$2856.3',
    image: '/imgs/page/homepage1/gaming.png'
},];

interface ProductCardProps {
    image: string;
    title: string;
    rating: number;
    reviews: number;
    originalPrice: string;
    discountedPrice: string;
    discountPercentage: number;
}

const TopRateProducts = () => {
    const product: ProductCardProps[] = [{
        image: "/imgs/page/homepage1/imgsp7.png",
        title: "LG 65\" Class 4K UHD Smart TV OLED A1 Series",
        rating: 4,
        reviews: 65,
        originalPrice: "$3225.6",
        discountedPrice: "$2556.3",
        discountPercentage: 17,
    }, {
        image: "/assets/watch.jpg",
        title: "Chromecast with Google TV – Streaming Entertainment",
        rating: 5,
        reviews: 65,
        originalPrice: "$3225.6",
        discountedPrice: "$2556.3",
        discountPercentage: 17,
    }, {
        image: "/imgs/page/homepage2/airpod.png",
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
    }, {
        image: "/assets/watch.jpg",
        title: "Chromecast with Google TV – Streaming Entertainment",
        rating: 5,
        reviews: 65,
        originalPrice: "$3225.6",
        discountedPrice: "$2556.3",
        discountPercentage: 17,
    }, {
        image: "/imgs/page/homepage2/airpod.png",
        title: "2022 Apple iMac with Retina 5K Display 8GB RAM, 256GB SSD",
        rating: 4,
        reviews: 65,
        originalPrice: "$3225.6",
        discountedPrice: "$2556.3",
        discountPercentage: 17,
    },]

    return (<section className="max-w-screen-2xl px-6 xl:px-0 flex gap-4 bg-[#f1f3f9] justify-center py-4">
        <div className={'max-w-screen-xl w-full flex  flex-col xl:flex-row gap-4'}>
            <div>
                <div className="mx-auto text-left mb-8 w-fullsw">
                    <div className={'flex items-center justify-between border-b border-b-[#CAD6EC] gap-8 p-4'}>
                        <h2 className="text-xl font-semibold text-primary">Top Rated Products</h2>

                        <div className={'hidden lg:flex items-center gap-2'}>
                            <div
                                className={'p-1 border border-textPadded rounded flex items-center justify-center'}>
                                <svg className="w-2 h-2 text-textPadded" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"/>
                                </svg>

                            </div>

                            <div
                                className={'p-1 border border-textPadded rounded flex items-center justify-center'}>

                                <svg className="w-2 h-2 text-textPadded" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {products.map((product, key) => (
                        <ProductCard key={key} product={product}/>
                    ))}
                </div>

            </div>

            <div className={'flex flex-col gap-6'}>
                <div className="bg-white rounded gap-2">
                    <div
                        className={'bg-[#fe9636] rounded-tl rounded-tr py-4 px-4 h-[62px] flex justify-between items-center'}>
                        <h4 className={'font-semibold text-xl text-white '}>New Products</h4>
                    </div>
                    <div className="bg-white rounded gap-2 ">
                        {product.map((item, key) => {

                            return (
                                <ProductCard2 product={product} key={key} item={item}/>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    </section>);
}

export default TopRateProducts;
