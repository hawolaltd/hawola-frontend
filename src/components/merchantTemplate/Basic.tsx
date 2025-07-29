import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from "@/components/layout/AuthLayout";
import { getMerchants } from "@/redux/product/productSlice";
import { capitalize, formatCurrency } from "@/util";
import {useAppSelector} from "@/hook/useReduxTypes";
import {ShoppingCartIcon} from "@heroicons/react/16/solid";

export default function BasicMerchantPage() {
    const router = useRouter();
    const { merchantSlug } = router.query;
    const [activeTab, setActiveTab] = useState('products');
    const { merchants  } = useAppSelector(state => state.products);

    // Dynamic accent color (fallback to modern teal)
    const accentColor = merchants?.merchant_details?.primary_color || '#0D9488';

    return (
        <AuthLayout>
            <Head>
                <title>{merchants?.merchant_details?.store_name} | Shop</title>
                <style>{`
          .accent-bg { background-color: ${accentColor}; }
          .accent-text { color: ${accentColor}; }
          .accent-border { border-color: ${accentColor}; }
          .accent-hover:hover { background-color: ${accentColor}; }
        `}</style>
            </Head>

            {/* Modern Header */}
            <header className="relative h-96 overflow-hidden bg-gray-900">
                <AnimatePresence>
                    <motion.img
                        key={merchants?.merchant_details?.default_banner?.full_size}
                        src={merchants?.merchant_details?.default_banner?.full_size || '/default-banner.jpg'}
                        alt="Banner"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ duration: 0.6 }}
                    />
                </AnimatePresence>

                <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl font-bold mb-2"
                    >
                        {merchants?.merchant_details?.store_name}
                    </motion.h1>
                    <p className="text-xl max-w-2xl">{merchants?.merchant_details?.store_page_subtitle}</p>
                </div>
            </header>

            {/* Floating Merchant Card */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative z-20 mx-8 -mt-16"
            >
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <img
                            src={merchants?.merchant_details?.logo}
                            alt="Logo"
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                        />
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                <span className="accent-bg text-white px-3 py-1 rounded-full text-xs font-medium">
                  {merchants?.merchant_details?.merchant_level?.name || 'Starter'}
                </span>
                                <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                  ⭐ 4.9 (128 reviews)
                </span>
                            </div>
                            <p className="text-gray-600">{merchants?.merchant_details?.about}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabbed Content */}
            <div className="container mx-auto px-4 py-16 max-w-7xl">
                <nav className="flex border-b border-gray-200 mb-12">
                    {['products', 'about', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-6 font-medium text-sm relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {capitalize(tab)}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 accent-bg"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'products' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {merchants?.recent_products?.map((product) => (
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        key={product.id}
                                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                                    >
                                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                            <img
                                                src={product?.featured_image?.[0]?.image?.full_size || '/default-product.jpg'}
                                                alt={product.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                            <button className="absolute bottom-4 right-4 accent-bg text-white p-2 rounded-full shadow-lg">
                                                <ShoppingCartIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-lg">{product.name}</h3>
                                            <div className="flex justify-between items-center mt-3">
                        <span className="font-bold accent-text">
                          {formatCurrency(product.price)}
                        </span>
                                                <button className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:accent-border">
                                                    Quick View
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="prose prose-lg max-w-none">
                                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                                <p>{merchants?.merchant_details.about}</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}