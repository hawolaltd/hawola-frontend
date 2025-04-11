import Hero from "@/components/Hero";
import ProductList from "@/components/ProductList";
import Footer from "@/components/home/Footer";
import Header from "@/components/header";
import React, {useEffect} from "react";
import Category from "@/components/category/Category";
import TrendingProducts from "@/components/TrendingProducts";
import Partner from "@/components/partner/Partner";
import TopRateProducts from "@/components/home/TopRateProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getCarts, getProducts} from "@/redux/product/productSlice";

export default function Home() {
    const {products, carts} = useAppSelector(state => state.products)
    const { isAuthenticated } = useAppSelector(state => state.auth)

    console.log("products:", products)
    console.log("carts:", carts)
    console.log("isAuthenticated:", isAuthenticated)

    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(getProducts())
        if (isAuthenticated){
            dispatch(getCarts())
        }
    }, [dispatch, isAuthenticated]);

    return (<div>
            <div className={'mb-4'}>
                <Header/>
            </div>
            <Hero/>
            <Partner/>
            <Category/>
            <ProductList products={products}/>
            <TrendingProducts products={products}/>
            <TopRateProducts products={products}/>
            <TopSellingProducts products={products}/>
            <Footer/>
        </div>);
}
