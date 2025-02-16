import React from 'react';
import Link from "next/link";
import {useRouter} from "next/router";

function MiniHeader() {
    const router = useRouter()
    return (
        <div className={`${router.pathname.includes('auth') ? 'bg-white text-primary' : 'bg-headerBg text-white'}  ${router.pathname.includes('auth') ? 'border-b border-b-[#D5DFE4] py-2' : 'py-2'}`}>
            <div className={`${router.pathname.includes('auth') ? 'max-w-screen-xl mx-auto px-4' : 'max-w-screen-xl mx-auto px-6' } flex items-center justify-between `}>

                {/* Left section: Navigation Links */}
                <div className="flex gap-2 text-sm">
                    <Link href="#" className={`${router.pathname.includes('auth') ? 'text-primary text-xs' : 'text-white'} border-r px-2`} >About Us</Link>
                    <Link href="#" className={`${router.pathname.includes('auth') ? 'text-primary text-xs' : 'text-white'} border-r px-2`}>Careers</Link>
                    <Link href="#" className={`${router.pathname.includes('auth') ? 'text-primary text-xs' : 'text-white'}`}>Open a Shop</Link>
                </div>

                {/* Middle section: Promo Text */}
                <div className="text-sm flex items-center">
                    <span className={`${router.pathname.includes('auth') ? 'text-primary text-xs' : 'text-white'}`}>Free shipping for all orders over </span>
                    <span className={`ml-1 ${router.pathname.includes('auth') ? 'font-bold' : 'font-semibold'} text-secondaryTextColor`}>$75.00</span>
                </div>

                {/* Right section: Contact & Language/Currency Selector */}
                <div className="flex items-center space-x-8 text-sm">
                    <p className={`${router.pathname.includes('auth') ? 'text-primary text-xs' : 'text-white'}`}>Need help? Call Us: <span className={'text-secondaryTextColor'}> +1800 900 </span> </p>
                    <div className="flex items-center space-x-4">
                        <span className={`${router.pathname.includes('auth') ? 'text-primary text-xs' : 'text-white'}`}>English</span>
                        <span className={`${router.pathname.includes('auth') ? 'text-primary text-xs' : 'text-white'}`}>USD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MiniHeader;