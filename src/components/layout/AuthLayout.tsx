import React, {ReactNode} from 'react';
import Header from "@/components/header";
import Sidebar from "@/components/auth/Sidebar";
import MainHeader from "@/components/auth/MainHeader";
import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/home/Footer";
import RecentlyViewedSection from "@/components/shared/RecentlyViewedSection";

function AuthLayout({children}: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <div className="flex flex-1">
                {/*<div className={'w-[4%]  border-r border-r-[#D5DFE4] overflow-x-hidden'}>*/}
                {/*    <Sidebar/>*/}
                {/*</div>*/}
                <div className="w-full flex flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                    <RecentlyViewedSection/>
                    <Footer/>
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;