import React, {useEffect, useState, useCallback, useMemo} from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import ProductCard from "@/components/product/ProductCard";
import FeaturesSection from "@/components/home/FeaturesSection";
import {toast} from "sonner";
import {addOrder, deleteCart, getAddress, getCarts, updateCart} from "@/redux/product/productSlice";
import DeleteModal from "@/components/shared/Delete";
import {AddressData, CartItem} from "@/types/product";
import {debounce} from "next/dist/server/utils";
import {getAllStates} from "@/redux/general/generalSlice";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummary from "@/components/cart/OrderSummary";
import {useRouter} from "next/router";


interface OrderItem {
    product: number;
    qty: number;
    price: number;
    shipping_cost: number;
    merchant: number;
    variant?: Array<{
        variant: number;
        variant_value: number;
    }>;
}


const CartPage = () => {
    const {products, carts, addresses} = useAppSelector(state => state.products);
    const dispatch = useAppDispatch();
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);
    const router = useRouter();
    const [pendingUpdates, setPendingUpdates] = useState<{[id: number]: number}>({});
    const [cartItems, setCartItems] = useState(carts['cart_items']);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [openDelete, setOpenDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedPro, setSelectedPro] = useState<CartItem | null>(null);
    const [selectedAdd, setSelectedAdd] = useState<AddressData | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(false);

    const { subtotal: selectedSubtotal, shippingCost, total } = useMemo(() => {
        const subtotal = carts?.cart_items?.reduce((sum, product) => {
            if (!selectedItems.includes(product?.id)) return sum;

            const effectiveQty = pendingUpdates[product?.id] !== undefined
                ? pendingUpdates[product?.id]
                : product?.qty;
            return sum + (+(product?.product?.price) * effectiveQty);
        }, 0) || 0;

        const shippingRate = 0.08;
        const shippingCost = subtotal * shippingRate;
        const total = subtotal + shippingCost;

        return { subtotal, shippingCost, total };
    }, [carts, selectedItems, pendingUpdates]);


    const allSelected = cartItems?.length > 0 && selectedItems.length === cartItems.length;


    // eslint-disable-next-line react-hooks/exhaustive-deps
    const syncWithServer = useCallback(
        debounce(async (updates: typeof pendingUpdates) => {
            try {
                await dispatch(updateCart({
                    id: Object.keys(updates).join(),
                    data: { qty: +(Object.values(updates).join()) }
                }));
                setPendingUpdates({});
            } catch (error) {
                console.error('Sync failed', error);
            }
        }, 1000),
        [dispatch]
    );


    const updateQuantity = (id: number, change: number) => {
        setCartItems(prev => prev?.map(item =>
            item.id === id ? {...item, qty: Math.max(1, item.qty + change)} : item
        ));
        setPendingUpdates(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + change
        }));
    };

    // Handle item selection
    const handleSelectItem = (id: number, isSelected: boolean) => {
        setSelectedItems(prev =>
            isSelected
                ? [...prev, id]
                : prev.filter(itemId => itemId !== id)
        );
    };

    // Handle select all/deselect all
    const handleSelectAll = (selectAll: boolean) => {
        if (selectAll) {
            setSelectedItems(cartItems?.map(item => item.id) || []);
        } else {
            setSelectedItems([]);
        }
    };

    // Handle delete cart item
    const handleDeleteCart = async () => {
        setDeleting(true);
        try {
            const res = await dispatch(deleteCart({items: [selectedPro?.id as number]}));
            if (res?.type.includes('fulfilled')) {
                toast.success("Deleted");
                dispatch(getCarts());
                setOpenDelete(false);
                // Remove from selected items if deleted
                setSelectedItems(prev => prev.filter(id => id !== selectedPro?.id));
            }
        } catch (e) {
            console.log(e);
        } finally {
            setDeleting(false);
        }
    };

    // Handle address operations
    const handleAddNewAddress = () => {
        setShowForm(true);
        setSelectedAdd(null);
    };

    const handleEditAddress = (address: any) => {
        setEditingAddress(true);
        setSelectedAdd(address);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingAddress(false);
    };

    // Helper function to calculate shipping cost for an item
    const calculateShippingCost = (price: number) => {
        const shippingRate = 0.08;
        return price * shippingRate;
    };

 const checkMerchantShipping = async (items: OrderItem[]) => {

        const merchantIds = [...new Set(items.map(item => item.merchant))];

        const problematicMerchants = cartItems?.filter(pro => !pro?.product?.ship_outside_state)
        // const problematicMerchants = cartItems?.filter(pro => !pro?.product?.ship_outside_state  || !pro?.product?.ship_outside_vicinity)

        // Find problematic items
        const problematicItems = problematicMerchants.filter(item => selectedItems.includes(item.id))


        if (problematicItems.length > 0) {
            const productNames = problematicItems.map(item =>
                cartItems.find(ci => ci.product.id === item?.product?.id)?.product.name
            ).filter(Boolean);

            return `The following items cannot be shipped to your location: ${productNames.join(', ')}. Please remove them to proceed.`;
        }

        return null;
    };


    const handleProceedToCheckout = async () => {
        if (!selectedAdd || selectedItems.length === 0) return;

        setCreatingOrder(true);
        setShippingError(null);

        try {
            // Prepare order items
            const orderItems: OrderItem[] = cartItems
                .filter(item => selectedItems.includes(item.id))
                .map(item => ({
                    product: item.product.id,
                    qty: item.qty + (pendingUpdates[item.id] || 0),
                    price: +item.product.price,
                    shipping_cost: calculateShippingCost(+item.product.price),
                    merchant: item.product.merchant.id,
                    // Add variants if they exist
                    variant: item?.cart_variant?.map(v => ({
                        variant: v.variant.id,
                        variant_value: v.variant_value.id
                    }))
                }));

            const shippingIssues = await checkMerchantShipping(orderItems);
            if (shippingIssues) {
                setShippingError(shippingIssues);
                return;
            }

            // Create order payload
            const orderPayload = {
                shippingAddress_id: selectedAdd.id,
                orderItems: orderItems.map(item => ({
                    qty: item.qty,
                    product_id: item.product
                }))
            };
            // Dispatch order creation
            const result = await dispatch(addOrder(orderPayload));

            if (result?.type.includes('fulfilled')) {
                router.push(`/carts/checkout`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to create order');
        } finally {
            setCreatingOrder(false);
        }
    };


    // Sync when pending updates exist
    useEffect(() => {
        if (Object.keys(pendingUpdates).length > 0) {
            syncWithServer(pendingUpdates);
        }
    }, [pendingUpdates, syncWithServer]);

    // Fetch data on mount
    useEffect(() => {
        dispatch(getAddress());
        dispatch(getAllStates());
    }, [dispatch]);

    // Update cart items when carts change
    useEffect(() => {
        setCartItems(carts['cart_items']);
        // Reset selection when cart items change
        setSelectedItems([]);
    }, [carts]);

    return (
        <AuthLayout>
            <DeleteModal
                open={openDelete}
                loading={deleting}
                onClose={() => setOpenDelete(!openDelete)}
                handleDelete={handleDeleteCart}
                warningText={`You are about to delete from your cart Are you really sure about this? This action cannot be undone`}
            />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Products List */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Table Header with Select All */}
                            <div className="hidden md:grid grid-cols-12 bg-[#f1f3f9] p-4 border-b">
                                <div className="col-span-5 font-semibold flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span>Product</span>
                                </div>
                                <div className="col-span-2 font-semibold text-center">Unit Price</div>
                                <div className="col-span-2 font-semibold text-center">Quantity</div>
                                <div className="col-span-2 font-semibold text-center">Subtotal</div>
                                <div className="col-span-1 font-semibold text-center">Remove</div>
                            </div>

                            {/* Product Items */}
                            <div className={'h-[550px] overflow-x-auto'}>
                                {cartItems?.length > 0 ? (
                                    cartItems.map((cart) => (
                                        <CartItemRow
                                            key={cart.id}
                                            cart={cart}
                                            updateQuantity={updateQuantity}
                                            onDelete={() => {
                                                setSelectedPro(cart);
                                                setOpenDelete(true);
                                            }}
                                            onSelect={handleSelectItem}
                                            isSelected={selectedItems.includes(cart.id)}
                                            pendingUpdates={pendingUpdates}
                                        />
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        Your cart is empty
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart Actions */}
                        <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                            <button onClick={()=>{
                                router.push('/')
                            }} className="px-6 py-2 border-none text-white rounded-md bg-primary transition">
                                Continue Shopping
                            </button>
                            {/*<button*/}
                            {/*    className="px-6 py-2 bg-primary rounded-md text-white transition"*/}
                            {/*    onClick={() => dispatch(getCarts())} // Refresh cart data*/}
                            {/*>*/}
                            {/*    Update Cart*/}
                            {/*</button>*/}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <OrderSummary
                            subtotal={selectedSubtotal || 0}
                            shippingCost={shippingCost || 0}
                            total={total || 0}
                            addresses={addresses}
                            selectedAdd={selectedAdd}
                            onAddNewAddress={handleAddNewAddress}
                            onEditAddress={handleEditAddress}
                            onSelectAddress={(address) => setSelectedAdd(address)}
                            showForm={showForm}
                            editingAddress={editingAddress}
                            onCancelForm={handleCancelForm}
                            onCheckout={handleProceedToCheckout}
                            loading={creatingOrder}
                            shippingError={shippingError}
                        />
                    </div>
                </div>
            </div>

            {/* Recommended Products */}
            <div className={'m-8'}>
                <div className={'flex justify-between items-center'}>
                    <h4 className={'font-bold text-2xl text-primary py-6'}>You May Also Like</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {products?.results?.slice(0, 8)?.map((product, key) => (
                        <ProductCard key={key} product={product}/>
                    ))}
                </div>
            </div>

            <div className={'m-12'}>
                <FeaturesSection/>
            </div>
        </AuthLayout>
    );
};

export default CartPage;