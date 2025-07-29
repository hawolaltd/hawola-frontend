import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getMerchants} from "@/redux/product/productSlice";
import {capitalize, formatCurrency} from "@/util";
import { motion, AnimatePresence } from 'framer-motion';
import {ArrowRightIcon} from "@heroicons/react/16/solid";
import {CheckCircleIcon} from "@heroicons/react/24/outline";

export default function PremiumMerchantPage() {
    const router = useRouter();
    const { merchantSlug } = router.query;
    const [activeTab, setActiveTab] = useState('products');
    const dispatch = useAppDispatch()
    const { merchants, isLoading } = useAppSelector(state => state.products);

    // Dynamic accent color (fallback to modern teal)
    const accentColor = merchants?.merchant_details?.primary_color || '#0D9488';

    useEffect(() => {
        dispatch(getMerchants(merchantSlug as string))
    }, [dispatch, merchantSlug]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!merchants) {
        return <div className="flex items-center justify-center min-h-screen">Merchant not found</div>;
    }

    const primaryColor = merchants?.merchant_details?.primary_color || '#88AA17';
    const hexToRgba = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
    const lighterBg = hexToRgba(primaryColor, 0.1);

    return (
        <AuthLayout>
            <Head>
                <title>{merchants?.merchant_details?.store_name} | Premium Store</title>
                <style>{`
          .accent-bg { background: linear-gradient(135deg, ${accentColor} 0%, #7C3AED 100%); }
          .accent-text { color: ${accentColor}; }
          .glow-effect { box-shadow: 0 0 20px rgba(13, 148, 136, 0.3); }
        `}</style>
            </Head>

            {/* Immersive Hero */}
            <div className="relative h-screen max-h-[800px] bg-gray-900 overflow-hidden">
                {/*<video*/}
                {/*    autoPlay loop muted*/}
                {/*    className="absolute inset-0 w-full h-full object-cover opacity-40"*/}
                {/*    poster={merchants?.merchant_details?.merchant_video_feed}*/}
                {/*>*/}
                {/*    <source src={merchants?.merchant_details?.promo_video} type="video/mp4" />*/}
                {/*</video>*/}
                <img src={merchants?.banners?.[0]?.image?.full_size} alt={'merchant banner'} className='absolute inset-0 w-full h-full object-cover opacity-40'/>

                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-bold mb-6"
                    >
                        {merchants?.merchant_details?.store_name}
                    </motion.h1>
                    <p className="text-xl md:text-2xl max-w-2xl mb-8">{merchants?.merchant_details?.store_page_subtitle}</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="accent-bg text-white px-8 py-4 rounded-full text-lg font-medium glow-effect"
                    >
                        Shop The Collection
                    </motion.button>
                </div>
            </div>

            {/* Floating Navigation */}
            <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-white">{merchants?.merchant_details?.store_name}</span>
                    <div className="flex space-x-6">
                        {['Shop', 'Collections', 'About', 'Contact'].map((item) => (
                            <a key={item} href="#" className="text-gray-300 hover:text-white transition">
                                {item}
                            </a>
                        ))}
                    </div>
                    <button className="accent-bg text-white px-6 py-2 rounded-full">
                        Book Consultation
                    </button>
                </div>
            </nav>

            {/* Featured Products */}
            <section className="py-20 bg-gray-950">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-bold text-white">Signature Collection</h2>
                        <a href="#" className="flex items-center accent-text">
                            View All <ArrowRightIcon className="ml-2 w-5 h-5" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {merchants?.recent_products?.map((product) => (
                            <motion.div
                                whileHover="hover"
                                key={product.id}
                                className="relative group overflow-hidden rounded-xl"
                            >
                                <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                                    <img
                                        src={product?.featured_image?.[0]?.image?.full_size || '/default-product.jpg'}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <motion.div
                                        variants={{ hover: { opacity: 1 } }}
                                        initial={{ opacity: 0 }}
                                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6"
                                    >
                                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                        <p className="text-gray-300 mt-1">{formatCurrency(product.price)}</p>
                                        <button className="mt-4 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium self-start">
                                            Add to Cart
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Luxury Experience Section */}
            <section className="py-20 bg-black text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Exclusive Benefits</h2>
                            <ul className="space-y-4">
                                {[
                                    'Private shopping appointments',
                                    'Priority customer support',
                                    'Exclusive product launches',
                                    'Personalized recommendations'
                                ].map((benefit) => (
                                    <li key={benefit} className="flex items-start">
                                        <CheckCircleIcon className="w-6 h-6 accent-text mr-3 mt-1 flex-shrink-0" />
                                        <span className="text-lg">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="mt-8 border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition">
                                Become a VIP Member
                            </button>
                        </div>
                        <div className="relative h-96 rounded-2xl overflow-hidden">
                            <img
                                src="/luxury-experience.jpg"
                                alt="Luxury Experience"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
                        </div>
                    </div>
                </div>
            </section>
        </AuthLayout>
    );
}