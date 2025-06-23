import React, {useCallback, useEffect} from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import ProductSlider from "@/components/categories/ProductSlider";
import Ads2 from "@/components/svg/ads2";
import FilterBar from "@/components/categories/FilterBar";
import ProductCard from "@/components/product/ProductCard";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import FeaturesSection from "@/components/home/FeaturesSection";
import {getAllCategories, getAllProductBaseOnCategories, getProducts} from "@/redux/product/productSlice";
import {useRouter} from "next/router";

function Categories() {
    const {products, carts} = useAppSelector(state => state.products)

    const router = useRouter()

    const type = router.query.type as string
    const slug = router.query.slug as string

    const dispatch = useAppDispatch()

    const init = useCallback(async () => {
        try {
            if (type === "all") {
                dispatch(getProducts())
            }else {
                dispatch(getAllProductBaseOnCategories(slug))
            }
        }catch (e) {

        }
    }, [dispatch, slug, type])

    useEffect(() => {
        init()
    }, [init]);

    return (
        <AuthLayout>
            <div className={`h-fit pb-28`}>
                <div className="container mx-auto max-w-screen-xl flex justify-center py-8">
                    <Ads2/>
                </div>

                <ProductSlider products={products}/>

                <div className="container mx-auto max-w-screen-xl flex justify-center py-8">
                    <Ads2/>
                </div>

                <div className="container mx-auto w-full max-w-screen-full flex  py-8">
                <FilterBar/>
                </div>

                <div className={`container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-2 gap-y-4 w-full`}>
                    {products?.results?.map((product) => (
                        <ProductCard key={product?.id} product={product} margin={'mx-2'}/>
                    ))}
                </div>

                <div className={'mt-28'}>
                    <FeaturesSection/>
                </div>
            </div>
        </AuthLayout>
    );
}

export default Categories;