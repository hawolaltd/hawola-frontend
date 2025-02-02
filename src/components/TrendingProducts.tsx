import React from 'react';
import BannerAds1 from "@/components/svg/banner-ads1";

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

const TrendingProducts = () => {
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

    return (<section className="max-w-screen-2xl flex gap-4 bg-[#f1f3f9] justify-center py-4">
        <div className={'max-w-screen-xl w-full flex  flex-col lg:flex-row gap-4'}>
            <div>
                <div className="mx-auto text-left mb-8 w-fullsw">
                    <div className={'flex items-center justify-between border-b border-b-[#CAD6EC] gap-8 p-4'}>
                        <h2 className="text-xl font-semibold text-primary">Trending Products</h2>

                        <div className={'flex items-center gap-2'}>
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
                    {products.map((product, key) => (<div key={key}
                                                          className={`relative bg-white border border-solid border-[#D5DFE4] rounded-lg overflow-hidden p-4`}>
                        <span
                            className={'absolute top-3 left-3 text-[10px] flex items-center justify-center bg-deepOrange w-10 h-4 rounded-full text-white'}>-17%</span>
                        <div className={'w-full flex items-center justify-center'}>
                            <img src={product.image} alt={product.name} style={{
                                width: "200px", height: "150px"
                            }}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[10px] text-textPadded font-semibold">{product.manufacturer}</h3>
                            <h3 className="text-xs font-semibold text-primary">{product.name}</h3>
                            <div className={'flex items-center gap-1'}>
                                {[1, 2, 3, 4, 5].map(star => (<svg className={'w-4 h-4'} key={star} viewBox="0 0 24 24"
                                                                   xmlns="http://www.w3.org/2000/svg">
                                        <path d="m0 0h24v24h-24z" fill="#fff" opacity="0"
                                              transform="matrix(0 1 -1 0 24 0)"/>
                                        <path
                                            d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                                            fill="#FFB067"/>
                                    </svg>))}<span className={'text-[10px] text-textPadded font-normal'}>(65)</span>
                            </div>
                            <p className="text-lg font-bold text-primary">{product.price} <span
                                className={'line-through text-xs text-textPadded'}> $3225.6</span></p>
                            <button
                                className="border border-textPadded text-primary font-bold  py-2 px-4 mt-4 rounded w-full">Add
                                to Cart
                            </button>
                        </div>
                        <ul className={"p-4 max-w-screen-xl text-primary"}>
                            <li className={'text-[10px] list-disc'}>
                                27-inch (diagonal) Retina 5K display
                            </li>
                            <li className={'text-[10px] list-disc Edit Configurations...'}>
                                3.1GHz 6-core 10th-generationc Intel Core i5
                            </li>
                            <li className={'text-[10px] list-disc'}>
                                AMD Radeon Pro 5300 graphics
                            </li>
                        </ul>
                    </div>))}
                </div>

               <div className={'w-full py-8'}>
                   <BannerAds1/>
               </div>
            </div>

            <div className={'flex flex-col gap-6'}>
                <div className="bg-white rounded gap-2">
                    <div
                        className={'bg-[#fe9636] rounded-tl rounded-tr py-4 px-4 h-[62px] flex justify-between items-center'}>
                        <h4 className={'font-semibold text-xl text-white '}>Best Seller</h4>
                    </div>
                    <div className="bg-white rounded gap-2 ">
                        {product.map((item, key) => {

                            return (<div key={key}
                                         className={`bg-white relative flex ${key + 1 !== product.length ? "border-b-[#dde4f0] border-b" : " "} pb-1 pt-4 pl-4 pr-4 overflow-hidden`}>
                                <div className="relative">
                                    {item.discountPercentage && (<span
                                        className="absolute -top-2 left-0 bg-orange-500 text-white text-xs font-semibold py-1 px-1 rounded">
                                     -{item.discountPercentage}% </span>)}
                                    <img src={item.image} alt={item.title}
                                         className="w-full h-16 object-cover"/>
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
                                            className="text-sm font-semibold text-gray-800">{item.discountedPrice}</span>
                                        <span
                                            className="text-sm line-through text-textPadded">{item.originalPrice}</span>
                                    </div>
                                </div>


                            </div>)
                        })}
                    </div>
                </div>
                <div
                    className={'bg-[url(/assets/manonwatch.png)] bg-cover bg-center bg-no-repeat flex items-center flex-col gap-2 pt-10 h-[300px]'}>
                    <span
                        className={'text-[10px] flex items-center justify-center bg-[#0BA9ED] w-10 h-4 rounded-full text-white'}>No.9</span>
                    <h4 className={'text-primary text-sm font-bold text-center'}>Sensitive Touch <br/> without
                        fingerprint</h4>
                    <p className={'text-primary text-[10px]'}>Smooth handle and accurate click</p>

                </div>
            </div>
        </div>
    </section>);
}

export default TrendingProducts;
