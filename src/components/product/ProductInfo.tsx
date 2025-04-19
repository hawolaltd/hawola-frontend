import React, {useState} from 'react';
import Specification from "@/components/product/Specification";
import Description from "@/components/product/Description";
import AdditionalInformation from "@/components/product/AdditionalInformation";
import CustomerReviews from "@/components/product/CustomerReviews";
import {Product, ProductByIdResponse} from "@/types/product";
import MerchantAbout from "@/components/product/MerchantAbout";

function ProductInfo({product}:{product: ProductByIdResponse}) {
    const [tab, setTab] = useState('description')
    const [showMore, setShowMore] = useState(false)
    return (
        <div className="max-w-[1320px]  mt-8 border-b border-b-[#dde4f0] pb-10">
            <div className="flex gap-6 flex-col md:flex-row md:items-center">
                {productInfoHeaders.map((header, key) => (
                    <span onClick={()=>{
                        setTab(header.value)
                    }} key={key}
                          className={`font-bold text-sm lg:text-xl cursor-pointer hover:text-primary ${tab === header.value ? 'text-primary' : 'text-textPadded'}`}>{header?.title}</span>
                ))}
            </div>

            {tab === "description" && (
                <Description product={product} showMore={showMore} setShowMore={setShowMore}/>
            )}


            {tab === "specification" && (
                <Specification
                    specs={[
                        { label: 'Mode', value: '#SK10923' },
                        { label: 'Brand', value: 'Samsung' },
                        { label: 'Size', value: '6.7"' },
                        { label: 'Finish', value: 'Pacific Blue' },
                        { label: 'Origin of Country', value: 'United States' },
                        { label: 'Manufacturer', value: 'USA' },
                        { label: 'Released Year', value: '2022' },
                        { label: 'Warranty', value: 'International' },
                    ]}
                />
            )}


            {tab === "additionalInfo" && (
                <AdditionalInformation
                    specs={[
                        { label: 'Weight', value: '0.240 kg' },
                        { label: 'Dimensions', value: '0.74 x 7.64 x 16.08 cm' },
                    ]}
                />
            )}


            {tab === "reviews" && (
                <CustomerReviews />
            )}

            {tab === "merchant" && (
                <MerchantAbout product={product} />
            )}


        </div>
    );
}

const productInfoHeaders = [
    {
        title: "Description",
        value: "description"
    },

    // {
    //     title: "Specification",
    //     value: "specification",
    // },

    // {
    //     title: "Additional information",
    //     value: "additionalInfo"
    // },

    {
        title: "Reviews (2)",
        value: "reviews",
    },

    {
        title: "Merchant",
        value: "merchant",
    },

]

export default ProductInfo;