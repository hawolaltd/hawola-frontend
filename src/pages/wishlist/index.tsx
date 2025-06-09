import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import AuthLayout from "@/components/layout/AuthLayout";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getMerchants, getWishList} from "@/redux/product/productSlice";
import RelatedProduct from "@/components/product/RelatedProduct";
import moment from "moment";

type Product = {
    id: string;
    name: string;
    price: number;
    stockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock';
    addedDate: Date;
    image: string;
};

export default function WishlistPage() {

    const {wishList, product, wishLists} = useAppSelector(state => state.products)

    const dispatch = useAppDispatch()

    const [products, setProducts] = useState<Product[]>([
        {
            id: '1',
            name: 'Wireless Bluetooth Headphones',
            price: 99.99,
            stockStatus: 'In Stock',
            addedDate: new Date('2023-05-15'),
            image: '/images/headphones.jpg',
        },
        {
            id: '2',
            name: 'Smart Watch Series 5',
            price: 199.99,
            stockStatus: 'Low Stock',
            addedDate: new Date('2023-06-20'),
            image: '/images/smartwatch.jpg',
        },
        {
            id: '3',
            name: '4K Ultra HD Smart TV',
            price: 799.99,
            stockStatus: 'Out of Stock',
            addedDate: new Date('2023-04-10'),
            image: '/images/tv.jpg',
        },
        {
            id: '4',
            name: 'Wireless Mechanical Keyboard',
            price: 129.99,
            stockStatus: 'In Stock',
            addedDate: new Date('2023-07-05'),
            image: '/images/keyboard.jpg',
        },
    ]);

    const handleAddToCart = (productId: string | number ) => {
        // Add to cart logic here
        console.log(`Added product ${productId} to cart`);
    };

    const handleRemove = (productId: string | number) => {
        setProducts(products.filter(product => product.id !== productId));
    };

    const formatDate = (date: any) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStockStatusColor = (status: Product['stockStatus']) => {
        switch (status) {
            case 'In Stock':
                return 'text-green-600';
            case 'Low Stock':
                return 'text-yellow-600';
            case 'Out of Stock':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    useEffect(() => {
        dispatch(getWishList())
    }, [dispatch]);

    return (
        <AuthLayout>
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>My Wishlist</title>
                <meta name="description" content="Your saved products wishlist" />
            </Head>

            <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                        <p className="text-gray-600">{products.length} items</p>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    {/*<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">*/}
                                    {/*    Stock Status*/}
                                    {/*</th>*/}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Added On
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {wishLists?.wishlists?.length > 0 ? (
                                    wishLists?.wishlists?.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-16 w-16">
                                                        <img className="h-16 w-16 rounded-md object-cover" src={product?.product?.featured_image?.[0]?.image?.thumbnail} alt={product?.product.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product?.product?.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">${(+(product?.product?.price)).toFixed(2)}</div>
                                            </td>
                          {/*                  <td className="px-6 py-4 whitespace-nowrap">*/}
                          {/*<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(product.stockStatus)}`}>*/}
                          {/*  {product.stockStatus}*/}
                          {/*</span>*/}
                          {/*                  </td>*/}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {moment(product?.created_at).format('MMM Do YYYY')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleAddToCart(product?.product?.id)}
                                                    // disabled={product.stockStatus === 'Out of Stock'}
                                                    className={`mr-3 ${product?.product?.name === 'Out of Stock' ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary'} text-white px-3 py-1 rounded-md text-sm`}
                                                >
                                                    Add to Cart
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(product?.product?.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Your wishlist is empty. Start adding some products!
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {wishLists?.wishlists?.length > 0 && (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    const inStockProducts = products.filter(p => p.stockStatus === 'In Stock');
                                    inStockProducts.forEach(p => handleAddToCart(p.id));
                                }}
                                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Add All Available to Cart
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <RelatedProduct product={product}/>
        </div>
        </AuthLayout>
    );
}