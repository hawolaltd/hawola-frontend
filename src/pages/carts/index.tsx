import React, {useEffect, useState} from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import RelatedProduct from "@/components/product/RelatedProduct";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import ProductCard from "@/components/product/ProductCard";
import FeaturesSection from "@/components/home/FeaturesSection";
import {amountFormatter} from "@/util";
import {toast} from "react-toastify";
import {addToCarts, deleteCart, getCarts, updateCart} from "@/redux/product/productSlice";
import DeleteModal from "@/components/shared/Delete";
import {CartItem} from "@/types/product";
import {debounce} from "next/dist/server/utils";

const CartPage = () => {

    const {products, carts} = useAppSelector(state => state.products)
    const [pendingUpdates, setPendingUpdates] = useState<{[id: number]: number}>({});

    const dispatch = useAppDispatch()
    const [cartItems, setCartItems] = useState(carts['cart_items']);

    const [openDelete, setOpenDelete] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const [selectedPro, setOpenSelectedPro] = useState< CartItem | null>(null);

    // Debounced API sync
    const syncWithServer = debounce(async () => {
        try {
            await dispatch(updateCart({id: Object.keys(pendingUpdates).join(), data: {qty: +(Object.values(pendingUpdates).join())}}))
            setPendingUpdates({});
        } catch (error) {
            console.error('Sync failed', error);
        }
    }, 1000);
    console.log("pending", pendingUpdates)
    console.log("pendingUpdates", Object.keys(pendingUpdates).join())
    console.log("pendingUpdates", +(Object.values(pendingUpdates).join()))
    // Handle quantity changes
    const updateQuantity = (id: number, change: number) => {
        setCartItems(prev => prev?.map(item =>
            item.id === id ? {...item, qty: Math.max(1, item.qty + change)} : item
        ));
        // Track pending updates
        setPendingUpdates(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + change
        }));
    };

    // Sync when pending updates exist
    useEffect(() => {

        if (Object.keys(pendingUpdates).length > 0) {
            syncWithServer();
        }

        // return () => syncWithServer;

    }, [pendingUpdates, syncWithServer]);


    const subtotal = carts?.cart_items.reduce((sum, product) => {
        return sum + (+(product?.product.price) * product.qty);
    }, 0);

    const handleDeleteCart = async () =>{
        setDeleting(true)
        try {
            const res = await dispatch(deleteCart({items: [selectedPro?.id as number]}))
            if (res?.type.includes('fulfilled')){
                toast.success("Deleted")
                dispatch(getCarts())
                setDeleting(false)
               setOpenDelete(false)
            }
        }catch (e) {
            console.log(e)
            setDeleting(false)
        }finally {
            setDeleting(false)
        }
    }

    const shippingRate = 0.08;
    const shippingCost = subtotal * shippingRate;
    const total = subtotal + shippingCost;

    console.log('cartsview', carts)

    return (
        <AuthLayout>
            <DeleteModal open={openDelete} loading={deleting} onClose={() =>{
                setOpenDelete(!openDelete)
            }} handleDelete={handleDeleteCart}/>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Products List */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 bg-[#f1f3f9] p-4 border-b">
                            <div className="col-span-5 font-semibold">Product</div>
                            <div className="col-span-2 font-semibold text-center">Unit Price</div>
                            <div className="col-span-2 font-semibold text-center">Quantity</div>
                            <div className="col-span-2 font-semibold text-center">Subtotal</div>
                            <div className="col-span-1 font-semibold text-center">Remove</div>
                        </div>

                        {/* Product Items */}
                       <div className={'h-[550px] overflow-x-hidden'}>
                           {cartItems?.map((cart) => (
                               <div key={cart.id} className="p-4 border-b last:border-b-0">
                                   <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                                       {/* Product Info */}
                                       <div className="md:col-span-5 flex items-center gap-4">
                                           <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0"></div>
                                           <div>
                                               <h3 className="font-medium">{cart.product.name}</h3>
                                               <div className="flex items-center mt-1">
                                                   {[...Array(5)].map((_, i) => (
                                                       <svg key={i} className={`w-4 h-4 ${i < +(cart.product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                       </svg>
                                                   ))}
                                                   <span className="text-xs text-gray-500 ml-1">({cart?.product?.numReviews})</span>
                                               </div>
                                           </div>
                                       </div>

                                       {/* Unit Price */}
                                       <div className="md:col-span-2 text-center">
                                           <span className="md:hidden font-medium mr-2">Price:</span>
                                           <span className="font-semibold">${amountFormatter((+(cart?.product.price)).toFixed(2))}</span>
                                       </div>

                                       {/* Quantity */}
                                       <div className="md:col-span-2 flex justify-center">
                                           <div className="flex items-center border rounded-md">
                                               <button
                                                   onClick={() => updateQuantity(cart.id, -1)}
                                                   className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                               >
                                                   -
                                               </button>
                                               <span className="px-3 py-1 border-x">{cart.qty}</span>
                                               <button
                                                   onClick={() => updateQuantity(cart.id, 1)}
                                                   className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                               >
                                                   +
                                               </button>
                                           </div>
                                       </div>

                                       {/* Subtotal */}
                                       <div className="md:col-span-2 text-center">
                                           <span className="md:hidden font-medium mr-2">Subtotal:</span>
                                           <span className="font-semibold">${amountFormatter((+(cart?.product.price) * cart.qty).toFixed(2))}</span>
                                       </div>

                                       {/* Remove */}
                                       <div onClick={()=>{
                                           setOpenSelectedPro(cart)
                                           setOpenDelete(!openDelete)
                                       }} className="md:col-span-1 flex justify-center" >
                                           <button className="text-red-500 hover:text-red-700">
                                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                               </svg>
                                           </button>
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                    </div>

                    {/* Cart Actions */}
                    <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <button className="px-6 py-2 border-none text-white rounded-md bg-primary transition">
                            Continue Shopping
                        </button>
                        <button className="px-6 py-2 bg-primary rounded-md text-white transition">
                            Update Cart
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-semibold">${amountFormatter(subtotal.toFixed(2))}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span className="font-semibold">${amountFormatter(shippingCost.toFixed(2))}</span>
                            </div>

                            <div className="border-t pt-4 flex justify-between">
                                <span className="font-bold">Total:</span>
                                <span className="font-bold text-lg">${amountFormatter(total.toFixed(2))}</span>
                            </div>
                        </div>

                        {/* Shipping Calculator */}
                        <div className="mt-6">
                            <h3 className="font-medium mb-3">Calculate Shipping</h3>
                            <div className="space-y-3">
                                <select className="w-full p-2 border rounded-md">
                                    <option>USA</option>
                                    <option>United Kingdom</option>
                                    <option>Canada</option>
                                </select>
                                <input type="text" placeholder="State / Country" className="w-full p-2 border rounded-md" />
                                <input type="text" placeholder="Postcode / ZIP" className="w-full p-2 border rounded-md" />
                                <button className="w-full py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition">
                                    Update
                                </button>
                            </div>
                        </div>

                        {/* Coupon Code */}
                        <div className="mt-6">
                            <h3 className="font-medium mb-3">Apply Coupon</h3>
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button className="px-4 py-2 bg-primary text-white rounded-r-md transition">
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button className="w-full mt-6 py-3 bg-primary text-white font-medium rounded-md transition">
                            Proceed To Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
            <div className={'m-8'}>
                <div
                    className={'flex justify-between items-center'}>
                    <h4 className={'font-bold text-2xl text-primary py-6'}>You May Also Like</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {products?.results?.slice(0, 8)?.map((product, key) => (
                        <ProductCard key={key} product={product}/>))}
                </div>
            </div>

            <div className={'m-12'}>
                <FeaturesSection/>
            </div>
        </AuthLayout>
    );
};

export default CartPage;