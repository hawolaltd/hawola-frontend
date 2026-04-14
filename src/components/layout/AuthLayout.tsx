import React, {ReactNode} from 'react';
import Header from "@/components/header";
import Sidebar from "@/components/auth/Sidebar";
import MainHeader from "@/components/auth/MainHeader";
import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/home/Footer";
import RecentlyViewedSection from "@/components/shared/RecentlyViewedSection";

function AuthLayout({children}: { children: ReactNode }) {
    return (<>
            <Header/>
            <div className={'flex'}>
                {/*<div className={'w-[4%]  border-r border-r-[#D5DFE4] overflow-x-hidden'}>*/}
                {/*    <Sidebar/>*/}
                {/*</div>*/}
                <div className={'w-[100%]'}>
                    {children}
                    <RecentlyViewedSection/>
                    <Footer/>
                </div>
            </div>


        </>);
}

export default AuthLayout;