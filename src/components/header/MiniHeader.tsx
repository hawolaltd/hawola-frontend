import React from 'react';
import Link from "next/link";

function MiniHeader() {
    return (
        <div className="bg-headerBg text-white py-2">
            <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between">

                {/* Left section: Navigation Links */}
                <div className="flex gap-2 text-sm">
                    <Link href="#" className={'border-r px-2'} >About Us</Link>
                    <Link href="#" className={'border-r px-2'}>Careers</Link>
                    <Link href="#" >Open a Shop</Link>
                </div>

                {/* Middle section: Promo Text */}
                <div className="text-sm flex items-center">
                    <span className={'text-white'}>Free shipping for all orders over </span>
                    <span className="ml-1 font-semibold text-secondaryTextColor">$75.00</span>
                </div>

                {/* Right section: Contact & Language/Currency Selector */}
                <div className="flex items-center space-x-8 text-sm">
                    <p className="text-white">Need help? Call Us: <span className={'text-secondaryTextColor'}> +1800 900 </span> </p>
                    <div className="flex items-center space-x-4">
                        <span className="text-white">English</span>
                        <span className="text-white">USD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MiniHeader;