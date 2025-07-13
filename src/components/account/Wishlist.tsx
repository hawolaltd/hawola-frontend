import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {LocalCartItem, Product} from "@/types/product";
import {addToCarts, addToCartsLocal, getCarts} from "@/redux/product/productSlice";
import {toast} from "sonner";
import Link from "next/link";
import {formatCurrency} from "@/util";

const Wishlist: NextPage = () => {
    const {wishLists, isLoading} = useAppSelector(state => state.products)

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
        <div className="">
            <div className="">
                {wishLists?.wishlists?.length <= 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <svg
                                className="w-16 h-16 text-gray-300 mb-4"
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                            <p className="text-sm text-gray-500 mb-4">Browse our products and add items you love to your wishlist</p>
                            <Link
                                href="/"
                                className="bg-primary text-white px-6 py-2 rounded text-sm transition-colors"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) :
                    <table className="w-full text-left border-spacing-y-4">
                    <thead className={`bg-detailsBorder text-xs`}>
                    <tr className="">
                        <th className="py-3 px-2 first:rounded-l">
                            <input type="checkbox" className="h-3 w-3"/>
                        </th>
                        <th className="p-3 text-xs text-gray-600">Product</th>
                        <th className="p-3 text-xs text-gray-600">Price</th>
                        {/*<th className="p-3 text-xs text-gray-600">Stock status</th>*/}
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
                                    src={item?.product?.featured_image[0]?.image?.thumbnail}
                                    alt={item?.product?.name}
                                    className="w-16 h-16 object-contain mr-4"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-blue-900">
                                        {item?.product?.name}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < Math.floor(item?.product?.rating as unknown as number)
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600 ml-1">
                                    ({item?.product?.numReviews})
                                </span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-gray-900">{formatCurrency((+(item?.product?.price)).toFixed(2))}</td>
                            {/*    <td className="p-4 text-sm text-gray-600">*/}
                            {/*<span className="px-2 py-1 bg-gray-200 rounded">*/}
                            {/*    {item?.product?. ? 'In Stock' : 'Out of Stock'}*/}
                            {/*</span>*/}
                            {/*    </td>*/}
                            <td className="p-4">
                                <button disabled={isLoading} onClick={() => {
                                    handleAddToCart(item?.product as Product)
                                }}
                                        className={`${isLoading ? 'bg-blue-200 cursor-not-allowed' : 'bg-primary'} text-white px-4 py-2 rounded text-sm`}>
                                    Add to Cart
                                </button>
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
                </table>}
            </div>
        </div>
    );
};

export default Wishlist;