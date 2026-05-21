import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {LocalCartItem, Product} from "@/types/product";
import {addToCarts, addToCartsLocal, getCarts} from "@/redux/product/productSlice";
import {toast} from "sonner";
import Link from "next/link";
import {
    formatCurrency,
    featuredImageCardUrl,
    isContactMerchantOnlyProduct
} from "@/util";
import InlineButtonSpinner from "@/components/ui/InlineButtonSpinner";

const Wishlist: NextPage = () => {
    const { wishLists, isLoading, addToCartPendingProductId } = useAppSelector(
        (state) => state.products
    );

    const handleRemove = (id: string | number) => {
            };

    const [quantity, setQuantity] = useState(1);

    const { isAuthenticated } = useAppSelector(state => state.auth)
    const {localCart} = useAppSelector(state => state.products)

    const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

    const dispatch = useAppDispatch()

    const handleAddToCart = async (product: Product) => {
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
                        product: product?.id,
                        ...(variants && { variant: variants })
                    }]
                }));

                if (res?.type.includes('fulfilled')) {
                    dispatch(getCarts());
                    toast.success('Added to cart');

                }else {
                    toast('error')
                }
            } else {
                // Get current cart from localStorage or initialize empty array
                const cartItems: LocalCartItem[] = JSON.parse(localStorage.getItem("cartItems") || "[]");

                // Check if item already exists in cart with the same variants
                const existingItemIndex = cartItems.findIndex(item => {
                    if (item.product?.id !== product?.id) return false;

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
                        product: product,
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


    return (
        <div className="p-3 sm:p-4 lg:p-0">
            <div className="">
                {wishLists?.wishlists?.length <= 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <svg
                                className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">Your wishlist is empty</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4 text-center px-4">Browse our products and add items you love to your wishlist</p>
                            <Link
                                href="/"
                                className="bg-primary text-white px-6 py-2 rounded text-sm transition-colors"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                    <>
                        {/* Mobile card layout */}
                        <div className="md:hidden space-y-3">
                            {wishLists?.wishlists?.map((item) => (
                                <div
                                    key={item.id}
                                    className="border border-gray-200 rounded-lg bg-white p-3 flex gap-3"
                                >
                                    <img
                                        src={featuredImageCardUrl(item?.product?.featured_image?.[0])}
                                        alt={item?.product?.name}
                                        className="w-20 h-20 object-contain flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-blue-900 line-clamp-2 flex-1 min-w-0">
                                                {item?.product?.name}
                                            </p>
                                            <button
                                                onClick={() => handleRemove(item?.product?.id)}
                                                className="text-gray-400 hover:text-red-600 flex-shrink-0"
                                                aria-label="Remove from wishlist"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0H6a1 1 0 00-1 1v1h14V4a1 1 0 00-1-1h-4z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 mt-1">
                                            {formatCurrency((+(item?.product?.price)).toFixed(2))}
                                        </p>
                                        <div className="mt-auto pt-2">
                                            {isContactMerchantOnlyProduct(item?.product) ? (
                                                <span className="text-xs text-gray-500">Contact merchant only</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        isLoading ||
                                                        addToCartPendingProductId === item?.product?.id
                                                    }
                                                    onClick={() => {
                                                        handleAddToCart(item?.product as Product);
                                                    }}
                                                    className={`inline-flex w-full items-center justify-center gap-2 px-3 py-2 rounded text-xs text-white ${
                                                        isLoading ||
                                                        addToCartPendingProductId === item?.product?.id
                                                            ? "cursor-wait bg-slate-300"
                                                            : "bg-primary hover:bg-primary-dark"
                                                    }`}
                                                >
                                                    {addToCartPendingProductId === item?.product?.id ? (
                                                        <InlineButtonSpinner className="h-4 w-4 text-white" />
                                                    ) : null}
                                                    {addToCartPendingProductId === item?.product?.id
                                                        ? "Adding…"
                                                        : "Add to cart"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table layout */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-spacing-y-4">
                                <thead className={`bg-detailsBorder text-xs`}>
                                <tr className="">
                                    <th className="py-3 px-2 first:rounded-l">
                                        <input type="checkbox" className="h-3 w-3"/>
                                    </th>
                                    <th className="p-3 text-xs text-gray-600">Product</th>
                                    <th className="p-3 text-xs text-gray-600">Price</th>
                                    <th className="p-3 text-xs text-gray-600">Action</th>
                                    <th className="p-3 text-xs text-gray-600 last:rounded-r">Remove</th>
                                </tr>
                                </thead>
                                <tbody className="mt-8">
                                {wishLists?.wishlists?.map((item) => (
                                    <tr key={item.id} className="border border-gray-200 my-4">
                                        <td className="p-4">
                                            <input type="checkbox" className="h-4 w-4"/>
                                        </td>
                                        <td className="p-4 flex items-center">
                                            <img
                                                src={featuredImageCardUrl(item?.product?.featured_image?.[0])}
                                                alt={item?.product?.name}
                                                className="w-16 h-16 object-contain mr-4"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-blue-900">
                                                    {item?.product?.name}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-900">{formatCurrency((+(item?.product?.price)).toFixed(2))}</td>
                                        <td className="p-4">
                                            {isContactMerchantOnlyProduct(item?.product) ? (
                                                <span className="text-sm text-gray-500">—</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        isLoading ||
                                                        addToCartPendingProductId === item?.product?.id
                                                    }
                                                    onClick={() => {
                                                        handleAddToCart(item?.product as Product);
                                                    }}
                                                    className={`inline-flex min-w-[120px] items-center justify-center gap-2 px-4 py-2 rounded text-sm text-white ${
                                                        isLoading ||
                                                        addToCartPendingProductId === item?.product?.id
                                                            ? "cursor-wait bg-slate-300"
                                                            : "bg-primary hover:bg-primary-dark"
                                                    }`}
                                                >
                                                    {addToCartPendingProductId === item?.product?.id ? (
                                                        <InlineButtonSpinner className="h-4 w-4 text-white" />
                                                    ) : null}
                                                    {addToCartPendingProductId === item?.product?.id
                                                        ? "Adding…"
                                                        : "Add to cart"}
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleRemove(item?.product?.id)}
                                                className="text-gray-600 hover:text-red-600"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0H6a1 1 0 00-1 1v1h14V4a1 1 0 00-1-1h-4z"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                    )}
            </div>
        </div>
    );
};

export default Wishlist;