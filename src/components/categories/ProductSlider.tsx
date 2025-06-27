import React, { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {ProductResponse} from "@/types/product";
import {formatCurrency} from "@/util";

const ProductSlider = ({products}: {products: any}) => {
    const sliderRef = useRef<Slider>(null);

    console.log("products:", products)

    // Slider settings
    const settings = {
        dots: false, // Hide dots
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false, // Hide default arrows
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    // Navigation functions
    const goToNext = () => {
        sliderRef.current?.slickNext();
    };

    const goToPrev = () => {
        sliderRef.current?.slickPrev();
    };

    return (
        <div className="container mx-auto px-4 py-8 relative">
            <Slider ref={sliderRef} {...settings}>
                {products?.map((product: any) => (
                    <div key={product.id} className="px-2">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:border hover:border-orange">
                            <div className="p-4 flex gap-4">
                                <div>
                                    <img className="w-full h-20 object-cover" src={product?.featured_image?.[0]
                                        ?.image_url} alt="product-1"/>
                                </div>

                                <div>
                                    <h3 className="text-xs font-normal text-smallHeaderText mb-1">{product.brand}</h3>
                                    <h4 className="text-sm font-bold text-primary mb-1">{product?.name}</h4>
                                    <p className="flex items-center text-xs text-smallHeaderText mb-3"> {Array.from((product?.rating ?? 0)).map((star, key) => (
                                        <svg className={'w-4 h-4'} key={key} viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path d="m0 0h24v24h-24z" fill="#fff" opacity="0"
                                                  transform="matrix(0 1 -1 0 24 0)"/>
                                            <path
                                                d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                                                fill="#FFB067"/>
                                        </svg>))}({product.rating})</p>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-lg font-bold text-primary">{formatCurrency(product?.price)}</span>
                                            <span className="text-sm text-smallHeaderText line-through ml-2">{product.discount_price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            <button
                onClick={goToPrev}
                className="w-6 h-6 absolute -left-6 top-[35%] flex items-center justify-center rounded-md border border-primary transition-colors"
                aria-label="Previous"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={goToNext}
                className="w-6 h-6 absolute -right-6 top-[35%] flex items-center justify-center rounded-md border border-primary transition-colors"
                aria-label="Next"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

        </div>
    );
};

export default ProductSlider;