import SubscribeSection from "@/components/home/SubscribeSection";
import React from "react";
import {useRouter} from "next/router";

const Footer = () => {
    const router = useRouter()
    return (
        <>
            {router.pathname === '/' && <SubscribeSection/>}
            <footer className="bg-gray-100 py-10 text-gray-600 text-sm">
                <div className="container mx-auto px-4 grid md:grid-cols-5 gap-4">
                    <div className={'flex flex-col gap-4'}>
                        <h4 className="font-bold text-primary">Contact</h4>
                        <p className={'text-primary font-bold'}>Address: <span
                            className={'text-primary font-normal text-[10px]'}>
                            502 New Design Str, Melbourne,
                            San Francisco, CA 94110, United States
                        </span></p>
                        <p className={'text-primary font-bold'}>Phone: <span
                            className={'text-primary font-normal text-[10px]'}>(+01) 123-456-789</span></p>
                        <p className={'text-primary font-bold'}>E-mail: <span
                            className={'text-primary font-normal text-[10px]'}>contact@ecom-market.com</span></p>
                        <p className={'text-primary font-bold'}>Hours: <span
                            className={'text-primary font-normal text-[10px]'}>8:00 - 17:00, Mon - Sat</span></p>

                        <div className={'flex items-center gap-2 mb-2 mt-2'}>
                            <img src={'/assets/facebook.png'} alt={'app store'} width={20} height={20}/>
                            <img src={'/assets/instagram.png'} alt={'google Play'} width={20} height={20}/>
                            <img src={'/assets/twitter.png'} alt={'google Play'} width={20} height={20}/>
                            <img src={'/assets/linkdin.png'} alt={'google Play'} width={20} height={20}/>

                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary">Make Money with Us</h4>
                        <ul className="text-xs text-[#6b83b6] space-y-1 mb-4 pl-2 pt-4">
                            {["Mission & Vision", "Our Team", "Careers", "Press & Media", "Advertising", "Testimonials"].map((item, index) => (
                                <li className={'relative text-[10px] before:absolute before:-left-2 before:top-1  before:w-2 before:h-2 before:bg-[url(/assets/arrowright.png)] before:bg-contain before:bg-no-repeat'}
                                    key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary">Company</h4>
                        <ul className="text-xs text-[#6b83b6] space-y-1 mb-4 pl-2 pt-4">
                            {["Our Blog", "Our Team", "Plans & Pricing", "Knowledge Base", "Cookie Policy", "Office Center", "News & Events"].map((item, index) => (
                                <li className={'relative text-[10px] before:absolute before:-left-2 before:top-1  before:w-2 before:h-2 before:bg-[url(/assets/arrowright.png)] before:bg-contain before:bg-no-repeat'}
                                    key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary">My account</h4>
                        <ul className="text-xs text-[#6b83b6] space-y-1 mb-4 pl-2 pt-4">
                            {["FAQs", "Editor Help", "Community", "Live Chatting", "Contact Us", "Support Center"].map((item, index) => (
                                <li className={'relative text-[10px] before:absolute before:-left-2 before:top-1  before:w-2 before:h-2 before:bg-[url(/assets/arrowright.png)] before:bg-contain before:bg-no-repeat'}
                                    key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary">App & Payment</h4>
                        <p className={'text-primary text-[10px]'}>Download our Apps and get extra 15% <br/>
                            Discount on your first Order…!</p>
                        <div className={'flex items-center gap-2 mb-2 mt-2'}>
                            <img src={'/assets/appstore.png'} alt={'app store'} width={100} height={100}/>
                            <img src={'/assets/googlePlay.png'} alt={'google Play'} width={100} height={100}/>

                        </div>
                        <p className={'text-primary text-[10px]'}>Secured Payment Gateways</p>
                        <div className={'flex items-center gap-2 mb-2 mt-2'}>
                            <img src={'/assets/paymentMethod.png'} alt={'payment Method'} width={150} height={150}/>
                        </div>
                    </div>
                </div>


            </footer>

            <div className="bg-white text-gray-700 text-sm border-t border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex gap-6 items-center">
                        {/* Logo and Links */}
                        <div className="flex items-center space-x-2">
                            <img src="/assets/hawola.png" alt="Ecom" className="h-6"/>
                        </div>
                        <div className="flex space-x-4 mt-2 text-[#0E224D] text-[10px]">
                            <a href="#" className="text-[#0E224D] text-[10px]">EcomMarket.com</a>
                            <a href="#" className="text-[#0E224D] text-[10px]">Ecom Partners</a>
                            <a href="#" className="text-[#0E224D] text-[10px]">Ecom Business</a>
                            <a href="#" className="text-[#0E224D] text-[10px]">Ecom Factory</a>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="mt-6 flex items-center gap-4">
                        <p className="font-bold text-[#0E224D]">Electronic:</p>
                        <p className="text-primary text-[10px] flex flex-wrap">
                            Cell Phones | Headphones | Television & Video | Game Controller | Apple Watch | HTC | Ipad |
                            Keyboard | Samsung | Wireless Speaker | Samsung Galaxy | <br/> Gaming Mouse | EBook Readers |
                            Service Plans | Home Audio | Office Electronics | Lenovo | Macbook Pro M1 | HD Videos Player
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                        <p className="font-bold text-[#0E224D]">Furniture:</p>
                        <p className="text-primary text-[10px] flex flex-wrap ">
                            Sofa | Chair | Dining Table | Living Room | Table Lamp | Night Stand | Computer Desk | Bar
                            Table | Pillow | Radio | Clock | Bad Room | Stool | Television | <br/> Wardrobe | Living Room
                            Tables | Dressers | Patio Sofas | Nursery | Kitchen | Accent Furniture | Replacement Parts
                        </p>
                    </div>

                    {/* Copyright and Legal Links */}
                    <div className="mt-6 border-t border-[#CAD6EC] pt-4 flex items-center justify-between">
                        <p className="text-primary text-[10px]">Copyright © 2022 Ecom Market. All rights reserved.</p>
                        <div className="flex space-x-4 mt-2 text-primary text-[10px]">
                            <a href="#">Conditions of Use</a>
                            <a href="#">Privacy Notice</a>
                            <a href="#">Interest-Based Ads</a>
                        </div>
                    </div>
                </div>
                {/* Scroll to Top Button */}
                <button
                    className="fixed bottom-6 right-6 bg-primary px-3 py-2 rounded-full shadow-md  transition-all">
                  <svg  width="20" height="25"  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="m0 0h24v24h-24z" fill="#fff" opacity="0" transform="matrix(-1 0 0 -1 24 24)"/>
                        <path
                            d="m5.23 10.64a1 1 0 0 0 1.41.13l4.36-3.63v11.86a1 1 0 0 0 2 0v-11.86l4.36 3.63a1 1 0 1 0 1.28-1.54l-6-5-.15-.09-.13-.07a1 1 0 0 0 -.72 0l-.13.07-.15.09-6 5a1 1 0 0 0 -.13 1.41z"
                            fill="#fff"/>
                    </svg>

                </button>
            </div>
        </>

    );
};

export default Footer;
