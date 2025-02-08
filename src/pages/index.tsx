import Hero from "@/components/Hero";
import ProductList from "@/components/ProductList";
import Footer from "@/components/home/Footer";
import Header from "@/components/header";
import React from "react";
import Category from "@/components/category/Category";
import TrendingProducts from "@/components/TrendingProducts";
import Partner from "@/components/partner/Partner";
import TopRateProducts from "@/components/home/TopRateProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";

export default function Home() {
    return (<div>
            <div className={'mb-4'}>
                <Header/>
            </div>
            <Hero/>
            <Partner/>
            <Category/>
            <ProductList/>
            <TrendingProducts/>
            <TopRateProducts/>
            <TopSellingProducts/>
            <Footer/>
        </div>);
}
