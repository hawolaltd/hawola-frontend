import React, {useCallback, useEffect, useState} from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import {FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter} from 'react-icons/fa';
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProduct from "@/components/product/RelatedProduct";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {
    addToCarts,
    addToCartsLocal, addWishList, clearProductById,
    getCarts,
    getMerchantReviews,
    getProductBySlug
} from "@/redux/product/productSlice";
import {useRouter} from "next/router";
import {amountFormatter, formatCurrency} from "@/util";
import Link from "next/link";
import {LocalCartItem, ProductByIdResponse} from "@/types/product";
import {toast} from "sonner";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import {router} from "next/client";
import Swal from "sweetalert2";

const ProductPage = () => {
    const [quantity, setQuantity] = useState(1);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [position, setPosition] = useState({x: "50%", y: "50%"});
    const [isHovered, setIsHovered] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);
    const {query} = useRouter()

    const dispatch = useAppDispatch()

    const {product, isLoading, reviews, merchantReviews} = useAppSelector(state => state.products)
    const {isAuthenticated} = useAppSelector(state => state.auth)

    const [mainImage, setMainImage] = useState("");

    const LoadingSpinner = () => (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                <p className="mt-4 text-primary font-medium">Loading product details...</p>
            </div>
        </div>
    );

    // State for selected variants
    const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

    // Handle variant selection
    const handleVariantSelect = (variantId: number, valueId: number) => {
        setSelectedVariants(prev => ({
            ...prev,
            [variantId]: valueId
        }));
    };

    const handleQuantityChange = (value: number) => {
        setQuantity((prev) => Math.max(1, prev + value));
    };


    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPosition({
            x: `${Math.max(0, Math.min(100, x))}%`,
            y: `${Math.max(0, Math.min(100, y))}%`
        });
    };

    const handleWishList = async () => {
        try {
            const res = await dispatch(addWishList({
                items: product?.product?.id
            }));
            if (res?.type.includes('fulfilled')) {
                Swal.fire({
                    title: "Added to wishlist!",
                    icon: "success",
                    draggable: true,
                    showClass: {
                        popup: `
                              animate__animated
                              animate__fadeInUp
                              animate__faster
                            `
                    },
                    hideClass: {
                        popup: `
                              animate__animated
                              animate__fadeOutDown
                              animate__faster
                            `
                    }

                });
            }
        }catch (e) {

        }
    }

    const handleAddToCart = async (product: ProductByIdResponse) => {
        try {
            // Convert selected variants to the format expected by backend
            const variants = product?.product_variant?.length > 0
                ? Object.entries(selectedVariants).map(([variantId, variantValueId]) => ({
                    variant: Number(variantId),
                    variant_value: variantValueId
                }))
                : undefined;

            if (isAuthenticated) {
                const res = await dispatch(addToCarts({
                    items: [{
                        qty: quantity,
                        product: product?.product?.id,
                        ...(variants && { variant: variants })
                    }]
                }));

                if (res?.type.includes('fulfilled')) {
                    dispatch(getCarts());
                    toast.success('Added to cart');
                }
            } else {
                // Get current cart from localStorage or initialize empty array
                const cartItems: LocalCartItem[] = JSON.parse(localStorage.getItem("cartItems") || "[]");

                // Check if item already exists in cart with the same variants
                const existingItemIndex = cartItems.findIndex(item => {
                    if (item.product?.id !== product?.product?.id) return false;

                    // If no variants, match on product only
                    if (!variants && !item.variant) return true;

                    // Compare variants
                    if (variants?.length !== item.variant?.length) return false;

                    // Check each variant matches
                    return variants?.every(v =>
                        item.variant?.some(iv =>
                            iv.variant === v.variant &&
                            iv.variant_value === v.variant_value
                        )
                    );
                });

                if (existingItemIndex >= 0) {
                    // Item exists - increment quantity
                    cartItems[existingItemIndex].qty += quantity;
                } else {
                    // Item doesn't exist - add new item
                    cartItems.push({
                        qty: quantity,
                        product: product?.product,
                        ...(variants && { variant: variants })
                    });
                }

                // Update localStorage
                localStorage.setItem("cartItems", JSON.stringify(cartItems));

                // Update Redux state to match localStorage
                dispatch(addToCartsLocal({
                    items: cartItems.map(item => ({
                        qty: item.qty,
                        product: item.product,
                        ...(item.variant && { variant: item.variant })
                    }))
                }));

                toast.success('Added to cart');
            }
        } catch (e) {
            console.error("Error adding to cart:", e);
            toast.error("Failed to add to cart");
        }
    }

