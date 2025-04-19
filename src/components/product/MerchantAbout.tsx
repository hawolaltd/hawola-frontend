import React from 'react';
import {ProductByIdResponse} from "@/types/product";

interface MerchantAboutProps {
    product: ProductByIdResponse
}

function MerchantAbout({product}: MerchantAboutProps) {

    const formatDescription = (text: string) => {
        // First try splitting by sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

        // Group into paragraphs of 2-3 sentences
        const paragraphs = [];
        for (let i = 0; i < sentences.length; i += 3) {
            const paragraph = sentences.slice(i, i + 3).join(' ');
            paragraphs.push(paragraph);
        }

        return paragraphs;
    };

    const descriptionParagraphs = formatDescription(product?.product?.merchant?.about);

    return (
        <div className="bg-white">
            {/* Header Section */}
            <div className="my-6 flex items-center">
                <h1 className={`flex items-center gap-2 text-xl font-bold text-${product?.product?.merchant?.primary_color}`}><img src={product?.product?.merchant?.logo} className={'w-12 h-12 rounded-full'}/>{product?.product?.user}</h1>
                <div className="flex items-center mt-2">
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-gray-600 text-sm">({product?.product?.numReviews} reviews)</span>
                </div>
            </div>

            {/* Contact Section */}
            <div className="mb-12">
                <div className="grid grid-cols-1 gap-2">
                    <div className={'flex items-center gap-2'}>
                        <svg className={'w-4 h-4'} width="8" height="8" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0)">
                                <path
                                    d="M8.00001 16.7564L7.53334 16.3564C6.89001 15.8178 1.27267 10.9664 1.27267 7.41776C1.27267 5.63356 1.98145 3.92244 3.24306 2.66082C4.50468 1.3992 6.21581 0.69043 8.00001 0.69043C9.78421 0.69043 11.4953 1.3992 12.757 2.66082C14.0186 3.92244 14.7273 5.63356 14.7273 7.41776C14.7273 10.9664 9.11001 15.8178 8.46934 16.3591L8.00001 16.7564ZM8.00001 2.1451C6.6021 2.14668 5.2619 2.70271 4.27342 3.69118C3.28495 4.67965 2.72893 6.01985 2.72734 7.41776C2.72734 9.6471 6.18334 13.2084 8.00001 14.8384C9.81667 13.2078 13.2727 9.64443 13.2727 7.41776C13.2711 6.01985 12.7151 4.67965 11.7266 3.69118C10.7381 2.70271 9.39792 2.14668 8.00001 2.1451Z"
                                    fill="#425A8B"/>
                                <path
                                    d="M8.00001 10.0843C7.47259 10.0843 6.95702 9.92791 6.51849 9.6349C6.07996 9.34188 5.73817 8.9254 5.53633 8.43813C5.3345 7.95086 5.28169 7.41469 5.38458 6.8974C5.48748 6.38012 5.74145 5.90497 6.11439 5.53203C6.48733 5.15909 6.96249 4.90511 7.47977 4.80222C7.99705 4.69932 8.53323 4.75213 9.0205 4.95397C9.50777 5.1558 9.92425 5.49759 10.2173 5.93612C10.5103 6.37465 10.6667 6.89023 10.6667 7.41764C10.6667 8.12489 10.3857 8.80317 9.88563 9.30326C9.38553 9.80336 8.70726 10.0843 8.00001 10.0843ZM8.00001 6.08431C7.7363 6.08431 7.47852 6.16251 7.25925 6.30902C7.03999 6.45553 6.86909 6.66377 6.76817 6.9074C6.66726 7.15103 6.64085 7.41912 6.6923 7.67776C6.74374 7.93641 6.87073 8.17398 7.0572 8.36045C7.24367 8.54692 7.48125 8.67391 7.73989 8.72536C7.99853 8.77681 8.26662 8.7504 8.51026 8.64948C8.75389 8.54857 8.96213 8.37767 9.10864 8.1584C9.25515 7.93914 9.33335 7.68135 9.33335 7.41764C9.33335 7.06402 9.19287 6.72488 8.94282 6.47484C8.69277 6.22479 8.35363 6.08431 8.00001 6.08431Z"
                                    fill="#425A8B"/>
                            </g>
                            <defs>
                                <clipPath id="clip0">
                                    <rect width="16" height="16" fill="white" transform="translate(0 0.750977)"/>
                                </clipPath>
                            </defs>
                        </svg>

                        <h3 className="font-bold text-sm text-primary  ">Address:</h3>
                        <p className="text-primary text-xs">{product?.product?.merchant?.store_address}</p>
                    </div>
                    <div className={'flex items-center gap-2'}>
                        <svg className={'w-4 h-4'} width="8" height="8" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0)">
                                <path
                                    d="M14.3333 8.71789V7.76855C14.3333 6.17726 13.7012 4.65113 12.576 3.52591C11.4508 2.4007 9.92463 1.76855 8.33333 1.76855C6.74203 1.76855 5.21591 2.4007 4.09069 3.52591C2.96547 4.65113 2.33333 6.17726 2.33333 7.76855V8.71789C1.6341 9.02578 1.06186 9.56452 0.712412 10.2439C0.362959 10.9233 0.257505 11.7022 0.413703 12.45C0.5699 13.1979 0.978269 13.8694 1.57044 14.3522C2.16262 14.8349 2.90266 15.0996 3.66666 15.1019H5V8.43522H3.66666V7.76855C3.66666 6.53088 4.15833 5.34389 5.0335 4.46872C5.90867 3.59355 7.09565 3.10189 8.33333 3.10189C9.57101 3.10189 10.758 3.59355 11.6332 4.46872C12.5083 5.34389 13 6.53088 13 7.76855V8.43522H11.6667V13.7686H9V15.1019H13C13.764 15.0996 14.504 14.8349 15.0962 14.3522C15.6884 13.8694 16.0968 13.1979 16.253 12.45C16.4092 11.7022 16.3037 10.9233 15.9542 10.2439C15.6048 9.56452 15.0326 9.02578 14.3333 8.71789ZM3.66666 13.7686C3.13623 13.7686 2.62752 13.5578 2.25245 13.1828C1.87738 12.8077 1.66666 12.299 1.66666 11.7686C1.66666 11.2381 1.87738 10.7294 2.25245 10.3543C2.62752 9.97927 3.13623 9.76855 3.66666 9.76855V13.7686ZM13 13.7686V9.76855C13.5304 9.76855 14.0391 9.97927 14.4142 10.3543C14.7893 10.7294 15 11.2381 15 11.7686C15 12.299 14.7893 12.8077 14.4142 13.1828C14.0391 13.5578 13.5304 13.7686 13 13.7686Z"
                                    fill="#425A8B"/>
                            </g>
                            <defs>
                                <clipPath id="clip0">
                                    <rect width="16" height="16" fill="white" transform="translate(0.333344 0.435059)"/>
                                </clipPath>
                            </defs>
                        </svg>


                        <h3 className="font-bold text-sm text-primary ">Contact Seller:</h3>
                        <p className="text-primary text-xs">{product?.product?.merchant?.support_phone_number}</p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="flex items-center gap-4 mb-8">
                <div className="">
                    <p className="text-xs text-[#08a9ed] font-bold">Merchant Level</p>
                    <p className="text-2xl text-[#435a8c] font-bold">{product?.product?.merchant?.merchant_level?.name}</p>
                </div>
                <div className="">
                    <p className="text-sm text-[#08a9ed] font-bold">Shipping Number Of Days</p>
                    <p className="text-2xl text-[#435a8c] font-bold">{product?.product?.merchant?.shipping_number_of_days}</p>
                </div>

            </div>

            {/* Description Section */}
            <div className="mb-8">
                <div className="text-textPadded font-semibold text-sm space-y-4">
                    {descriptionParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </div>


        </div>
    );
}

export default MerchantAbout;