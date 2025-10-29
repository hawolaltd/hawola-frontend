import React from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/hook/useReduxTypes";
import { amountFormatter } from "@/util";

const CartModal = () => {
  const router = useRouter();

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { carts, localCart } = useAppSelector((state) => state.products);

  const totalPrice = carts?.cart_items?.reduce(
    (sum, item) =>
      sum +
      +(item?.product?.discount_price
        ? item?.product?.discount_price
        : item?.product?.price) *
        item?.qty,
    0
  ) || 0;
  
  const totalLocalPrice = localCart?.items?.reduce(
    (sum, item) =>
      sum +
      +(item?.product?.discount_price
        ? item?.product?.discount_price
        : item?.product?.price) *
        item?.qty,
    0
  ) || 0;

  // Determine which cart to show
  const hasAuthenticatedCart = isAuthenticated && carts?.cart_items && carts.cart_items.length > 0;
  const hasLocalCart = localCart?.items && localCart.items.length > 0;

  // Handle different image structures for authenticated vs local cart
  const getImageUrl = (item: any) => {
    const featuredImage = item?.product?.featured_image?.[0];
    if (!featuredImage) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23e5e7eb" width="60" height="60"/%3E%3C/svg%3E';
    
    // For authenticated cart items
    if (featuredImage.image?.thumbnail) {
      return featuredImage.image.thumbnail;
    }
    
    // For local cart items (also has image.thumbnail structure)
    if (featuredImage.image_url) {
      return featuredImage.image_url;
    }
    
    // Fallback to empty SVG
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23e5e7eb" width="60" height="60"/%3E%3C/svg%3E';
  };

  return (
    <div
      className="bg-white rounded-br-md rounded-bl-md p-4 w-96 border border-detailsBorder"
      style={{
        position: "absolute",
        zIndex: 20,
        right: "0px",
        top: "100%",
      }}
    >
      <div className={"h-[250px] overflow-x-hidden"}>
        {!hasAuthenticatedCart && !hasLocalCart ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : hasAuthenticatedCart
          ? carts?.cart_items?.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 mb-4">
                <div className="w-[60px] h-[60px] flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                  <img
                    src={getImageUrl(item)}
                    alt={item?.product?.name || "product"}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primary text-sm">
                    {item?.product?.name}
                  </p>
                  <p className="text-deepOrange font-bold text-sm">
                    {item?.qty} x N
                    {amountFormatter(
                      item?.product?.discount_price
                        ? (+item?.product?.discount_price).toFixed(2)
                        : (+item?.product?.price).toFixed(2)
                    )}
                  </p>
                </div>
              </div>
            ))
          : localCart?.items?.map((item) => (
              <div
                key={item.product?.id}
                className="flex items-start space-x-4 mb-4"
              >
                <div className="w-[60px] h-[60px] flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                  <img
                    src={getImageUrl(item)}
                    alt={item?.product?.name || "product"}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primary text-sm">
                    {item?.product?.name}
                  </p>
                  <p className="text-deepOrange font-bold text-sm">
                    {item?.qty} x N
                    {amountFormatter(
                      item?.product?.discount_price
                        ? (+item?.product?.discount_price).toFixed(2)
                        : (+item?.product?.price).toFixed(2)
                    )}
                  </p>
                </div>
              </div>
            ))}
      </div>

      <hr className="my-4" />

      <div className="flex justify-between font-semibold text-lg">
        <p>Total</p>
        <p className="text-black">
          N
          {amountFormatter(
            (hasAuthenticatedCart
              ? totalPrice
              : totalLocalPrice
            ).toFixed(2)
          )}
        </p>
      </div>

      <div className="mt-4 flex space-x-3 justify-between">
        <button
          className="w-[100%] border border-detailsBorder rounded-md py-2 text-primary hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            router.push("/carts");
          }}
          disabled={!hasAuthenticatedCart && !hasLocalCart}
        >
          View cart
        </button>
        {/*<button onClick={()=>{*/}
        {/*    if (isAuthenticated) {*/}
        {/*        router.push('/carts/checkout')*/}
        {/*    } */}
        {/*}} className="w-[40%] bg-primary text-white rounded-md py-2">Checkout</button>*/}
      </div>
    </div>
  );
};

export default CartModal;
