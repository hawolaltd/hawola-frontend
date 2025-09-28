import { useAppSelector } from "@/hook/useReduxTypes";
import React from "react";
import Slider from "react-slick";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Mousewheel,
} from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";

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
    <section className="grid grid-cols-1 xl:grid-cols-6 gap-4 py-4 px-8 xl:px-0 md:max-w-screen-lg xl:max-w-screen-xl mx-auto">
      <div className={"xl:col-span-3  rounded-xl"}>
        <Slider
          {...settings}
          className={"relative hoome-sllider-dots rounded-xl w-full h-full  "}
        >
          <div className="w-full py-14 bg-[#b8f2ff]  rounded-xl bg-custom-bg bg-cover bg-center px-10">
            <h1
              className="text-5xl font-bold text-gray-800 mb-6 text-left tracking-wide leading-snug"
              style={{
                textShadow: "-2px -2px 0px #FFF500, 2px 2px 0px #FF6BC4",
                textTransform: "uppercase",
              }}
            >
              360 Degree <br /> Virtual Reality
            </h1>
            <ul className="text-lg text-gray-600 mb-8">
              <li>Free Shipping. Secure Payment</li>
              <li>Contact us 24hrs a day</li>
              <li>Support gift service</li>
            </ul>
            <div className={"flex items-center gap-1"}>
              <button className="bg-headerBg text-white py-3 px-6 rounded-lg text-sm">
                Shop Now
              </button>
              <button className="text-headerBg py-3 px-6 underline text-sm">
                Learn more
              </button>
            </div>
          </div>

          <div className="w-full py-14 bg-[#b8f2ff]  rounded-xl bg-custom-bg5 bg-cover bg-center p-6">
            <h1
              className="text-5xl font-bold text-gray-800 mb-6 text-left tracking-wide leading-snug"
              style={{
                textShadow: "-2px -2px 0px #FFF500, 2px 2px 0px #FF6BC4",
                textTransform: "uppercase",
              }}
            >
              Enjoy
              <br /> The SIgHT
            </h1>
            <ul className="text-lg text-gray-600 mb-8">
              <li>Free Shipping. Secure Payment</li>
              <li>Contact us 24hrs a day</li>
              <li>Support gift service</li>
            </ul>
            <div className={"flex items-center gap-1"}>
              <button className="bg-headerBg text-white py-3 px-6 rounded-lg text-sm">
                Shop Now
              </button>
              <button className="text-headerBg py-3 px-6 underline text-sm">
                Learn more
              </button>
            </div>
          </div>

          <div className="w-full py-14 bg-[#b8f2ff]  rounded-xl bg-custom-bg6 bg-cover bg-center p-6">
            <h1
              className="text-5xl font-bold text-gray-800 mb-6 text-left tracking-wide leading-snug"
              style={{
                textShadow: "-2px -2px 0px #FFF500, 2px 2px 0px #FF6BC4",
                textTransform: "uppercase",
              }}
            >
              Enjoy
              <br /> The Music
            </h1>
            <ul className="text-lg text-gray-600 mb-8">
              <li>Free Shipping. Secure Payment</li>
              <li>Contact us 24hrs a day</li>
              <li>Support gift service</li>
            </ul>
            <div className={"flex items-center gap-1"}>
              <button className="bg-headerBg text-white py-3 px-6 rounded-lg text-sm">
                Shop Now
              </button>
              <button className="text-headerBg py-3 px-6 underline text-sm">
                Learn more
              </button>
            </div>
          </div>
        </Slider>
      </div>

      <div
        className={
          "max-w-screen-xl xl:col-span-3 flex flex-col lg:flex-row gap-6 xl:gap-4 w-full"
        }
      >
        <div className={"flex flex-col gap-6 items-center w-full"}>
          <div className="w-full flex flex-row justify-between bg-[#fff4ea] bg-custom-bg2 bg-cover bg-center rounded">
            <div className={"py-4 pl-4"}>
              <h4 className="text-4xl font-bold text-[#0e234d]">Metaverse</h4>
              <p className="text-lg text-[#0e234d] mb-6">
                The future of creativity
              </p>
              <button className="text-[#fe9636] py-2 rounded text-sm">
                Learn more
              </button>
            </div>
          </div>
          <div className="relative p-6 flex flex-row bg-[#fff1f6] h-full bg-custom-bg3 bg-cover bg-center rounded w-full">
            <div className={"flex gap-12 flex-col w-full"}>
              <div className={"flex flex-col"}>
                <h4 className="text-sm text-[#435a8c]">Headphone</h4>
                <p className="text-3xl font-bold text-[#0e234d]">Rockez 547</p>
                <p className="text-sm text-[#08a9ed]">Everywhere anytime</p>
              </div>
              <button className="text-white py-2 bg-[#fe9636] w-2/5 px-4 rounded text-sm">
                Shop Now
              </button>
            </div>
          </div>
        </div>

        <div className="hidden xl:block w-full xl:w-fit mx-auto p-2 rounded border-2 border-solid border-[#fe9636] gap-2 text-center">
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
