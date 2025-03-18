import axios from "axios";
import {API} from "@/constant";
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


// get all categories
const getAllCategories = async () => {
    const response = await axios.get(API + API_URL + `all/categories`);

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



const authService = {
    getProducts,
    getProductById,
    getAllCategories,
    getAllSubCategories,
    getAllSubSecCategories,
};

export default authService;