import React from 'react';
import Image from "next/image";

const Header = () => {
    return (
        <div>
            <div className="bg-white">
                <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">

                    <div className="flex items-center gap-8">

                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <img src="/assets/hawola.png" alt="Logo" className="w-50 h-10"/>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Categories Dropdown and Search Bar */}
                            <div className="flex items-center space-x-4 border rounded-md">
                                <select className="p-2">
                                    <option>All categories</option>
                                    {/* Other categories */}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search for items"
                                    className="p-2 rounded-md w-64"
                                />
                            </div>

                            {/* Navigation Links */}
                            <div className="space-x-8 text-sm">
                                <a href="#" className="text-gray-700 hover:text-blue-600">Flash Deals</a>
                                <a href="#" className="text-gray-700 hover:text-blue-600">Special</a>
                                <a href="#" className="text-gray-700 hover:text-blue-600">Top Sellers</a>
                            </div>
                        </div>
                    </div>

                    {/* Icons (User, Wishlist, Cart, Settings) */}
                    <div className="flex space-x-6 items-center">
                        <div className="relative">
                            <img src="/assets/user.svg" alt="User" className="w-6 h-6"/>
                        </div>
                        <div className="relative">
                            <span
                                className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
                            <img src="/assets/heart.svg" alt="Wishlist" className="w-6 h-6"/>
                        </div>
                        <div className="relative">
                            <span
                                className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
                            <img src="/assets/shopping-cart.svg" alt="Cart" className="w-6 h-6"/>
                        </div>

                    </div>
                </div>
            </div>

            <div className="bg-white border ">
                <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">

                <div className="max-w-screen-xl flex items-center gap-8">

                    {/* Shop By Categories Dropdown */}
                    <div className="flex items-center space-x-2">
                        <button className="bg-deepOrange text-white py-2 px-4 rounded-md flex items-center space-x-2">
                            <span>Shop By Categories</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex space-x-8 text-sm">
                        <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600">Shop</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600">Vendors</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600">Pages</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600">Blog</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600">Contact Us</a>
                    </div>

                </div>

                    {/* Special Offer Badge */}
                    <div className="flex items-center space-x-2">
                        <Image src={'/assets/award.svg'} alt={'award'} width={50} height={50}/>
                        <span className="text-headerBg font-semibold ">
            SPECIAL<br/> OFFER
          </span>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Header;
