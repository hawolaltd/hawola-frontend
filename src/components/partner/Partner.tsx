import React from 'react';
import Slider from "react-slick";


const settings = {
    dots: false,
    infinite: true,
    speed: 2000,
    slidesToShow: 7,
    slidesToScroll: 7,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
    className: "center",
    centerMode: true,
    centerPadding: "20px",
    arrows: false,
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


function Partner({}) {
    return (
        <div className={'w-full p-6 flex justify-center '}>
            <Slider {...settings} className={'w-full md:max-w-screen-md xl:max-w-screen-xl '}>
                {partners.map(partner=> (
                    <img className={'partner-img'} key={partner.id} src={partner.path} alt={partner.name}   />
                ))}
            </Slider>



        </div>
    );
}
const partners = [
    {
        id: 1,
        name: "vaio",
        path: "/assets/vaio.png"
    },
    {
        id: 2,
        name: "sharp",
        path: "/assets/sharp1.png"
    },
    {
        id: 3,
        name: "microsoft",
        path: "/assets/microsoft.png"
    },
    {
        id: 4,
        name: "sony",
        path: "/assets/sony.png"
    },
    {
        id: 5,
        name: "acer",
        path: "/assets/acer.png"
    },
    {
        id: 6,
        name: "nokia",
        path: "/assets/nokia.png"
    },
    {
        id: 7,
        name: "asus",
        path: "/assets/assus.png"
    },
    {
        id: 8,
        name: "casio",
        path: "/assets/casio.png"
    },

     {
        id: 9,
        name: "dell",
        path: "/assets/dell.png"
    },

     {
        id: 10,
        name: "panasonic",
        path: "/assets/panasonic.png"
    },


]
export default Partner;