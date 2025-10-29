import React, { useEffect, useState, useCallback, useMemo } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import ProductCard from "@/components/product/ProductCard";
import FeaturesSection from "@/components/home/FeaturesSection";
import { toast } from "sonner";
import {
  addOrder,
  deleteCart,
  getAddress,
  getCarts,
  updateCart,
  syncLocalCartFromStorage,
} from "@/redux/product/productSlice";
import DeleteModal from "@/components/shared/Delete";
import { AddressData, CartItem } from "@/types/product";
import { debounce } from "next/dist/server/utils";
import { getAllStates } from "@/redux/general/generalSlice";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummary from "@/components/cart/OrderSummary";
import { useRouter } from "next/router";

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
  const { products, carts, addresses, localCart } = useAppSelector(
    (state) => state.products
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  console.log("carts", carts);
  const dispatch = useAppDispatch();
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<string>("");
  const [shippingError, setShippingError] = useState<string | null>(null);
  const router = useRouter();
  const [pendingUpdates, setPendingUpdates] = useState<{
    [id: number]: number;
  }>({});
  const [cartItems, setCartItems] = useState<(CartItem | any)[]>(carts["cart_items"] || []);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPro, setSelectedPro] = useState<CartItem | null>(null);
  const [selectedAdd, setSelectedAdd] = useState<AddressData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const {
    subtotal: selectedSubtotal,
    shippingCost,
    total,
  } = useMemo(() => {
    const subtotal =
      carts?.cart_items?.reduce((sum, product) => {
        if (!selectedItems.includes(product?.id)) return sum;

        const effectiveQty = Math.max(
          1,
          product?.qty + (pendingUpdates[product?.id] || 0)
        );
        return (
          sum +
          (product?.product?.discount_price
            ? +product?.product?.discount_price
            : +product?.product?.price) *
            effectiveQty
        );
      }, 0) || 0;

    // Calculate shipping cost based on location comparison
    let shippingCost = 0;
    
    if (selectedAdd) {
      const customerState = selectedAdd?.state?.name?.toLowerCase().trim() || '';
      const customerCity = selectedAdd?.city?.name?.toLowerCase().trim() || '';
      
      cartItems
        .filter((item) => selectedItems.includes(item.id || item.product?.id))
        .forEach((item) => {
          const product = item?.product;
          const merchant = product?.merchant;
          
          if (!merchant || !product) return;
          
          const merchantState = merchant?.state?.name?.toLowerCase().trim() || '';
          const merchantCity = merchant?.location?.name?.toLowerCase().trim() || '';
          
          // Determine which shipping cost to use
          let itemShippingCost = 0;
          let shippingType = '';
          
          // Different states → use shipping_cost_outside_state
          if (merchantState !== customerState) {
            itemShippingCost = parseFloat(product?.shipping_cost_outside_state?.shipping_cost || '0');
            shippingType = 'outside_state';
          }
          // Same state, different location → use shipping_cost_outside
          else if (merchantCity !== customerCity) {
            itemShippingCost = parseFloat(product?.shipping_cost_outside?.shipping_cost || '0');
            shippingType = 'outside_vicinity';
          }
          // Same state and location → use shipping_cost_within
          else {
            itemShippingCost = parseFloat(product?.shipping_cost_within?.shipping_cost || '0');
            shippingType = 'within';
          }
          
          console.log(`Shipping for ${product.name}:`, {
            type: shippingType,
            cost: itemShippingCost,
            merchantLocation: `${merchantCity}, ${merchantState}`,
            customerLocation: `${customerCity}, ${customerState}`,
          });
          
          shippingCost += itemShippingCost;
        });
    }

    const total = subtotal + shippingCost;

    return { subtotal, shippingCost, total };
  }, [carts, cartItems, selectedItems, pendingUpdates, selectedAdd]);

  const allSelected =
    cartItems?.length > 0 && selectedItems.length === cartItems.length;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncWithServer = useCallback(
    debounce(async (updates: typeof pendingUpdates) => {
      try {
        // Handle each update individually
        const updatePromises = Object.entries(updates).map(([id, change]) => {
          const cartItem = cartItems?.find((item) => item.id === parseInt(id));
          if (!cartItem) return Promise.resolve();

          const newQty = Math.max(1, cartItem.qty + change);
          return dispatch(
            updateCart({
              id: id,
              data: { qty: newQty },
            })
          );
        });

        await Promise.all(updatePromises);
        setPendingUpdates({});

        // Refresh cart data from server to get updated quantities
        await dispatch(getCarts());
      } catch (error) {
        console.error("Sync failed", error);
      }
    }, 1000),
    [dispatch, cartItems]
  );

  const updateQuantity = (id: number, change: number) => {
    setPendingUpdates((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + change,
    }));
  };

  // Handle item selection
  const handleSelectItem = (id: number, isSelected: boolean) => {
    setSelectedItems((prev) =>
      isSelected ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  // Handle select all/deselect all
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedItems(cartItems?.map((item) => item.id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  // Handle delete cart item
  const handleDeleteCart = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(
        deleteCart({ items: [selectedPro?.id as number] })
      );
      if (res?.type.includes("fulfilled")) {
        toast.success("Deleted");
        dispatch(getCarts());
        setOpenDelete(false);
        // Remove from selected items if deleted
        setSelectedItems((prev) => prev.filter((id) => id !== selectedPro?.id));
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

  // Helper function to calculate shipping cost for an item based on location
  const calculateShippingCostForItem = (product: any) => {
    if (!selectedAdd) return 0;
    
    const customerState = selectedAdd?.state?.name?.toLowerCase().trim() || '';
    const customerCity = selectedAdd?.city?.name?.toLowerCase().trim() || '';
    const merchantState = product?.merchant?.state?.name?.toLowerCase().trim() || '';
    const merchantCity = product?.merchant?.location?.name?.toLowerCase().trim() || '';
    
    // Different states → use shipping_cost_outside_state
    if (merchantState !== customerState) {
      return parseFloat(product?.shipping_cost_outside_state?.shipping_cost || '0');
    }
    // Same state, different location → use shipping_cost_outside
    else if (merchantCity !== customerCity) {
      return parseFloat(product?.shipping_cost_outside?.shipping_cost || '0');
    }
    // Same state and location → use shipping_cost_within
    else {
      return parseFloat(product?.shipping_cost_within?.shipping_cost || '0');
    }
  };

  console.log("cartItems--", cartItems);

  const checkMerchantShipping = async (items: OrderItem[]) => {
    if (!selectedAdd) return "Please select a delivery address";

    // Get selected address location details
    const selectedAddressState = selectedAdd?.state?.name?.toLowerCase().trim() || '';
    const selectedAddressCity = selectedAdd?.city?.name?.toLowerCase().trim() || '';
    
    console.log("=== Shipping Check Debug ===");
    console.log("Customer Address:", {
      state: selectedAdd?.state?.name,
      city: selectedAdd?.city?.name,
    });
    
    const problematicItems: any[] = [];

    // Check each selected cart item
    cartItems
      .filter((item) => selectedItems.includes(item.id))
      .forEach((item) => {
        const merchant = item?.product?.merchant;
        const product = item?.product;
        
        if (!merchant || !product) return;

        // Get merchant location from product.merchant.state.name and product.merchant.location.name
        const merchantState = merchant?.state?.name?.toLowerCase().trim() || '';
        const merchantCity = merchant?.location?.name?.toLowerCase().trim() || '';

        // Check if states are different
        const differentState = merchantState !== selectedAddressState;
        
        // Check if cities/locations are different (vicinity check)
        const differentCity = merchantCity !== selectedAddressCity;

        // Get proper capitalized names for display
        const merchantStateDisplay = merchant?.state?.name || 'Unknown State';
        const merchantCityDisplay = merchant?.location?.name || 'Unknown Location';
        const customerStateDisplay = selectedAdd?.state?.name || '';
        const customerCityDisplay = selectedAdd?.city?.name || '';

        console.log(`Product: ${product.name}`, {
          merchant: {
            state: merchant?.state?.name,
            location: merchant?.location?.name,
          },
          customer: {
            state: selectedAdd?.state?.name,
            city: selectedAdd?.city?.name,
          },
          comparison: {
            differentState,
            differentCity,
          },
          policies: {
            shipOutsideState: product?.ship_outside_state,
            shipOutsideVicinity: product?.ship_outside_vicinity,
          },
        });

        // Determine if shipping is allowed based on policies
        let shippingBlocked = false;
        let reason = "";

        // RULE 1: If ship_outside_state is TRUE → Can ship ANYWHERE
        if (product?.ship_outside_state === true) {
          // No restrictions - shipping allowed everywhere
          shippingBlocked = false;
        }
        // RULE 2: If ship_outside_state is FALSE and states are DIFFERENT → BLOCKED
        else if (product?.ship_outside_state === false && differentState) {
          shippingBlocked = true;
          reason = `Merchant is located in ${merchantCityDisplay}, ${merchantStateDisplay} and does not ship outside ${merchantStateDisplay} state`;
        }
        // RULE 3: States are SAME - check vicinity policy
        else if (!differentState) {
          // If ship_outside_vicinity is TRUE → Can ship to different cities in same state
          if (product?.ship_outside_vicinity === true) {
            shippingBlocked = false;
          }
          // If ship_outside_vicinity is FALSE and cities are DIFFERENT → BLOCKED
          else if (product?.ship_outside_vicinity === false && differentCity) {
            shippingBlocked = true;
            reason = `Merchant is in ${merchantCityDisplay}, ${merchantStateDisplay} and only ships within ${merchantCityDisplay} (their city)`;
          }
          // Same city and state → ALLOWED
          else {
            shippingBlocked = false;
          }
        }

        if (shippingBlocked) {
          problematicItems.push({
            name: product.name,
            merchant: merchant.store_name || 'Merchant',
            merchantState: merchantStateDisplay,
            merchantCity: merchantCityDisplay,
            reason: reason,
          });
        }
      });

    if (problematicItems.length > 0) {
      const errorMessages = problematicItems.map(
        (item) => `• ${item.name} (${item.merchant})\n  ${item.reason}`
      );

      const customerStateDisplay = selectedAdd?.state?.name || '';
      const customerCityDisplay = selectedAdd?.city?.name || '';

      return `Shipping Restriction:\n\n${errorMessages.join(
        "\n\n"
      )}\n\n📍 Your delivery address: ${customerCityDisplay}, ${customerStateDisplay}\n\nPlease remove these items or change your delivery address to proceed.`;
    }

    return null;
  };

  const handleProceedToCheckout = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.info("Please login to continue with checkout");
      router.push("/auth/login");
      return;
    }

    if (!selectedAdd || selectedItems.length === 0) {
      toast.error("Please select items and a delivery address");
      return;
    }

    setCreatingOrder(true);
    setShippingError(null);
    setCheckoutStep("validating");

    try {
      console.log("Starting checkout process...", { selectedItems, cartItems: cartItems.length });
      
      // Prepare order items
      const orderItems: OrderItem[] = cartItems
        .filter((item) => selectedItems.includes(item.id))
        .map((item) => ({
          product: item.product.id,
          qty: Math.max(1, item.qty + (pendingUpdates[item.id] || 0)),
          price: +item.product.price,
          shipping_cost: calculateShippingCostForItem(item.product),
          merchant: item.product.merchant.id,
          // Add variants if they exist
          variant: item?.cart_variant?.map((v: any) => ({
            variant: v.variant.id,
            variant_value: v.variant_value.id,
          })),
        }));

      console.log("Checking shipping for items:", orderItems.length);
      const shippingIssues = await checkMerchantShipping(orderItems);
      if (shippingIssues) {
        console.log("Shipping issues found:", shippingIssues);
        setShippingError(shippingIssues);
        setCreatingOrder(false); // Reset loading state
        setCheckoutStep(""); // Reset step
        toast.error("Some items cannot be shipped to your location. Please check the details below.");
        return;
      }

      setCheckoutStep("creating");
      // Create order payload
      const orderPayload = {
        shippingAddress_id: selectedAdd.id,
        orderItems: orderItems.map((item) => ({
          qty: item.qty,
          product_id: item.product,
        })),
      };
      
      console.log("Creating order with payload:", orderPayload);
      // Dispatch order creation
      const result = await dispatch(addOrder(orderPayload));
      console.log("Order creation result:", result);

      if (result?.type.includes("fulfilled")) {
        setCheckoutStep("redirecting");
        console.log("Order created successfully, redirecting to checkout");
        setTimeout(() => {
          router.push(`/carts/checkout`);
        }, 1000); // Small delay to show the final step
      } else {
        console.error("Order creation failed:", result);
        toast.error("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to create order");
      setCheckoutStep(""); // Reset step on error
    } finally {
      // Only reset if not redirecting (to show the final step)
      if (checkoutStep !== "redirecting") {
        setCreatingOrder(false);
        setCheckoutStep("");
      }
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
    
    // Fetch cart data based on authentication status
    if (isAuthenticated) {
      dispatch(getCarts());
    } else {
      // Sync local cart from localStorage for anonymous users
      dispatch(syncLocalCartFromStorage());
    }
  }, [dispatch, isAuthenticated]);

  // Update cart items when carts change
  useEffect(() => {
    const newCartItems = isAuthenticated ? (carts["cart_items"] || []) : (localCart?.items || []);

    // Check if cart structure changed (items added/removed)
    const getItemId = (item: any) => item.id || item.product?.id;
    const currentItemIds = new Set(cartItems?.map(getItemId).filter(Boolean) || []);
    const newItemIds = new Set(newCartItems?.map(getItemId).filter(Boolean) || []);

    // Only reset selections if items were added or removed
    const cartStructureChanged =
      currentItemIds.size !== newItemIds.size ||
      [...currentItemIds].some((id) => !newItemIds.has(id)) ||
      [...newItemIds].some((id) => !currentItemIds.has(id));

    setCartItems(newCartItems as any);

    if (cartStructureChanged) {
      // Reset selection when cart structure changes
      setSelectedItems([]);
    }

    // Clear pending updates when cart data is refreshed from server
    setPendingUpdates({});
  }, [cartItems, carts, localCart, isAuthenticated]);

  // console.log("selectedAdd--", selectedAdd, selectedAdd?.id);
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
                <div className="col-span-2 font-semibold text-center">
                  Unit Price
                </div>
                <div className="col-span-2 font-semibold text-center">
                  Quantity
                </div>
                <div className="col-span-2 font-semibold text-center">
                  Subtotal
                </div>
                <div className="col-span-1 font-semibold text-center">
                  Remove
                </div>
              </div>

              {/* Product Items */}
              <div className={"h-[550px] overflow-x-auto"}>
                {cartItems?.length > 0 ? (
                  cartItems.map((cart) => {
                    const cartId = cart.id || cart.product?.id;
                    
                    // Calculate shipping cost, type, and availability for this item
                    let itemShippingCost = 0;
                    let itemShippingType = '';
                    let canShipToAddress = true;
                    let shippingBlockReason = '';
                    
                    if (selectedAdd && cart?.product) {
                      const product = cart?.product;
                      const merchant = product?.merchant;
                      const customerState = selectedAdd?.state?.name?.toLowerCase().trim() || '';
                      const customerCity = selectedAdd?.city?.name?.toLowerCase().trim() || '';
                      const merchantState = merchant?.state?.name?.toLowerCase().trim() || '';
                      const merchantCity = merchant?.location?.name?.toLowerCase().trim() || '';
                      
                      const differentState = merchantState !== customerState;
                      const differentCity = merchantCity !== customerCity;
                      
                      // Check if shipping is allowed based on policies
                      if (product?.ship_outside_state === true) {
                        // Can ship anywhere
                        canShipToAddress = true;
                      } else if (product?.ship_outside_state === false && differentState) {
                        // Cannot ship to different state
                        canShipToAddress = false;
                        shippingBlockReason = `Only ships within ${merchant?.state?.name || 'their state'}`;
                      } else if (!differentState) {
                        // Same state - check vicinity
                        if (product?.ship_outside_vicinity === true) {
                          canShipToAddress = true;
                        } else if (product?.ship_outside_vicinity === false && differentCity) {
                          canShipToAddress = false;
                          shippingBlockReason = `Only ships within ${merchant?.location?.name || 'their city'}`;
                        }
                      }
                      
                      // Calculate shipping cost
                      if (canShipToAddress) {
                        // Different states
                        if (differentState) {
                          itemShippingCost = parseFloat(product?.shipping_cost_outside_state?.shipping_cost || '0');
                          itemShippingType = 'outside_state';
                        }
                        // Same state, different city
                        else if (differentCity) {
                          itemShippingCost = parseFloat(product?.shipping_cost_outside?.shipping_cost || '0');
                          itemShippingType = 'outside_vicinity';
                        }
                        // Same state and city
                        else {
                          itemShippingCost = parseFloat(product?.shipping_cost_within?.shipping_cost || '0');
                          itemShippingType = 'within';
                        }
                      }
                    }
                    
                    return (
                      <CartItemRow
                        key={cartId}
                        cart={cart}
                        updateQuantity={updateQuantity}
                        onDelete={() => {
                          setSelectedPro(cart);
                          setOpenDelete(true);
                        }}
                        onSelect={handleSelectItem}
                        isSelected={selectedItems.includes(cartId)}
                        pendingUpdates={pendingUpdates}
                        shippingCost={itemShippingCost}
                        shippingType={itemShippingType}
                        canShip={canShipToAddress}
                        shippingBlockReason={shippingBlockReason}
                      />
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Your cart is empty
                  </div>
                )}
              </div>
            </div>

            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
              <button
                onClick={() => {
                  router.push("/");
                }}
                className="px-6 py-2 border-none text-white rounded-md bg-primary transition"
              >
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
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className={"m-8"}>
        <div className={"flex justify-between items-center"}>
          <h4 className={"font-bold text-2xl text-primary py-6"}>
            You May Also Like
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {products?.results?.slice(0, 8)?.map((product, key) => (
            <ProductCard key={key} product={product} />
          ))}
        </div>
      </div>

      {/* Checkout Loading Modal */}
      {creatingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              {/* Animated spinner */}
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto"></div>
              </div>
              
              {/* Loading text */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {checkoutStep === "validating" && "Validating Your Order"}
                {checkoutStep === "creating" && "Creating Your Order"}
                {checkoutStep === "redirecting" && "Almost Ready!"}
                {!checkoutStep && "Processing Your Order"}
              </h3>
              <p className="text-gray-600 mb-4">
                {checkoutStep === "validating" && "Checking shipping availability and calculating costs..."}
                {checkoutStep === "creating" && "Creating your order and preparing for checkout..."}
                {checkoutStep === "redirecting" && "Redirecting you to the checkout page..."}
                {!checkoutStep && "Please wait while we process your order..."}
              </p>
              
              {/* Progress steps */}
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    checkoutStep === "validating" ? "bg-primary animate-pulse" : 
                    ["creating", "redirecting"].includes(checkoutStep) ? "bg-green-500" : "bg-gray-300"
                  }`}></div>
                  <span className={checkoutStep === "validating" ? "text-primary font-medium" : ""}>
                    Validating shipping
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    checkoutStep === "creating" ? "bg-primary animate-pulse" : 
                    checkoutStep === "redirecting" ? "bg-green-500" : "bg-gray-300"
                  }`}></div>
                  <span className={checkoutStep === "creating" ? "text-primary font-medium" : ""}>
                    Creating order
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    checkoutStep === "redirecting" ? "bg-primary animate-pulse" : "bg-gray-300"
                  }`}></div>
                  <span className={checkoutStep === "redirecting" ? "text-primary font-medium" : ""}>
                    Preparing checkout
                  </span>
                </div>
              </div>
              
              {/* Don't close warning */}
              <p className="text-xs text-gray-400 mt-4">
                Please don't close this window
              </p>
            </div>
          </div>
        </div>
      )}

    </AuthLayout>
  );
};

export default CartPage;
