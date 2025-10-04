import React, { useState } from "react";
import { useRouter } from "next/router";
import { amountFormatter, formatCurrency } from "@/util";
import { LocalCartItem, Product, ProductByIdResponse } from "@/types/product";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  addToCarts,
  addToCartsLocal,
  getCarts,
} from "@/redux/product/productSlice";
import Link from "next/link";
import { toast } from "sonner";
import { ProductFull } from "@/types/home";

function ProductCard({
  product,
  margin,
  viewMode,
  isPromoted,
}: {
  product: ProductFull;
  margin?: string;
  viewMode?: "grid" | "list";
  isPromoted?: boolean;
}) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);

  // State for selected variants
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, number>
  >({});

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { localCart } = useAppSelector((state) => state.products);

  const dispatch = useAppDispatch();

  const handleAddToCart = async (product: Product) => {
    try {
      // Convert selected variants to the format expected by backend
      const variants =
        product?.product_variant?.length > 0
          ? Object.entries(selectedVariants).map(
              ([variantId, variantValueId]) => ({
                variant: Number(variantId),
                variant_value: variantValueId,
              })
            )
          : undefined;

      if (isAuthenticated) {
        const res = await dispatch(
          addToCarts({
            items: [
              {
                qty: quantity,
                product: product?.id,
                ...(variants && { variant: variants }),
              },
            ],
          })
        );

        if (res?.type.includes("fulfilled")) {
          dispatch(getCarts());
          toast.success("Added to cart");
        } else {
          toast("error");
        }
      } else {
        // Get current cart from localStorage or initialize empty array
        const cartItems: LocalCartItem[] = JSON.parse(
          localStorage.getItem("cartItems") || "[]"
        );

        // Check if item already exists in cart with the same variants
        const existingItemIndex = cartItems.findIndex((item) => {
          if (item.product?.id !== product?.id) return false;

          // If no variants, match on product only
          if (!variants && !item.variant) return true;

          // Compare variants
          if (variants?.length !== item.variant?.length) return false;

          // Check each variant matches
          return variants?.every((v) =>
            item.variant?.some(
              (iv) =>
                iv.variant === v.variant && iv.variant_value === v.variant_value
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
            ...(variants && { variant: variants }),
          });
        }

        // Update localStorage
        localStorage.setItem("cartItems", JSON.stringify(cartItems));

        // Update Redux state to match localStorage
        dispatch(
          addToCartsLocal({
            items: cartItems.map((item) => ({
              qty: item.qty,
              product: item.product,
              ...(item.variant && { variant: item.variant }),
            })),
          })
        );

        toast.success("Added to cart");
      }
    } catch (e) {
      console.error("Error adding to cart:", e);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Link href={`product/${product?.slug}`}>
      <div
        className={`relative bg-white border cursor-pointer ${
          margin ? margin : ""
        } border-solid border-[#D5DFE4] rounded-lg overflow-hidden p-4 ${
          viewMode === "list" ? "flex items-center gap-4" : ""
        }`}
      >
        <span
          className={
            "absolute top-3 left-3 text-[10px] flex items-center justify-center bg-deepOrange w-10 h-4 rounded-full text-white"
          }
        >
          -17%
        </span>

        {/* Promoted badge */}
        {isPromoted && (
          <span className="absolute top-3 right-3 text-[10px] flex items-center justify-center bg-yellow-500 w-16 h-4 rounded-full text-white font-semibold">
            Promoted
          </span>
        )}

        <div className={"w-full flex items-center justify-center"}>
          <img
            src={product.featured_image?.[0]?.image_url}
            alt={product.name}
            style={{
              width: "200px",
              height: "150px",
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] text-textPadded font-semibold">
            {product.merchant?.store_name}
          </h3>
          <Link href={`product/${product?.slug}`}>
            <h3
              className="text-xs font-semibold text-primary"
              onClick={() => {
                // router.push(`product/${product?.slug}`)
              }}
            >
              {product.name?.length > 50
                ? product.name?.slice(0, 50) + "..."
                : product.name}
            </h3>
          </Link>
          <div className={"flex items-center gap-1"}>
            {Array.from(product?.rating ?? 0).map((star, key) => (
              <svg
                className={"w-4 h-4"}
                key={key}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m0 0h24v24h-24z"
                  fill="#fff"
                  opacity="0"
                  transform="matrix(0 1 -1 0 24 0)"
                />
                <path
                  d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                  fill="#FFB067"
                />
              </svg>
            ))}
            <span className={"text-[10px] text-textPadded font-normal"}>
              {product?.numReviews}
            </span>
          </div>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(product.discount_price)}{" "}
            <span className={"line-through text-xs text-textPadded"}>
              {formatCurrency(product?.price)}
            </span>
          </p>
          {/*<button*/}
          {/*    className="border border-textPadded text-primary font-bold  py-2 px-4 mt-4 rounded w-full" onClick={()=>{*/}
          {/*    handleAddToCart(product)*/}
          {/*}}>Add to Cart*/}
          {/*</button>*/}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
