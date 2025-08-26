import React, { useEffect, useState } from "react";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  addToCarts,
  addToCartsLocal,
  deleteCart,
  getCarts,
  getMerchants,
  getWishList,
} from "@/redux/product/productSlice";
import RelatedProduct from "@/components/product/RelatedProduct";
import moment from "moment";
import { LocalCartItem, ProductByIdResponse } from "@/types/product";
import { toast } from "sonner";
import { formatCurrency } from "@/util";

type Product = {
  id: string;
  name: string;
  price: number;
  stockStatus: "In Stock" | "Out of Stock" | "Low Stock";
  addedDate: Date;
  image: string;
};

export default function WishlistPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, number>
  >({});

  const { wishList, product, wishLists } = useAppSelector(
    (state) => state.products
  );

  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const dispatch = useAppDispatch();

  const handleDeleteCart = async (selectedPro: any) => {
    setDeleting(true);
    try {
      const res = await dispatch(
        deleteCart({ items: [selectedPro as number] })
      );
      if (res?.type.includes("fulfilled")) {
        toast.success("Deleted");
        dispatch(getWishList());
        setOpenDelete(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    console.log("product:", product);
    setAdding(true);
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
          dispatch(getWishList());
          setAdding(false);
          toast.success("Added to cart");
        }
      } else {
        // Get current cart from localStorage or initialize empty array
        const cartItems: LocalCartItem[] = JSON.parse(
          localStorage.getItem("cartItems") || "[]"
        );

        // Check if item already exists in cart with the same variants
        const existingItemIndex = cartItems.findIndex((item) => {
          if (item.product?.id !== product?.product?.id) return false;

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
            product: product?.product,
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
        setAdding(false);
      }
    } catch (e) {
      console.error("Error adding to cart:", e);
      toast.error("Failed to add to cart");
    }
  };
  const formatDate = (date: any) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStockStatusColor = (status: Product["stockStatus"]) => {
    switch (status) {
      case "In Stock":
        return "text-green-600";
      case "Low Stock":
        return "text-yellow-600";
      case "Out of Stock":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  useEffect(() => {
    dispatch(getWishList());
  }, [dispatch]);
  console.log("wishLists:", wishLists);
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
              <p className="text-gray-600">
                {wishLists?.wishlists?.length} items
              </p>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      {/*<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">*/}
                      {/*    Stock Status*/}
                      {/*</th>*/}
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Added On
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
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
                                <img
                                  className="h-16 w-16 rounded-md object-cover"
                                  src={
                                    product?.product?.featured_image?.[0]?.image
                                      ?.thumbnail
                                  }
                                  alt={product?.product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product?.product?.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              {product?.product?.discount_price
                                ? formatCurrency(
                                    product?.product?.discount_price
                                  )
                                : formatCurrency(product?.product?.price)}
                              {product?.product?.discount_price ? (
                                <span className="line-through text-sm text-gray-500">
                                  {formatCurrency(product?.product?.price)}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          {/*                  <td className="px-6 py-4 whitespace-nowrap">*/}
                          {/*<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(product.stockStatus)}`}>*/}
                          {/*  {product.stockStatus}*/}
                          {/*</span>*/}
                          {/*                  </td>*/}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {moment(product?.created_at).format("MMM Do YYYY")}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium`}
                          >
                            <button
                              onClick={() =>
                                handleAddToCart(
                                  product?.product as unknown as ProductByIdResponse
                                )
                              }
                              disabled={adding}
                              className={`mr-3 ${
                                adding ? "cursor-not-allowed bg-blue-200" : ""
                              } ${
                                product?.product?.name === "Out of Stock"
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-primary"
                              } text-white px-3 py-1 rounded-md text-sm`}
                            >
                              Add to Cart
                            </button>
                            <button
                              disabled={deleting}
                              onClick={() => handleDeleteCart(product?.id)}
                              className={`${
                                deleting
                                  ? "cursor-not-allowed text-red-200"
                                  : "text-red-600 hover:text-red-900"
                              } `}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
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
                    // const inStockProducts = wishLists?.wishlists?.filter(p => p. === 'In Stock');
                    // inStockProducts.forEach(p => handleAddToCart(p as unknown as ProductByIdResponse));
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add All Available to Cart
                </button>
              </div>
            )}
          </div>
        </main>

        <RelatedProduct product={product} />
      </div>
    </AuthLayout>
  );
}
