import React from 'react';
import MiniHeader from "@/components/header/MiniHeader";
import MainHeader from "@/components/header/MainHeader";
import {useRouter} from "next/router";

const Header = () => {
    const router = useRouter()
    console.log(router)
    return (<div>
            {router.pathname !== ('/') ? <MiniHeader/> : <>
                <MiniHeader/>
                <MainHeader/>
            </>}

        </div>);
}

export default Header;
