import React, {useEffect, useState} from 'react';
import MiniHeader from "@/components/header/MiniHeader";
import MainHeader from "@/components/header/MainHeader";
import Drawer from "@/components/header/MobileMenuDrawer";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { setDrawerOpen } from "@/redux/ui/uiSlice";
import {useRouter} from "next/router";

const Header = () => {
    const router = useRouter()
    const dispatch = useAppDispatch();
    const isDrawerOpen = useAppSelector((state) => state.ui.isDrawerOpen);
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
        <Drawer
            isOpen={isDrawerOpen}
            onClose={() => dispatch(setDrawerOpen(false))}
            messageCount={3}
        />
        <MiniHeader/>
        <MainHeader isScrolled={isScrolled}/>
    </div>);
}

export default Header;
