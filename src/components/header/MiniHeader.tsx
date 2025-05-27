import React from 'react';
import Link from "next/link";
import {useRouter} from "next/router";
import {formatCurrency} from "@/util";

function MiniHeader() {
    const router = useRouter()
    return (
        <div className={`${router.pathname !== ('/') ? 'bg-white text-primary' : 'bg-headerBg text-white'}  ${router.pathname !== ('/') ? 'border-b border-b-[#D5DFE4] py-2' : 'py-2'} hidden xl:block`}>
            <div className={`${router.pathname !== ('/') ? 'max-w-[1320px] mx-auto px-4' : 'max-w-screen-xl mx-auto px-6' } flex items-center justify-center lg:justify-between `}>

                {/* Left section: Navigation Links */}
                <div className="lg:flex gap-2 text-sm hidden">
                    <Link href="#" className={`${router.pathname !== ('/') ? 'text-primary text-xs' : 'text-white text-xs font-medium'} border-r px-2`} >About Us</Link>
                    <Link href="#" className={`${router.pathname !== ('/') ? 'text-primary text-xs' : 'text-white text-xs font-medium'} border-r px-2`}>Careers</Link>
                    <Link href="#" className={`${router.pathname !== ('/') ? 'text-primary text-xs' : 'text-white text-xs font-medium'}`}>Open a Shop</Link>
                </div>

                {/* Middle section: Promo Text */}
                <div className="text-xs font-medium hidden lg:flex items-center">
                    <span className={`${router.pathname !== ('/') ? 'text-primary text-xs' : 'text-white text-xs font-medium'}`}>Free shipping for all orders over </span>
                    <span className={`ml-1 ${router.pathname !== ('/') ? 'font-bold' : 'font-bold'} text-secondaryTextColor text-sm`}>{formatCurrency(75.00)}</span>
                </div>

                {/* Right section: Contact & Language/Currency Selector */}
                <div className="flex items-center  space-x-8 text-xs font-medium">
                    <p className={`${router.pathname !== ('/') ? 'text-primary text-xs' : 'text-white'}`}>Need help? Call Us: <span className={'text-secondaryTextColor'}> +1800 900 </span> </p>
                    <div className="flex items-center space-x-4">
                        <span className={`flex items-center ${router.pathname !== ('/') ? 'text-primary text-xs' : 'text-white text-xs'}`}>English
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M0 0h24v24H0V0z" fill="none"/>
                                <path
                                    d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z" fill={router.pathname !== ('/') ? '#8C9EC5' : "#fff"}/>
                            </svg></span>
                        <span className={`flex items-center ${router.pathname !== ('/') ? 'text-primary text-xs' : 'text-white text-xs'}`}>USD
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M0 0h24v24H0V0z" fill="none"/>
                                <path
                                    d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z" fill={router.pathname !== ('/') ? '#8C9EC5' : "#fff"}/>
                            </svg> </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MiniHeader;