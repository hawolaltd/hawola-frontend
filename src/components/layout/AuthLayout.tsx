import React, {ReactNode} from 'react';
import Header from "@/components/header";
import Sidebar from "@/components/auth/Sidebar";
import MainHeader from "@/components/auth/MainHeader";
import LoginForm from "@/components/auth/LoginForm";
import SubscribeSection from "@/components/home/SubscribeSection";
import Footer from "@/components/home/Footer";

function AuthLayout({children}: { children: ReactNode }) {
    return (<>
            <Header/>
            <div className={'flex'}>
                <div className={'w-[4%] h-screen border-r border-r-[#D5DFE4] overflow-x-hidden'}>
                    <Sidebar/>
                </div>
                <div className={'w-[100%]'}>
                    <MainHeader/>
                    <LoginForm/>
                    <SubscribeSection/>
                    <Footer/>
                </div>
            </div>


        </>);
}

export default AuthLayout;