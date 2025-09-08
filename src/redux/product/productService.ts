import axios from "axios";
import { API } from "@/constant";
import axiosInstance from "@/libs/api/axiosInstance";
import {
  AddToCartType,
  addWishListType,
  deleteWishListType,
  LocalCart,
} from "@/types/product";
const API_URL = "products/";

// get products
const getProducts = async () => {
  const response = await axios.get(API + API_URL + "list");

  return response.data;
};

// get ProductById
const getProductById = async (id: string) => {
  const response = await axios.get(API + API_URL + id);

  return response.data;
};

// clear ProductById
const clearProductById = async () => {
  return {};
};

// get ProductBy slug
const getProductBySlug = async (slug: string) => {
  const response = await axios.get(API + API_URL + "detail/" + slug + "/");

  return response.data;
};

// get all categories
const getAllCategories = async () => {
  const response = await axios.get(API + `categories/all/`);

  return response.data;
};

// get all categories
const getAllSubCategories = async (slug: string) => {
  const response = await axios.get(API + `categories/${slug}/`);

  return response.data;
};

// get all sub sec categories
const getAllSubSecCategories = async (slug: string) => {
  const response = await axios.get(
    API + API_URL + `categories/subcategories/${slug}/`
  );

  return response.data;
};

// Get all produts unique to a category.
const getAllProductBaseOnCategories = async (slug: string, page?: string) => {
  const params: Record<string, any> = {};

  if (page) params.page = page;

  try {
    const response = await axios.get(API + `categories/products/${slug}/`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Get all produts unique to a Sub-category.
const getAllProductBaseOnSubCategories = async (
  slug: string,
  page?: string
) => {
  const params: Record<string, any> = {};

  if (page) params.page = page;

  try {
    const response = await axios.get(
      API + `categories/subcategory/products/${slug}/`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Get all produts unique to a second level Sub-category.
const getAllProductBaseOnSecondLevelSubCategories = async (
  slug: string,
  page?: string
) => {
  const params: Record<string, any> = {};

  if (page) params.page = page;

  try {
    const response = await axios.get(
      API + `categories/subseccategory/products/${slug}/`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// get all carts
const getCarts = async () => {
  const response = await axiosInstance.get(API + `cart/`);
  console.log("carts:", response);
  return response.data;
};

// add to carts
const addToCarts = async (data: AddToCartType) => {
  const response = await axiosInstance.post(API + `cart/add/`, data);
  console.log("addcarts:", response);
  return response.data;
};

// add to carts
const addToCartsLocal = async (data: LocalCart) => {
  console.log(data);
  return data;
};

// delete Cart
const deleteCart = async (data: { items: [number] }) => {
  const response = await axiosInstance.post(API + `cart/delete/`, data);
  console.log("carts:", response);
  return response.data;
};

// delete Cart
const updateCart = async (id: string, data: { qty: number }) => {
  const response = await axiosInstance.post(API + `cart/update/${id}/`, data);
  console.log("updateCart:", response);
  return response.data;
};

// add Order
const addOrder = async (data: any) => {
  const response = await axiosInstance.post(API + `orders/add/`, data);
  console.log("addOrder:", response);
  return response.data;
};

// get Order History
const getOrderHistory = async () => {
  const response = await axiosInstance.get(API + `orders/all/user/items/`);
  console.log("getOrderHistory:", response);
  return response.data;
};

// get Single Order

const getSingleOrder = async (id: string) => {
  const response = await axiosInstance.get(API + `orders/single/${id}/`);
  console.log("getSingleOrder:", response);
  return response.data;
};

// update payment
const updatePayment = async (data: any) => {
  const response = await axiosInstance.post(
    API + `orders/update/payment/`,
    data
  );
  console.log("updateOrder:", response);
  return response.data;
};

// get all address
const getAddress = async () => {
  const response = await axiosInstance.get(API + `orders/get/addresses/`);
  console.log("getAddress:", response);
  return response.data;
};

// add address
const addAddress = async (data: any) => {
  const response = await axiosInstance.post(API + `orders/add/address/`, data);
  console.log("addAddress:", response);
  return response.data;
};

// delete address
const deleteAddress = async (data: any) => {
  const response = await axiosInstance.post(
    API + `orders/delete/addresses/`,
    data
  );
  console.log("deleteAddress:", response);
  return response.data;
};

// get reviews

const getReviews = async () => {
  const response = await axiosInstance.get(API + `reviews/`);
  console.log("getReviews:", response);
  return response.data;
};

// get merchant reviews

const getMerchantReviews = async (slug: string) => {
  const response = await axiosInstance.get(API + `reviews/product/${slug}/`);
  console.log("getMerchantReviews:", response);
  return response.data;
};

// get wishlist

const getWishList = async () => {
  const response = await axiosInstance.get(API + `wishlist/list/`);
  console.log("getWishList:", response);
  return response.data;
};

// get wishlist

const getWishListById = async (slug: string) => {
  const response = await axiosInstance.get(API + `wishlist/${slug}/`);
  console.log("getWishListById:", response);
  return response.data;
};

// add wishlist

const addWishList = async (paylod: addWishListType) => {
  const response = await axiosInstance.post(API + `wishlist/add/`, paylod);
  console.log("addWishList:", response);
  return response.data;
};

// delete wishlist
const deleteWishList = async (paylod: deleteWishListType) => {
  const response = await axiosInstance.post(API + `wishlist/delete/`, paylod);
  console.log("deleteWishList:", response);
  return response.data;
};

// get Merchants

const getMerchants = async (slug: string) => {
  const response = await axiosInstance.get(API + `merchant/profile/${slug}/`);
  console.log("getMerchants:", response);
  return response.data;
};

// get Merchant Profile

const getMerchantProfile = async (slug: string) => {
  const response = await axiosInstance.get(API + `merchant/profile/${slug}/`);
  console.log("getMerchantProfile:", response);
  return response.data;
};

// get Merchants Products

const getMerchantsProducts = async (slug: string, num_per_page: string) => {
  const response = await axiosInstance.get(
    API + `merchant/products/${slug}/${num_per_page}`
  );
  console.log("getMerchants:", response);
  return response.data;
};

const productService = {
  getProducts,
  getProductById,
  getAllCategories,
  getAllSubCategories,
  getAllSubSecCategories,
  getProductBySlug,
  getCarts,
  addToCarts,
  addToCartsLocal,
  deleteCart,
  updateCart,
  getAddress,
  addAddress,
  deleteAddress,
  addOrder,
  updatePayment,
  getOrderHistory,
  getSingleOrder,
  getReviews,
  getMerchantReviews,
  clearProductById,
  getWishList,
  addWishList,
  deleteWishList,
  getWishListById,
  getMerchants,
  getAllProductBaseOnCategories,
  getAllProductBaseOnSubCategories,
  getAllProductBaseOnSecondLevelSubCategories,
  getMerchantsProducts,
  getMerchantProfile,
};

export default productService;
