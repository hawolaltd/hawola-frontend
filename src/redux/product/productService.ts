import axios from "axios";
import {API} from "@/constant";
import axiosInstance from "@/libs/api/axiosInstance";
import { AddToCartType} from "@/types/product";
const API_URL = "products/";

// get products
const getProducts = async () => {
    const response = await axios.get(API + API_URL);

    return response.data;
};



// get ProductById
const getProductById = async (id: string) => {
    const response = await axios.get(API + API_URL + id);

    return response.data;
};


// get ProductBy slug
const getProductBySlug = async (slug: string) => {
    const response = await axios.get(API + API_URL + slug + '/');

    return response.data;
};


// get all categories
const getAllCategories = async () => {
    const response = await axios.get(API + API_URL + `all/categories/`);

    return response.data;
};


// get all categories
const getAllSubCategories = async (slug: string) => {
    const response = await axios.get(API + API_URL + `all/subcategories/${slug}`);

    return response.data;
};



// get all sub sec categories
const getAllSubSecCategories = async (slug: string) => {
    const response = await axios.get(API + API_URL + `all/subseccategories/${slug}`);

    return response.data;
};



// get all carts
const getCarts = async () => {
    const response = await axiosInstance.get(API + `cart/`);
    console.log("carts:", response)
    return response.data;
};

// add to carts
const addToCarts = async (data: AddToCartType) => {
    const response = await axiosInstance.post(API + `cart/add/`, data);
    console.log("addcarts:", response)
    return response.data;
};


// add to carts
const addToCartsLocal = async (data: AddToCartType) => {
    console.log(data)
   return data
};


// delete Cart
const deleteCart = async (data: { items: [number] }) => {
    const response = await axiosInstance.post(API + `cart/delete/`, data);
    console.log("carts:", response)
    return response.data;
};



// delete Cart
const updateCart = async (id: string, data: {qty: number}) => {
    const response = await axiosInstance.post(API + `cart/update/${id}/`, data);
    console.log("updateCart:", response)
    return response.data;
};


const authService = {
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
    updateCart
};

export default authService;