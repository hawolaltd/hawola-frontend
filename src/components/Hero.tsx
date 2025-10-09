import { useAppSelector } from "@/hook/useReduxTypes";
import React, {useEffect, useState} from "react";
import Slider from "react-slick";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Mousewheel,
} from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import {AdvertBanner} from "@/types/home";


// Image Slider Component
interface ImageSliderProps {
    banners: AdvertBanner[];
}
function ImageSlider({ banners }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlay || banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === banners.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlay, banners.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
    };

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full group h-full ">
            {/* Main slider container */}
            <div className="relative overflow-hidden rounded-lg w-full h-full ">
                <div
                    className="flex transition-transform duration-500 ease-in-out h-full "
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {banners.map((banner, index) => (
                        <div key={banner.id} className="w-full flex-shrink-0 relative">
                            <Image
                                src={banner.web_banner_image || banner.banner_image}
                                alt={`Advertisement ${index + 1}`}
                                width={1200}
                                height={300}
                                className="w-full h-full "
                                priority={index === 0}
                            />
                            {banner.url && (
                                <a
                                    href={banner.url}
                                    className="absolute inset-0 z-10"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity opacity-0 group-hover:opacity-100"
                        aria-label="Previous slide"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity opacity-0 group-hover:opacity-100"
                        aria-label="Next slide"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </>
            )}

            {/*/!* Dots indicator *!/*/}
            {/*{banners.length > 1 && (*/}
            {/*    <div className="flex justify-center mt-4 space-x-2">*/}
            {/*        {banners.map((_, index) => (*/}
            {/*            <button*/}
            {/*                key={index}*/}
            {/*                onClick={() => goToSlide(index)}*/}
            {/*                className={`w-3 h-3 rounded-full transition-colors ${*/}
            {/*                    index === currentIndex*/}
            {/*                        ? "bg-primary"*/}
            {/*                        : "bg-gray-300 hover:bg-gray-400"*/}
            {/*                }`}*/}
            {/*                aria-label={`Go to slide ${index + 1}`}*/}
            {/*            />*/}
            {/*        ))}*/}
            {/*    </div>*/}
            {/*)}*/}

            {/* Auto-play toggle */}
            {/*{banners.length > 1 && (*/}
            {/*    <button*/}
            {/*        onClick={() => setIsAutoPlay(!isAutoPlay)}*/}
            {/*        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"*/}
            {/*        aria-label={isAutoPlay ? "Pause slideshow" : "Play slideshow"}*/}
            {/*    >*/}
            {/*        {isAutoPlay ? (*/}
            {/*            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">*/}
            {/*                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />*/}
            {/*            </svg>*/}
            {/*        ) : (*/}
            {/*            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">*/}
            {/*                <path d="M8 5v14l11-7z" />*/}
            {/*            </svg>*/}
            {/*        )}*/}
            {/*    </button>*/}
            {/*)}*/}
        </div>
    );
}

const Hero = () => {
  const { homePage } = useAppSelector((state) => state.general);

  console.log("homePage:", homePage);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    customPaging: (i: any) => <div className="w-3 h-3 rounded-full mx-1"></div>,
    appendDots: (dots: any) => (
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: "1rem",
          left: "2rem",
          gap: 0,
        }}
      >
        {dots}
      </div>
    ),
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 py-4 px-6 xl:px-0 max-w-screen-xl mx-auto ">
      <div className={"xl:col-span-9  rounded-xl "}>
          {/*{homePage?.data?.banners?.map((item, index) => (*/}
              <ImageSlider banners={homePage?.data?.banners as any || []} />
          {/*))}*/}

        {/*<Slider*/}
        {/*  {...settings}*/}
        {/*  className={"relative hoome-sllider-dots rounded-xl w-full h-full  "}*/}
        {/*>*/}
        {/*    {homePage?.data?.banners?.map((item, index) => (*/}
        {/*        <div key={index} className="w-full py-14 bg-[#b8f2ff]  rounded-xl bg-custom-bg bg-cover bg-center px-10">*/}
        {/*            <h1*/}
        {/*                className="text-5xl font-bold text-gray-800 mb-6 text-left tracking-wide leading-snug"*/}
        {/*                style={{*/}
        {/*                    textShadow: "-2px -2px 0px #FFF500, 2px 2px 0px #FF6BC4",*/}
        {/*                    textTransform: "uppercase",*/}
        {/*                }}*/}
        {/*            >*/}
        {/*                360 Degree <br /> Virtual Reality*/}
        {/*            </h1>*/}
        {/*            <ul className="text-lg text-gray-600 mb-8">*/}
        {/*                <li>Free Shipping. Secure Payment</li>*/}
        {/*                <li>Contact us 24hrs a day</li>*/}
        {/*                <li>Support gift service</li>*/}
        {/*            </ul>*/}
        {/*            <div className={"flex items-center gap-1"}>*/}
        {/*                <button className="bg-headerBg text-white py-3 px-6 rounded-lg text-sm">*/}
        {/*                    Shop Now*/}
        {/*                </button>*/}
        {/*                <button className="text-headerBg py-3 px-6 underline text-sm">*/}
        {/*                    Learn more*/}
        {/*                </button>*/}
        {/*            </div>*/}
        {/*        </div>*/}
        {/*    ))}*/}



        {/*</Slider>*/}
      </div>

      <div
        className={
          "max-w-screen-xl xl:col-span-3 flex flex-col lg:flex-row gap-0 xl:gap-0 w-full"
        }
      >
        {/*<div className={"flex flex-col gap-6 items-center w-full"}>*/}
        {/*  <div className="w-full flex flex-row justify-between bg-[#fff4ea] bg-custom-bg2 bg-cover bg-center rounded">*/}
        {/*    <div className={"py-4 pl-4"}>*/}
        {/*      <h4 className="text-4xl font-bold text-[#0e234d]">Metaverse</h4>*/}
        {/*      <p className="text-lg text-[#0e234d] mb-6">*/}
        {/*        The future of creativity*/}
        {/*      </p>*/}
        {/*      <button className="text-[#fe9636] py-2 rounded text-sm">*/}
        {/*        Learn more*/}
        {/*      </button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*  <div className="relative p-6 flex flex-row bg-[#fff1f6] h-full bg-custom-bg3 bg-cover bg-center rounded w-full">*/}
        {/*    <div className={"flex gap-12 flex-col w-full"}>*/}
        {/*      <div className={"flex flex-col"}>*/}
        {/*        <h4 className="text-sm text-[#435a8c]">Headphone</h4>*/}
        {/*        <p className="text-3xl font-bold text-[#0e234d]">Rockez 547</p>*/}
        {/*        <p className="text-sm text-[#08a9ed]">Everywhere anytime</p>*/}
        {/*      </div>*/}
        {/*      <button className="text-white py-2 bg-[#fe9636] w-2/5 px-4 rounded text-sm">*/}
        {/*        Shop Now*/}
        {/*      </button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="hidden xl:block w-full xl:w-full mx-auto p-2 rounded border-2 border-solid border-[#fe9636] gap-2 text-center">
          <Swiper
            direction="vertical"
            spaceBetween={5}
            slidesPerView={6}
            freeMode={true}
            mousewheel={true}
            modules={[Mousewheel]}
            className="h-[400px] w-full"
          >
            {[
              "/imgs/page/homepage4/promotion1.png",
              "/imgs/page/homepage4/promotion2.png",
              "/imgs/page/homepage4/promotion3.png",
              "/imgs/page/homepage4/promotion4.png",
              "/imgs/page/homepage4/promotion5.png",
              "/imgs/page/homepage4/promotion6.png",
            ].map((item, key) => (
              <SwiperSlide key={key} className="w-full h-fit">
                <img
                  src={item}
                  alt=""
                  className="w-full h-auto max-h-[150px] object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Hero;
