import React from 'react';
import Slider from "react-slick";

const products = [
    { id: 1, manufacturer: "HP", name: 'HP 22 All-in-One PC, Intel Pentium Silver J5040, 4GB RAM', price: '$2856.3', image: '/imgs/page/homepage1/imgsp1.png' },
    { id: 1, manufacturer: "Gateway", name: 'HP 22 All-in-One PC, Intel Pentium Silver J5040, 4GB RAM', price: '$2856.3', image: '/imgs/page/homepage1/imgsp2.png' },
    { id: 1, manufacturer: "Dell", name: 'Dell Optiplex 9020 Small Form Business Desktop Tower PC', price: '$2856.3', image: '/imgs/page/homepage1/imgsp3.png' },
    { id: 2,  manufacturer: "SAMSUNG", name: 'HP 24 All-in-One PC, Intel Core i3-1115G4, 4GB RAM', price: '$2856.3', image: '/imgs/page/homepage1/imgsp4.png' },
    { id: 3,  manufacturer: "HP", name: 'Gateway 23.8" All-in-one Desktop, Fully Adjustable Stand', price: '$2856.3', image: '/imgs/page/homepage1/imgsp5.png' },
    { id: 4,  manufacturer: "Gateway", name: 'HP 22 All-in-One PC, Intel Pentium Silver J5040, 4GB RAM', price: '$2856.3', image: '/imgs/page/homepage1/imgsp6.png' },
    { id: 4,  manufacturer: "HP", name: 'HP Slim Desktop, Intel Celeron J4025, 4GB RAM, 256GB SSD', price: '$2856.3', image: '/imgs/page/homepage1/imgsp7.png' },
];

const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                infinite: true,
                dots: false
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                initialSlide: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};


const ProductList = () => {
    return (
        <section className="max-w-screen-xl  mx-auto py-4">
            <div className="flex justify-between items-center mx-auto text-left mb-8 w-full border-b border-b-[#CAD6EC] pb-4">
                <div className={'flex items-center gap-8'}>
                    <h2 className="text-xl font-semibold text-[#425A8B]">Featured</h2>
                    <h2 className="text-xl font-semibold text-[#8C9EC5]">Best Seller</h2>
                    <h2 className="text-xl font-semibold text-[#8C9EC5]">Most Viewed</h2>
                </div>

                <div className={'flex items-center gap-2'}>
                    <div className={'p-1 border border-textPadded rounded flex items-center justify-center'}>
                        <svg className="w-2 h-2 text-textPadded" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"/>
                        </svg>

                    </div>

                    <div className={'p-1 border border-textPadded rounded flex items-center justify-center'}>

                        <svg className="w-2 h-2 text-textPadded" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 w-full">
                <Slider {...settings} className={'w-full'}>
                {products.map((product) => (
                    <div key={product.id} className={'p-2'}>
                        <div className={`relative bg-white border border-solid border-[#D5DFE4] rounded-lg overflow-hidden p-4`}>
                            <span className={'absolute top-3 left-3 text-[10px] flex items-center justify-center bg-deepOrange w-10 h-4 rounded-full text-white'}>-17%</span>

                            <div className={'w-full flex items-center justify-center'}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={product.image} alt={product.name} style={{
                                    width: "200px",
                                    height: "150px"
                                }}/>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-[10px] text-textPadded font-semibold">{product.manufacturer}</h3>
                                <h3 className="text-xs font-semibold text-primary">{product.name}</h3>
                                <div className={'flex items-center gap-1'}>
                                    {
                                        [1, 2, 3, 4, 5].map(star => (
                                            <svg className={'w-4 h-4'} key={star} viewBox="0 0 24 24"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path d="m0 0h24v24h-24z" fill="#fff" opacity="0"
                                                      transform="matrix(0 1 -1 0 24 0)"/>
                                                <path
                                                    d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                                                    fill="#FFB067"/>
                                            </svg>
                                        ))
                                    }<span className={'text-[10px] text-textPadded font-normal'}>(65)</span>
                                </div>
                                <p className="text-lg font-bold text-primary">{product.price} <span
                                    className={'line-through text-xs text-textPadded'}> $3225.6</span></p>
                                <button
                                    className="border border-textPadded text-primary font-bold  py-2 px-4 mt-4 rounded-lg w-full">Add
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
                        </div>
                    </div>
                ))}
                </Slider>
            </div>
        </section>
    );
}

export default ProductList;
