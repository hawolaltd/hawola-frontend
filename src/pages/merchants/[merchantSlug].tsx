import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getMerchants} from "@/redux/product/productSlice";
import {capitalize, formatCurrency} from "@/util";

type Merchant = {
    is_verified: boolean;
    id: number;
    state: {
        name: string;
    };
    location: {
        name: string;
    };
    market: {
        name: string;
        help_text: string;
    };
    merchant_level: {
        name: string;
    };
    store_name: string;
    store_page_title: string;
    store_page_subtitle: string;
    logo: string;
    default_banner: string;
    image_ppoi: string;
    primary_color: string;
    refund_policy: string;
    about_title: string;
    about: string;
    store_address: string;
    shipping_number_of_days: number;
    support_phone_number: string;
    support_email: string;
    is_allowed_to_stream: boolean;
    facebook: string;
    twitter: string;
    instagram: string;
    tiktok: string;
    linkedin: string | null;
    youtube: string | null;
    date_added: string;
    is_active: boolean;
    slug: string;
    merchant_user: number;
};

export default function MerchantPage() {
    const router = useRouter();
    const { merchantSlug } = router.query;
    const [activeTab, setActiveTab] = useState('products');
    const dispatch = useAppDispatch()
    const { merchants, isLoading } = useAppSelector(state => state.products);

    console.log("merchants", merchants)

    useEffect(() => {
        dispatch(getMerchants(merchantSlug as string))
    }, [dispatch, merchantSlug]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!merchants) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Merchant not found</p>
            </div>
        );
    }

    // Function to convert hex to rgba with opacity
    const hexToRgba = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const primaryColor = merchants?.merchant_details?.primary_color || '#88AA17';
    const lighterBg = hexToRgba(primaryColor, 0.1);

    return (
        <AuthLayout>
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>{merchants?.merchant_details?.store_name} | Merchant</title>
                <meta name="description" content={merchants?.merchant_details?.about.substring(0, 160)} />
                <style>
                    {`
                          .merchant-primary {
                            background-color: ${primaryColor};
                          }
                          .merchant-primary-text {
                            color: ${primaryColor};
                          }
                          .merchant-primary-border {
                            border-color: ${primaryColor};
                          }
                          .merchant-primary-hover:hover {
                            background-color: ${hexToRgba(primaryColor, 0.9)};
                          }
                          .merchant-light-bg {
                            background-color: ${lighterBg};
                          }
                    `}
                </style>
            </Head>

            {/* Banner Section */}
            <div className="relative h-64 w-full overflow-hidden">
                <img
                    src={merchants?.merchant_details?.default_banner?.thumbnail}
                    alt={merchants?.merchant_details?.store_name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white">{merchants?.merchant_details.store_name}</h1>
                        <p className="text-xl text-white mt-2">{merchants?.merchant_details.store_page_subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Merchant Info Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Sidebar */}
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Merchant Logo */}
                            <div className="p-4 flex justify-center">
                                <img
                                    src={merchants?.merchant_details.logo}
                                    alt={merchants?.merchant_details.store_name}
                                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                                />
                            </div>

                            {/* Merchant Details */}
                            <div className="p-4 border-t">
                                <h2 className="text-xl font-bold merchant-primary-text">{merchants?.merchant_details?.store_name}</h2>
                                <p className="text-gray-600 mt-1">{merchants?.merchant_details?.market.help_text} {merchants?.merchant_details?.market.name}</p>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 merchant-primary-text mr-2" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        <span>{merchants?.merchant_details?.store_address}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 merchant-primary-text mr-2" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                        </svg>
                                        <span>{merchants?.merchant_details.support_phone_number}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 merchant-primary-text mr-2" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                        <span>{merchants?.merchant_details?.support_email}</span>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="mt-6">
                                    <h3 className="font-medium merchant-primary-text mb-2">Follow Us</h3>
                                    <div className="flex space-x-3">
                                        {merchants?.merchant_details?.facebook && (
                                            <a href={merchants?.merchant_details?.facebook} target="_blank" rel="noopener noreferrer"
                                               className="p-2 rounded-full merchant-light-bg transition">
                                                <svg className="w-5 h-5 merchant-primary-text" fill="currentColor"
                                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                                                </svg>
                                            </a>
                                        )}
                                        {merchants?.merchant_details?.twitter && (
                                            <a href={merchants?.merchant_details?.twitter} target="_blank" rel="noopener noreferrer"
                                               className="p-2 rounded-full merchant-light-bg transition">
                                                <svg className="w-5 h-5 merchant-primary-text" fill="currentColor"
                                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                                                </svg>
                                            </a>
                                        )}
                                        {merchants?.merchant_details?.instagram && (
                                            <a href={merchants?.merchant_details?.instagram} target="_blank" rel="noopener noreferrer"
                                               className="p-2 rounded-full merchant-light-bg transition">
                                                <svg className="w-5 h-5 merchant-primary-text" fill="currentColor"
                                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                                </svg>
                                            </a>
                                        )}
                                        {merchants?.merchant_details?.tiktok && (
                                            <a href={merchants?.merchant_details?.tiktok} target="_blank" rel="noopener noreferrer"
                                               className="p-2 rounded-full merchant-light-bg transition">
                                                <svg className="w-5 h-5 merchant-primary-text" fill="currentColor"
                                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Merchant Level */}
                                <div className="mt-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Merchant Level</span>
                                        <span
                                            className="text-sm font-medium merchant-primary-text">{merchants?.merchant_details?.merchant_level.name}</span>
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full merchant-primary"
                                            style={{width: merchants?.merchant_details?.merchant_level.name === 'Starter' ? '33%' : merchants?.merchant_details?.merchant_level.name === 'Intermediate' ? '66%' : '100%'}}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center mt-4">
                                    {/*{!merchant.is_verified && (*/}
                                        <span className="merchant-light-bg merchant-primary-text text-xs font-semibold mr-2 px-2.5 py-0.5 rounded flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                  clipRule="evenodd"/>
                                          </svg>
                                                Verified
                                        </span>
                                    {/*)}*/}
                                    {/*{merchant.is_allowed_to_stream && (*/}
                                    {/*    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">*/}
                                    {/*      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">*/}
                                    {/*        <path*/}
                                    {/*            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>*/}
                                    {/*      </svg>*/}
                                    {/*        Live Shopping*/}
                                    {/*    </span>*/}
                                    {/*)}*/}
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="bg-white rounded-lg shadow-md mt-6 p-6">
                            <h3 className="text-lg font-bold merchant-primary-text mb-3">{merchants?.merchant_details?.about_title}</h3>
                            <p className="text-gray-700">{merchants?.merchant_details?.about}</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-2/3 lg:w-3/4">
                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products' ? 'merchant-primary-text merchant-primary-border' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Products
                                </button>
                                <button
                                    onClick={() => setActiveTab('policy')}
                                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'policy' ? 'merchant-primary-text merchant-primary-border' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Refund Policy
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'merchant-primary-text merchant-primary-border' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Reviews
                                </button>
                                {merchants?.merchant_details?.is_allowed_to_stream && <button
                                    onClick={() => setActiveTab('live')}
                                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'live' ? 'merchant-primary-text merchant-primary-border' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Live Stream
                                </button>}

                               <button
                                    onClick={() => setActiveTab('shipping')}
                                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'shipping' ? 'merchant-primary-text merchant-primary-border' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                   Shipping Info
                                </button>

                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="mt-6 h-[900px] overflow-x-hidden">
                            {activeTab === 'products' && (
                                <div>
                                    <h2 className="text-2xl font-bold merchant-primary-text mb-6">{merchants?.merchant_details?.store_page_title}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                                        {merchants?.recent_products?.map((item, index) => (
                                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500">Product Image</span>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-medium text-lg mb-1">{capitalize(item.name)}</h3>
                                                    {/*<p className="text-gray-600 text-sm mb-2">Description</p>*/}
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold">{formatCurrency(item.discount_price ? item?.discount_price : item?.price)}</span>
                                                        <button
                                                            className="px-3 py-1 rounded merchant-primary merchant-primary-hover text-white text-sm">
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'policy' && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-2xl font-bold merchant-primary-text mb-4">Refund Policy</h2>
                                    <div className="prose max-w-none"
                                         dangerouslySetInnerHTML={{__html: merchants?.merchant_details?.refund_policy.replace(/\r\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}}/>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-2xl font-bold merchant-primary-text mb-4">Customer Reviews</h2>
                                    <div className="space-y-4">
                                        {[...Array(5)].map((item, index) => (
                                            <div key={index} className="border-b pb-4">
                                                <div className="flex items-center mb-2">
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
                                                    <div>
                                                        <h4 className="font-medium">John Doe</h4>
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg key={i}
                                                                     className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                     fill="currentColor" viewBox="0 0 20 20"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <path
                                                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700">Great products and excellent customer
                                                    service.
                                                    Will definitely buy again!</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'live' &&
                                merchants?.merchant_details?.is_allowed_to_stream && (
                                        <div className="mt-8 bg-black rounded-lg overflow-hidden">
                                            <div className="relative pt-[56.25%]">
                                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <svg className="w-12 h-12 mx-auto text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                        </svg>
                                                        <h3 className="text-xl font-bold text-white mt-2">Live Shopping Event</h3>
                                                        <p className="text-gray-300">Next stream: Today at 3PM</p>
                                                        <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center mx-auto">
                                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                            </svg>
                                                            Set Reminder
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                )
                            }


                            {activeTab === 'shipping' && (
                                <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200">
                                    <h4 className="font-medium merchant-primary-text mb-2">Shipping Info</h4>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 merchant-primary-text mr-2" fill="none"
                                             stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <span>Usually ships within {merchants?.merchant_details?.shipping_number_of_days} business days</span>
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <svg className="w-5 h-5 merchant-primary-text mr-2" fill="none"
                                             stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                        </svg>
                                        <span>Contact for international shipping</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </AuthLayout>
    );
}