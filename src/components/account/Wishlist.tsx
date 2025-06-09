import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import {useAppSelector} from "@/hook/useReduxTypes";

const Wishlist: NextPage = () => {
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: '1',
            image: '/imgs/page/homepage1/electric.png',
            name: "Samsung 36' French door 28 cu. ft. Smart Energy Star Refrigerator",
            rating: 4.5,
            reviews: 65,
            price: 2.51,
            inStock: true,
        },
        {
            id: '2',
            image: '/imgs/page/homepage1/electric.png',
            name: "Samsung 36' French door 28 cu. ft. Smart Energy Star Refrigerator",
            rating: 4.5,
            reviews: 65,
            price: 1.51,
            inStock: true,
        },
        {
            id: '3',
            image: '/imgs/page/homepage1/electric.png',
            name: "Samsung 36' French door 28 cu. ft. Smart Energy Star Refrigerator",
            rating: 4.5,
            reviews: 65,
            price: 3.51,
            inStock: true,
        },
        {
            id: '4',
            image: '/imgs/page/homepage1/electric.png',
            name: "Samsung 36' French door 28 cu. ft. Smart Energy Star Refrigerator",
            rating: 4.5,
            reviews: 65,
            price: 4.51,
            inStock: true,
        },
        {
            id: '5',
            image: '/imgs/page/homepage1/electric.png',
            name: "Samsung 36' French door 28 cu. ft. Smart Energy Star Refrigerator",
            rating: 4.5,
            reviews: 65,
            price: 3.51,
            inStock: true,
        },
    ]);

    const {wishLists} = useAppSelector(state => state.products)

    const handleRemove = (id: string | number) => {
        setWishlistItems(wishlistItems.filter((item) => item.id !== id));
    };

    return (
        <div className="">
            <div className="">
                <table className="w-full text-left border-spacing-y-4">
                    <thead className={`bg-detailsBorder text-xs`}>
                    <tr className="">
                        <th className="py-3 px-2 first:rounded-l">
                            <input type="checkbox" className="h-3 w-3" />
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
                                <input type="checkbox" className="h-4 w-4" />
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
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600 ml-1">
                                    ({item?.product?.numReviews})
                                </span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-gray-900">${(+(item?.product?.price)).toFixed(2)}</td>
                        {/*    <td className="p-4 text-sm text-gray-600">*/}
                        {/*<span className="px-2 py-1 bg-gray-200 rounded">*/}
                        {/*    {item?.product?. ? 'In Stock' : 'Out of Stock'}*/}
                        {/*</span>*/}
                        {/*    </td>*/}
                            <td className="p-4">
                                <button className="bg-blue-900 text-white px-4 py-2 rounded text-sm">
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
                </table>
            </div>
        </div>
    );
};

export default Wishlist;