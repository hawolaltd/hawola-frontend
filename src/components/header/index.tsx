import React, {useEffect, useState} from 'react';
import MiniHeader from "@/components/header/MiniHeader";
import MainHeader from "@/components/header/MainHeader";
import {useRouter} from "next/router";

const Header = () => {
    const router = useRouter()
    console.log(router)

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (<div>
        {router.pathname !== ('/') ? <MiniHeader/> : <>
            <div
                className={`transition-all duration-300 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                <MiniHeader/>
            </div>
            <div className={`bg-white ${isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-md' : 'relative'}`}>
                <MainHeader isScrolled={isScrolled}/>
            </div>
        </>}

    </div>);
}

export default Header;
