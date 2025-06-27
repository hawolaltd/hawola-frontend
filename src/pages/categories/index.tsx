import React, {useCallback, useEffect} from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import ProductSlider from "@/components/categories/ProductSlider";
import Ads2 from "@/components/svg/ads2";
import FilterBar from "@/components/categories/FilterBar";
import ProductCard from "@/components/product/ProductCard";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import FeaturesSection from "@/components/home/FeaturesSection";
import {
    getAllCategories,
    getAllProductBaseOnCategories,
    getAllProductBaseOnSubCategories,
    getProducts
} from "@/redux/product/productSlice";
import {useRouter} from "next/router";

function Categories() {
    const {products, carts, productBaseOnCategories, productBaseOnSubCategories} = useAppSelector(state => state.products)

    console.log("productBaseOnCategories", productBaseOnCategories)

    const router = useRouter()

    const type = router.query.type as string
    const slug = router.query.slug as string

    const dispatch = useAppDispatch()

    const init = useCallback(async () => {
        try {
            if (type === "cat") {
                dispatch(getAllProductBaseOnCategories(slug))

            }else if (type === "subcat") {
                dispatch(getAllProductBaseOnSubCategories(slug))

            }else {
                dispatch(getProducts())
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
                   {/*<img src={type === 'cat' ? productBaseOnCategories?.category_banner? : type === 'subcat' ? productBaseOnSubCategories : products?.results} />*/}
                </div>

                <ProductSlider products={type === 'cat' ? productBaseOnCategories.products : type === 'subcat' ? productBaseOnSubCategories?.products : products?.results}/>

                <div className="container mx-auto max-w-screen-xl flex justify-center py-8">
                    <Ads2/>
                </div>

                <div className="container mx-auto w-full max-w-screen-full flex  py-8">
                <FilterBar/>
                </div>

                <div className={`container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-2 gap-y-4 w-full`}>
                    {(type === 'cat' ? productBaseOnCategories?.products : type === 'subcat' ? productBaseOnSubCategories?.products : products?.results)?.map((product: any) => (
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