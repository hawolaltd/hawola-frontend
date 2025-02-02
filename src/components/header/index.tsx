import React from 'react';
import MiniHeader from "@/components/header/MiniHeader";
import MainHeader from "@/components/header/MainHeader";
import Link from "next/link";

const Header = () => {
    return (
    <div>
        <MiniHeader/>
        <MainHeader/>
    </div>
    );
}

export default Header;
