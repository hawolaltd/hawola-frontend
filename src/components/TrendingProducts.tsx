import React from 'react';
import BannerAds1 from "@/components/svg/banner-ads1";
import ProductCard from "@/components/product/ProductCard";
import ProductCard2 from "@/components/product/ProductCard2";
import {ProductResponse} from "@/types/product";


interface TrendingProductsProps {
    products: ProductResponse
}

const TrendingProducts = ({products}: TrendingProductsProps) => {


    return (<section className="max-w-screen-2xl px-6 xl:px-0  flex gap-4 bg-[#f1f3f9] justify-center py-4">
        <div className={'max-w-screen-xl w-full flex flex-col xl:flex-row gap-4'}>
            <div>
                <div className="mx-auto text-left mb-8 w-fullsw">
                    <div className={'flex items-center justify-between border-b border-b-[#CAD6EC] gap-8 p-4'}>
                        <h2 className="text-xl font-semibold text-primary">Trending Products</h2>

                        <div className={'hidden lg:flex items-center gap-2'}>
                            <div
                                className={'p-1 border border-textPadded rounded flex items-center justify-center'}>
                                <svg className="w-2 h-2 text-textPadded" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"/>
                                </svg>

                            </div>

                            <div
                                className={'p-1 border border-textPadded rounded flex items-center justify-center'}>

                                <svg className="w-2 h-2 text-textPadded" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {products?.results?.slice(0,8)?.map((product, key) => (<ProductCard key={key} product={product}/>))}
                </div>

               <div className={'flex justify-center items-center w-full py-8'}>
                   <BannerAds1/>
               </div>
            </div>

            <div className={'flex flex-col gap-6'}>
                <div className="bg-white rounded gap-2">
                    <div
                        className={'bg-[#fe9636] rounded-tl rounded-tr py-4 px-4 h-[62px] flex justify-between items-center'}>
                        <h4 className={'font-semibold text-xl text-white '}>Best Seller</h4>
                    </div>
                    <div className="bg-white rounded gap-2 ">
                        {products?.results?.slice(0,6)?.map((item, key) => {

                            return (
                               <ProductCard2 product={products?.results} key={key} item={item}/>
                            )
                        })}
                    </div>
                </div>
                <div
                    className={'bg-[url(/assets/manonwatch.png)] bg-cover bg-center bg-no-repeat flex items-center flex-col gap-2 pt-10 h-[300px]'}>
                    <span
                        className={'text-[10px] flex items-center justify-center bg-[#0BA9ED] w-10 h-4 rounded-full text-white'}>No.9</span>
                    <h4 className={'text-primary text-sm font-bold text-center'}>Sensitive Touch <br/> without
                        fingerprint</h4>
                    <p className={'text-primary text-[10px]'}>Smooth handle and accurate click</p>

                </div>
            </div>
        </div>
    </section>);
}

export default TrendingProducts;
