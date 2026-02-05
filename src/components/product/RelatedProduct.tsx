import React from 'react';
import BannerAds1 from "@/components/svg/banner-ads1";
import ProductCard from "@/components/product/ProductCard";
import ProductCard2 from "@/components/product/ProductCard2";
import RecentlyViewedItems from "@/components/product/RecentlyViewedItems";
import FeaturesSection from "@/components/home/FeaturesSection";
import {ProductByIdResponse} from "@/types/product";
import MerchantOtherItemsCard from "@/components/product/MerchantOtherItemsCard";
import {useAppSelector} from "@/hook/useReduxTypes";

interface ProductCardProps {
    product: ProductByIdResponse;
}


const RelatedProduct = ({product}: ProductCardProps) => {
    const {products} = useAppSelector(state => state.products)

    return (
      <section className="w-full flex flex-col gap-4 py-8">
        {/* Related Products */}
        <div className="w-full flex flex-col gap-4">
            <div className={'border-b border-b-detailsBorder pb-6'}>
                <div className="mx-auto text-left mb-8 w-fullsw">
                    <div className={'flex items-center justify-between gap-8 pt-4'}>
                        <h2 className="text-2xl font-semibold text-primary">Related Products</h2>

                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {product?.merchant_other_products?.map((product, key) => (<MerchantOtherItemsCard  key={key} product={product}/>))}
                </div>
            </div>

            {/* <div>
                <div className="mx-auto text-left mb-8 w-fullsw">
                    <div className={'flex items-center justify-between gap-8 pt-4'}>
                        <h2 className="text-2xl font-semibold text-primary">You may also like</h2>


                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {product?.merchant_other_products?.map((product, key) => (<MerchantOtherItemsCard key={key} product={product}/>))}
                </div>
            </div> */}

            {/* <RecentlyViewedItems/> */}



            {/* <div>
                <div className="mx-auto text-left mb-8 w-fullsw">
                    <div className={'flex items-center justify-between gap-8 pt-4'}>
                        <h2 className="text-2xl font-semibold text-primary">Similar products to compare</h2>


                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {products?.results?.slice(0, 5)?.map((product, key) => (<ProductCard key={key} product={product}/>))}
                </div>
            </div> */}


            {/* ADVERT BANNER ON PRODUCT DETAILS PAGE */}

            {/* <div className={'flex items-center justify-center mt-8 mb-8'}>
                <img src={'/assets/banner-ads.png'} alt={'ads'}/>
            </div> */}

            {/* FEATURES SECTION ON PRODUCT DETAILS PAGE */}
            {/* <FeaturesSection/> */}
        </div>
    </section>);
}

export default RelatedProduct;
