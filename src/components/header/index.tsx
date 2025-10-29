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
        <MiniHeader/>
        <MainHeader isScrolled={isScrolled}/>
    </div>);
}

export default Header;
