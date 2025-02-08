import React from 'react';
import Slider from "react-slick";

const Hero = () => {

    const settings = {
        dots: false, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1,
    };

    const proSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 2,
        vertical: true,
        verticalSwiping: true,
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
    return (<section className="grid grid-cols-1 lg:grid-cols-6 gap-4 py-4 max-w-screen-xl mx-auto ">


            <Slider {...settings} className={'rounded-xl col-span-3 bg-[#b8f2ff] bg-custom-bg bg-cover bg-center'}>
                <div className="w-full p-6">
                    <h1 className="text-5xl font-bold text-gray-800 mb-6 text-left tracking-wide leading-snug">360
                        Degree <br/> Virtual Reality</h1>
                    <ul className="text-lg text-gray-600 mb-8">
                        <li>Free Shipping. Secure Payment</li>
                        <li>Contact us 24hrs a day</li>
                        <li>Support gift service</li>
                    </ul>
                    <div className={'flex items-center gap-1'}>
                        <button className="bg-headerBg text-white py-3 px-6 rounded-lg text-sm">Shop Now</button>
                        <button className="text-headerBg py-3 px-6 underline text-sm">Learn more</button>

                    </div>
                </div>

                <div className=" w-full p-6">
                    <h1 className="text-5xl font-bold text-gray-800 mb-6 text-left tracking-wide leading-snug">Welcome
                        to E-Shop</h1>
                    <p className="text-lg text-gray-600 mb-8">Discover the best deals on your favorite products</p>
                    <button className="bg-headerBg text-white py-3 px-6 rounded-lg text-sm">Shop Now</button>
                </div>

                <div className="w-full p-6">
                    <h1 className="text-5xl font-bold text-gray-800 mb-6 text-left tracking-wide leading-snug">Welcome
                        to E-Shop</h1>
                    <p className="text-lg text-gray-600 mb-8">Discover the best deals on your favorite products</p>
                    <button className="bg-headerBg text-white py-3 px-6 rounded-lg text-sm">Shop Now</button>
                </div>

            </Slider>

            <div className={'flex flex-col gap-6 items-center max-w-screen-2xl col-span-6 lg:col-span-2 '}>
                <div
                    className="w-full  flex flex-row justify-between bg-[#fff4ea] bg-custom-bg2 bg-cover bg-center rounded ">
                    <div className={'py-4 pl-4'}>
                        <h4 className="text-4xl  font-bold text-[#0e234d]">Metaverse</h4>
                        <p className="text-lg text-[#0e234d] mb-6">The future of creativity</p>
                        <button className="text-[#fe9636] py-2  rounded text-sm">Learn more</button>
                    </div>

                    {/*<div className={'flex items-end justify-end'}>*/}
                    {/*    <img src={'/assets/slidebgre2.png'} width={200} height={150} alt={''}/>*/}
                    {/*</div>*/}
                </div>
                <div
                    className="relative p-6 flex flex-row bg-[#fff1f6] h-full bg-custom-bg3 bg-cover bg-center  rounded w-full">
                    <div className={'flex gap-12 flex-col w-full'}>
                        <div className={'flex  flex-col'}>
                            <h4 className="text-sm text-[#435a8c]">Headphone</h4>
                            <p className="text-3xl font-bold text-[#0e234d] ">Rockez 547</p>
                            <p className="text-sm text-[#08a9ed] ">Everywhere anytime</p>
                        </div>
                        <button className="text-white py-2 bg-[#fe9636] w-2/5 px-4 rounded text-sm">Shop Now</button>
                    </div>

                </div>
            </div>
            <div
                className="w-full lg:w-full mx-auto p-2 rounded border-2 border-solid border-[#fe9636] flex flex-col gap-2 text-center h-full ">
                <Slider {...proSettings} className={'w-full h-full flex flex-col border border-primary'}>

                    {["/imgs/page/homepage4/promotion1.png", "/imgs/page/homepage4/promotion2.png", "/imgs/page/homepage4/promotion3.png", "/imgs/page/homepage4/promotion4.png", "/imgs/page/homepage4/promotion5.png", "/imgs/page/homepage4/promotion6.png"].map((item, key) => (
                        <div key={key} className="w-full flex flex-col h-full border border-primary">
                            <img src={item} alt={''}/>
                        </div>))}
                </Slider>
            </div>
        </section>);
}

export default Hero;