// Update your init function to clear previous product data:
    const init = useCallback(async () => {
        setLoadingProduct(true);
        setLoadingReview(true);
        try {
            // Clear previous product data before loading new one
            dispatch(clearProductById());


            const res = await dispatch(getProductBySlug(query.id as string));
            if (!res.type.includes('rejected')) {
                setLoadingProduct(false);
                const response = await dispatch(getMerchantReviews(query.id as string));
                if (!response.type.includes('rejected')) {
                    setLoadingReview(false);
                }
            }
        } catch (e) {
            setLoadingProduct(false);
            setLoadingReview(false);
        }
    }, [dispatch, query.id]);

    useEffect(() => {
       init()
    }, [init]);

    useEffect(() => {
        if (product?.product?.featured_image?.[0]?.image_url) {
            setCurrentImage(product.product?.featured_image?.[0]?.image_url);
        }
        if (product?.product_images?.length) {
            setMainImage(product?.product_images?.[0]?.image_url);
        }
    }, [product?.product?.featured_image, product?.product_images]);


    if (loadingProduct) {
        return <AuthLayout><ProductSkeleton /></AuthLayout>;
    }


    return (<AuthLayout>
        <div className="max-w-[1320px] mx-auto px-4 py-8">
            {/* Product Image start*/}
            <div className="flex flex-col md:flex-row gap-4 border-b border-b-[#dde4f0] pb-16">
                {/* Image Display */}

                <div style={{flex: 3}} className="flex gap-4 h-4/5">

                    {/* Thumbnail Gallery */}
                    <div className={'hidden lg:flex flex-col gap-4 h-[75vh] w-fit overflow-y-auto'}>
                        {product?.product_images?.map((item, key) => (
                            <div
                                key={key}
                                onClick={() => setMainImage(item?.image_url)}
                                className={`border cursor-pointer transition-all duration-300 ${mainImage === item?.image_url ? 'border-orange' : 'border-[#dde4f0]'} px-2 py-2 flex items-center justify-center rounded-lg h-[100px]`}
                            >
                                <img
                                    src={item?.image_url ? item.image_url : "/imgs/page/product/img-gallery-1.jpg"}
                                    alt="Product Thumbnail"
                                    className="w-[100px] h-full object-contain"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Main Image Display */}
                    <div className="flex-1 flex flex-col items-center justify-center border-4 border-[#dde4f0] h-[75vh] rounded-md relative">

                        {/* Mobile Thumbnail Navigation */}
                        <div className="lg:hidden flex gap-2 overflow-x-auto py-2 w-full justify-center absolute bottom-2 left-0 right-0">
                            {product?.product_images?.map((item, key) => (
                                <div
                                    key={key}
                                    onClick={() => setMainImage(item?.image_url)}
                                    className={`w-12 h-12 rounded border cursor-pointer ${mainImage === item?.image_url ? 'border-orange' : 'border-[#dde4f0]'}`}
                                >
                                    <img
                                        src={item?.image_url ? item.image_url : "/imgs/page/product/img-gallery-1.jpg"}
                                        alt="Product Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Zoomable Main Image */}
                        <div
                            className="relative w-full h-full overflow-hidden cursor-crosshair"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onMouseMove={handleMouseMove}
                        >
                            <img
                                src={mainImage || product?.product?.featured_image?.[0]?.image_url}
                                alt="Product"
                                className={`absolute top-0 left-0 w-full h-full object-contain transition-transform duration-300 ${
                                    isHovered ? "scale-150" : "scale-100"
                                }`}
                                style={{
                                    transformOrigin: `${position.x} ${position.y}`,
                                    maxWidth: 'none',
                                    maxHeight: 'none'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Product Image ends */}
                <div style={{flex: 4}} className=" p-1 flex flex-col mt-8 lg:mt-0">
                    {/* Product Details */}
                    <h1 className="text-xl lg:text-3xl font-bold text-primary mb-6 capitalize">
                        {/*{ product?.product?.name}*/}
                        {loadingProduct ? (
                        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        product?.product?.name
                    )}
                    </h1>

                    <div
                        className={'flex flex-col lg:flex-row lg:items-center mb-4  lg:justify-between w-full border-b border-b-[#dde4f0] pb-4'}>
                        <div>
                            <p className="text-primary text-sm font-bold">
                                <span className="text-[#8c9ec5] text-xs font-bold">by</span>{" "}
                                {loadingProduct ? (
                                    <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse"></span>
                                ) : (
                                    product?.product?.merchant?.store_name
                                )}

                                {/*{product?.product?.merchant?.store_name}*/}
                            </p>
                            <div className="flex items-center text-xs text-[#8c9ec5] font-bold">
                                {loadingProduct ? (
                                    <span className="inline-block h-4 w-24 bg-gray-200 rounded animate-pulse"></span>
                                ) : (
                                    <span>⭐⭐⭐⭐⭐ ({product?.product?.numReviews} reviews)</span>
                                )}
                                {/*{<span>⭐⭐⭐⭐⭐ ({product?.product?.numReviews} reviews)</span>}*/}
                            </div>
                        </div>
                        <div className={'flex items-center gap-4 lg:justify-end'}>

                            <div onClick={handleWishList} className={'flex items-center gap-2'}>
                                <span className={'flex items-center justify-center border border-[#dde4f0] p-0.5 rounded-[4px]'}>
                                     <img src="/assets/love2.svg" alt="Wishlist" className="w-4 h-4"/>
                                </span>
                                <p className={'text-primary font-[500] text-xs cursor-pointer'}>Add to Wish List</p>
                            </div>

                            {/*<div className={'flex items-center gap-2'}>*/}
                            {/*<span*/}
                            {/*    className={'flex items-center justify-center border border-[#dde4f0] p-1 rounded-[4px]'}>*/}
                            {/*     <img src="/assets/compare.svg" alt="compare" className="w-6 h-6"/>*/}
                            {/*</span>*/}
                            {/*    <p className={'text-primary font-[500]'}>Add to Compare</p>*/}
                            {/*</div>*/}

                            <div onClick={()=>{
                                router.push(`/merchants/${product?.product?.merchant?.slug}`)
                            }} className={'flex items-center gap-2'}>
                            <span
                                className={'flex items-center justify-center border border-[#dde4f0] p-0.5 rounded-[4px]'}>
                                 <img src={product?.product?.merchant?.logo} alt={'Merchant Logo'} className={'w-4 h-4 rounded-full'}/>
                            </span>
                            <p className={'text-primary font-[500] text-xs cursor-pointer'}>View Merchant Profile</p>
                        </div>
                        </div>
                    </div>


                    <p className="text-xl lg:text-3xl font-bold text-primary">{formatCurrency(product.product?.discount_price)}<span
                        className="line-through text-xl lg:text-3xl font-medium text-[#8c9ec5]">{formatCurrency(product?.product?.price)}</span>
                    </p>

                    <ul className={'flex flex-col gap-2 text-sm mt-6 mb-6 px-5 font-medium'}>

                        <li className={'flex items-center gap-2 text-sm text-primary'}>
                            <svg className={'w-4 h-4'} width="8" height="8" viewBox="0 0 16 17" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
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
                            Seller's
                            Location: {product?.product?.merchant?.location?.name} {product?.product?.merchant?.state?.name}
                        </li>

                        <li className={'flex items-center gap-2 text-sm text-primary'}>
                            <svg className={'w-4 h-4'} enable-background="new 0 0 128 128" viewBox="0 0 128 128"
                                 xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="64.039" x2="64.039" y1="39"
                                                y2="101.26">
                                    <stop offset=".0074201" stop-color="#fff8e1"/>
                                    <stop offset=".1774" stop-color="#fff6da"/>
                                    <stop offset=".4164" stop-color="#fff2c8"/>
                                    <stop offset=".6962" stop-color="#ffeaaa"/>
                                    <stop offset=".9948" stop-color="#ffe082"/>
                                </linearGradient>
                                <linearGradient id="b" gradientUnits="userSpaceOnUse" x1="80.097" x2="80.097"
                                                y1="29.333" y2="90.334">
                                    <stop offset=".0048889" stop-color="#bcaaa4"/>
                                    <stop offset=".3916" stop-color="#ac958e"/>
                                    <stop offset=".9986" stop-color="#8d6e63"/>
                                </linearGradient>
                                <path
                                    d="m124.19 53.28c0-5.11-4.18-9.28-9.28-9.28h-97.58c-5.11 0-9.28 4.18-9.28 9.28l-4.17 38.22h120.31z"
                                    fill="url(#a)"/>
                                <path
                                    d="m3.88 91.5v11.22c0 5.11 4.18 9.28 9.28 9.28h101.74c5.11 0 9.28-4.18 9.28-9.28v-11.22z"
                                    fill="#66bb6a"/>
                                <path
                                    d="m18.41 47 97.5.5c3.45 0 5.49 2.12 5.49 5.51l-.4 38.49v10.79c0 3.84-3.32 6.64-5.1 6.64l-101.74.11c-6.05 0-7.3-3.81-7.3-6.99l.04-10.63 4.13-38.09.02-.1c.37-5.15 4.21-6.23 7.36-6.23m.01-3c-5.62 0-9.92 2.92-10.36 9l-4.15 38.25-.03 10.79c0 5.11 2.82 10 10.32 10l101.69-.11c3.58 0 8.1-4.27 8.1-9.64v-10.79l.4-38.47c0-5.11-3.44-8.53-8.54-8.53z"
                                    fill="#424242" opacity=".2"/>
                                <path
                                    d="m29.9 75.34h-14.59c-1.65 0-2.85-1.31-2.67-2.92l1.75-15.51c.18-1.61 1.67-2.92 3.33-2.92h12.93c1.65 0 2.85 1.31 2.67 2.92l-.1 15.51c-.18 1.62-1.67 2.92-3.32 2.92z"
                                    fill="#546e7a"/>
                                <path d="m124.19 91.65h-88.19v-59.3c0-2.21 1.79-4 4-4h80.19c2.21 0 4 1.79 4 4z"
                                      fill="url(#b)"/>
                                <path
                                    d="m30.65 56c.24 0 .43.07.55.21.11.12.15.28.13.48-.01.07-.01.14-.01.21l-.1 15.38c-.11.57-.72 1.06-1.33 1.06h-14.58c-.24 0-.43-.07-.55-.21-.11-.12-.15-.28-.13-.48l1.75-15.51c.07-.6.71-1.14 1.34-1.14zm0-2h-12.93c-1.65 0-3.14 1.31-3.33 2.92l-1.75 15.51c-.18 1.61 1.01 2.92 2.67 2.92h14.59c1.65 0 3.14-1.31 3.33-2.92l.1-15.51c.17-1.61-1.02-2.92-2.68-2.92z"
                                    fill="#424242" opacity=".2"/>
                                <path d="m76.33 28.35h11.29v23.65h-11.29z" fill="#6d4c41"/>
                                <path d="m76.33 68.84h11.29v22.81h-11.29z" fill="#6d4c41"/>
                                <path
                                    d="m120.19 31.35c.55 0 1 .45 1 1v56.3h-82.19v-56.3c0-.55.45-1 1-1zm0-3h-80.19c-2.21 0-4 1.79-4 4v59.3h88.19v-59.3c0-2.21-1.79-4-4-4z"
                                    fill="#424242" opacity=".2"/>
                                <circle cx="30" cy="110" fill="#4e342e" r="14"/>
                                <path
                                    d="m30 98c6.62 0 12 5.38 12 12s-5.38 12-12 12-12-5.38-12-12 5.38-12 12-12m0-2c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14-6.27-14-14-14z"
                                    fill="#eee" opacity=".2"/>
                                <circle cx="30" cy="110" fill="#bdbdbd" r="6"/>
                                <circle cx="102" cy="110" fill="#4e342e" r="14"/>
                                <path
                                    d="m102 98c6.62 0 12 5.38 12 12s-5.38 12-12 12-12-5.38-12-12 5.38-12 12-12m0-2c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14-6.27-14-14-14z"
                                    fill="#eee" opacity=".2"/>
                                <circle cx="102" cy="110" fill="#bdbdbd" r="6"/>
                            </svg>
                            {product?.product?.ship_outside_vicinity ? `This Seller ships outside ${product?.product?.merchant?.location?.name}` : `This Seller does not ship outside ${product?.product?.merchant?.location?.name}`}
                        </li>


                        {product?.product?.ship_outside_vicinity &&
                            <li className={'flex items-center gap-2 text-sm text-primary'}>
                                <svg className={'w-6 h-6'} height="8" viewBox="0 0 100 100" width="8"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="51.25" fill="#9d5025" r="30.43"/>
                                    <circle cx="50" cy="48.75" fill="#f58536" r="30.43"/>
                                    <path
                                        d="m58.16 48.61v-6.14a8.16 8.16 0 0 0 -16.2 0v6.14h-4.19v13.61h24.46v-13.61zm-4 0h-8.3v-6.14a3.81 3.81 0 0 1 4.17-3.75 4 4 0 0 1 4.17 3.75z"
                                        fill="#fff"/>
                                </svg>
                                Shipping
                                outside {product?.product?.merchant?.location?.name} cost {amountFormatter(product?.product?.shipping_cost_outside?.shipping_cost)}
                            </li>
                        }


                        <li className={'flex items-center gap-2 text-sm text-primary'}>
                            <svg className={'w-4 h-4'} enable-background="new 0 0 128 128" viewBox="0 0 128 128"
                                 xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="64.039" x2="64.039" y1="39"
                                                y2="101.26">
                                    <stop offset=".0074201" stop-color="#fff8e1"/>
                                    <stop offset=".1774" stop-color="#fff6da"/>
                                    <stop offset=".4164" stop-color="#fff2c8"/>
                                    <stop offset=".6962" stop-color="#ffeaaa"/>
                                    <stop offset=".9948" stop-color="#ffe082"/>
                                </linearGradient>
                                <linearGradient id="b" gradientUnits="userSpaceOnUse" x1="80.097" x2="80.097"
                                                y1="29.333" y2="90.334">
                                    <stop offset=".0048889" stop-color="#bcaaa4"/>
                                    <stop offset=".3916" stop-color="#ac958e"/>
                                    <stop offset=".9986" stop-color="#8d6e63"/>
                                </linearGradient>
                                <path
                                    d="m124.19 53.28c0-5.11-4.18-9.28-9.28-9.28h-97.58c-5.11 0-9.28 4.18-9.28 9.28l-4.17 38.22h120.31z"
                                    fill="url(#a)"/>
                                <path
                                    d="m3.88 91.5v11.22c0 5.11 4.18 9.28 9.28 9.28h101.74c5.11 0 9.28-4.18 9.28-9.28v-11.22z"
                                    fill="#66bb6a"/>
                                <path
                                    d="m18.41 47 97.5.5c3.45 0 5.49 2.12 5.49 5.51l-.4 38.49v10.79c0 3.84-3.32 6.64-5.1 6.64l-101.74.11c-6.05 0-7.3-3.81-7.3-6.99l.04-10.63 4.13-38.09.02-.1c.37-5.15 4.21-6.23 7.36-6.23m.01-3c-5.62 0-9.92 2.92-10.36 9l-4.15 38.25-.03 10.79c0 5.11 2.82 10 10.32 10l101.69-.11c3.58 0 8.1-4.27 8.1-9.64v-10.79l.4-38.47c0-5.11-3.44-8.53-8.54-8.53z"
                                    fill="#424242" opacity=".2"/>
                                <path
                                    d="m29.9 75.34h-14.59c-1.65 0-2.85-1.31-2.67-2.92l1.75-15.51c.18-1.61 1.67-2.92 3.33-2.92h12.93c1.65 0 2.85 1.31 2.67 2.92l-.1 15.51c-.18 1.62-1.67 2.92-3.32 2.92z"
                                    fill="#546e7a"/>
                                <path d="m124.19 91.65h-88.19v-59.3c0-2.21 1.79-4 4-4h80.19c2.21 0 4 1.79 4 4z"
                                      fill="url(#b)"/>
                                <path
                                    d="m30.65 56c.24 0 .43.07.55.21.11.12.15.28.13.48-.01.07-.01.14-.01.21l-.1 15.38c-.11.57-.72 1.06-1.33 1.06h-14.58c-.24 0-.43-.07-.55-.21-.11-.12-.15-.28-.13-.48l1.75-15.51c.07-.6.71-1.14 1.34-1.14zm0-2h-12.93c-1.65 0-3.14 1.31-3.33 2.92l-1.75 15.51c-.18 1.61 1.01 2.92 2.67 2.92h14.59c1.65 0 3.14-1.31 3.33-2.92l.1-15.51c.17-1.61-1.02-2.92-2.68-2.92z"
                                    fill="#424242" opacity=".2"/>
                                <path d="m76.33 28.35h11.29v23.65h-11.29z" fill="#6d4c41"/>
                                <path d="m76.33 68.84h11.29v22.81h-11.29z" fill="#6d4c41"/>
                                <path
                                    d="m120.19 31.35c.55 0 1 .45 1 1v56.3h-82.19v-56.3c0-.55.45-1 1-1zm0-3h-80.19c-2.21 0-4 1.79-4 4v59.3h88.19v-59.3c0-2.21-1.79-4-4-4z"
                                    fill="#424242" opacity=".2"/>
                                <circle cx="30" cy="110" fill="#4e342e" r="14"/>
                                <path
                                    d="m30 98c6.62 0 12 5.38 12 12s-5.38 12-12 12-12-5.38-12-12 5.38-12 12-12m0-2c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14-6.27-14-14-14z"
                                    fill="#eee" opacity=".2"/>
                                <circle cx="30" cy="110" fill="#bdbdbd" r="6"/>
                                <circle cx="102" cy="110" fill="#4e342e" r="14"/>
                                <path
                                    d="m102 98c6.62 0 12 5.38 12 12s-5.38 12-12 12-12-5.38-12-12 5.38-12 12-12m0-2c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14-6.27-14-14-14z"
                                    fill="#eee" opacity=".2"/>
                                <circle cx="102" cy="110" fill="#bdbdbd" r="6"/>
                            </svg>
                            {product?.product?.ship_outside_state ? `This Seller ship outside ${product?.product?.merchant?.state?.name}` : `This Seller does not ship outside ${product?.product?.merchant?.state?.name}`}
                        </li>

                        {product?.product?.ship_outside_state &&
                            <li className={'flex items-center text-sm text-primary'}>
                                <svg className={'w-6 h-6'} height="6" viewBox="0 0 100 100" width="6"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="51.25" fill="#9d5025" r="30.43"/>
                                    <circle cx="50" cy="48.75" fill="#f58536" r="30.43"/>
                                    <path
                                        d="m58.16 48.61v-6.14a8.16 8.16 0 0 0 -16.2 0v6.14h-4.19v13.61h24.46v-13.61zm-4 0h-8.3v-6.14a3.81 3.81 0 0 1 4.17-3.75 4 4 0 0 1 4.17 3.75z"
                                        fill="#fff"/>
                                </svg>
                                Shipping
                                outside {product?.product?.merchant?.state?.name} cost {amountFormatter(product?.product?.shipping_cost_outside_state?.shipping_cost)}
                            </li>
                        }

                    </ul>

                    <div className="mb-6">
                        {/* Variant Selection */}
                        {product?.product_variant?.length > 0 && (
                            <div className="mb-6">
                                {product.product_variant.map((variantGroup) => (
                                    <div key={variantGroup.variant.id} className="mb-4">
                                        <p className="font-medium text-sm text-primary mb-2">
                                            {variantGroup.variant.name}:
                                            <span className="text-sm font-bold text-deepOrange ml-1">
                                                {variantGroup.value.find((v: { id: number; }) => v.id === selectedVariants[variantGroup.variant.id])?.value ||
                                                    `Select ${variantGroup.variant.name}`}
                                             </span>
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {variantGroup.value.map((variantValue: { id: any; countInStock: number; value: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                                                <button
                                                    key={variantValue.id}
                                                    onClick={() => handleVariantSelect(variantGroup.variant.id, variantValue.id)}
                                                    className={`border rounded text-xs px-3 py-1 ${
                                                        selectedVariants[variantGroup.variant.id] === variantValue.id
                                                            ? 'border-orange text-deepOrange bg-orange-50'
                                                            : 'border-[#dde4f0] text-textPadded hover:border-orange'
                                                    } ${
                                                        variantValue.countInStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                    disabled={variantValue.countInStock <= 0}
                                                >
                                                    {variantValue.value}
                                                    {variantValue.countInStock <= 0 && ' (Out of stock)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quantity */}
                        <div className={'mt-6'}>
                            <p className="text-gray-500 mb-2">Quantity</p>
                            <div className={'flex flex-col lg:flex-row lg:items-center gap-4'}>
                                <div className="flex items-center w-fit space-x-3 border-b-[#dde4f0] pb-2 border-b-4">
                                    <button onClick={() => handleQuantityChange(-1)}
                                            className="font-normal text-primary w-8 h-8 flex items-center justify-center text-4xl">-
                                    </button>
                                    <span className="text-primary w-8 text-3xl h-8 text-center">{quantity}</span>
                                    <button onClick={() => handleQuantityChange(1)}
                                            className="font-normal text-primary w-8 h-8 flex items-center justify-center text-4xl"> +
                                    </button>
                                </div>
                                {/* Buttons */}
                                <div onClick={()=>{
                                    handleAddToCart(product as ProductByIdResponse)
                                }} className="flex flex-col sm:flex-row lg:items-center gap-4">
                                    <button className="border border-primary rounded px-16 py-1 text-primary">Add to
                                        cart
                                    </button>
                                    <button className="bg-primary text-white rounded px-16 py-1">Buy now</button>
                                </div>

                            </div>
                        </div>


                        {/* Additional info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-500 mt-12">
                            <div>
                                <p className="font-bold text-primary flex items-center gap-0 text-sm">Free
                                    Delivery</p>
                                <p className={'text-textPadded font-semibold flex items-center gap-0 text-sm'}>Available
                                    for all locations.</p>
                                <p className="text-textPadded font-semibold flex items-center gap-0 text-sm">Delivery
                                    Options & Info</p>
                            </div>

                            {/* Social icons */}
                            <div className="flex gap-4 items-end ">
                                <span className="text-primary font-bold">Share</span>
                                <Link href={product?.product?.merchant?.facebook ?? ''}>
                                    <div className={'pt-1 pl-1 bg-primary'}>
                                        <FaFacebookF className="text-white cursor-pointer"/>
                                    </div>
                                </Link>
                                <Link href={product?.product?.merchant?.linkedin ?? ''}>
                                    <div className={'p-[0.2rem] rounded-full bg-primary'}>
                                        <FaLinkedinIn className="text-white cursor-pointer"/>
                                    </div>
                                </Link>
                                <Link href={product?.product?.merchant?.twitter ?? ''}>
                                    <div className={''}>
                                        <FaTwitter className="text-primary cursor-pointer"/>
                                    </div>
                                </Link>
                                <Link href={product?.product?.merchant?.instagram ?? ''}>
                                    <div className={'p-[0.1rem] rounded-[4px] bg-primary'}>
                                        <FaInstagram className="text-white cursor-pointer"/>
                                    </div>
                                </Link>
                            </div>
                        </div>


                    </div>


                </div>
            </div>


            {/* Frequently Bought Together */}

            <div className="p-6">
             <ProductInfo product={product}/>

             <RelatedProduct product={product}/>

            </div>
        </div>
    </AuthLayout>);
};


export default ProductPage;