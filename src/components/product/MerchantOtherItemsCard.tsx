import React from 'react';
import {useRouter} from "next/router";
import {amountFormatter} from "@/util";
import {MerchantOtherProduct} from "@/types/product";

function MerchantOtherItemsCard({product}:{product: MerchantOtherProduct}) {
    console.log("MerchantOtherProduct:", product)
    console.log("MerchantOtherProduct:", product?.featured_image?.[0]?.image_url)
    const router = useRouter()
    return (
        <div onClick={() => {
            router.push(`product/${product?.slug}`)
        }} className={`relative bg-white border cursor-pointer border-solid border-[#D5DFE4] rounded-lg overflow-hidden p-4`}>
                        <span
                            className={'absolute top-3 left-3 text-[10px] flex items-center justify-center bg-deepOrange w-10 h-4 rounded-full text-white'}>-17%</span>
            <div className={'w-full flex items-center justify-center'}>
                <img src={product?.featured_image?.[0]?.image?.thumbnail} alt={product.name} style={{
                    width: "200px", height: "150px"
                }}/>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="text-[10px] text-textPadded font-semibold">{product.merchant?.store_name}</h3>
                <h3 className="text-xs font-semibold text-primary">{product.name}</h3>
                <div className={'flex items-center gap-1'}>
                    {Array.from((product?.rating ?? 0)).map((star, key) => (<svg className={'w-4 h-4'} key={key} viewBox="0 0 24 24"
                                                                                 xmlns="http://www.w3.org/2000/svg">
                        <path d="m0 0h24v24h-24z" fill="#fff" opacity="0"
                              transform="matrix(0 1 -1 0 24 0)"/>
                        <path
                            d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                            fill="#FFB067"/>
                    </svg>))}<span className={'text-[10px] text-textPadded font-normal'}>{(product?.numReviews)}</span>
                </div>
                <p className="text-lg font-bold text-primary">${amountFormatter(product.discount_price)} <span
                    className={'line-through text-xs text-textPadded'}> ${amountFormatter(product?.price)}</span></p>
                <button
                    className="border border-textPadded text-primary font-bold  py-2 px-4 mt-4 rounded w-full">Add
                    to Cart
                </button>
            </div>
            <ul className={"p-4 max-w-screen-xl text-primary"}>
                <li className={'text-[10px] list-disc'}>
                    27-inch (diagonal) Retina 5K display
                </li>
                <li className={'text-[10px] list-disc Edit Configurations...'}>
                    3.1GHz 6-core 10th-generationc Intel Core i5
                </li>
                <li className={'text-[10px] list-disc'}>
                    AMD Radeon Pro 5300 graphics
                </li>
            </ul>
        </div>
    );
}

export default MerchantOtherItemsCard;