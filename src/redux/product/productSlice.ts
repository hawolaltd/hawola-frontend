import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import productService from "@/redux/product/productService";
import {
    AddToCartType,
    CartResponse,
    Product,
    ProductByIdResponse,
    ProductCategoriesResponse,
    ProductResponse
} from "@/types/product";

interface ProductsState {
    products: ProductResponse;
    product: ProductByIdResponse;
    categories: ProductCategoriesResponse;
    carts: CartResponse;
    localCart: [];
    isLoading: boolean;
    error: string | null | unknown;
    message: string | null | unknown;
}

const initialState: ProductsState = {
    products: {} as ProductResponse,
    product: {} as ProductByIdResponse,
    categories: {} as ProductCategoriesResponse,
    carts: {} as CartResponse,
    localCart: [],
    isLoading: false,
    error: null,
    message: "",
};

export const getProducts = createAsyncThunk("products/products", async (_, thunkAPI) => {
    try {
        return await productService.getProducts();
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});


export const getProductById = createAsyncThunk("products/product", async (id: string, thunkAPI) => {
    try {
        return await productService.getProductById(id);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});


export const getProductBySlug = createAsyncThunk("products/product-slug", async (slug: string, thunkAPI) => {
    try {
        return await productService.getProductBySlug(slug);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});



export const getAllCategories = createAsyncThunk("products/product-categories", async (_, thunkAPI) => {
    try {
        return await productService.getAllCategories();
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});

export const getCarts = createAsyncThunk("products/carts", async (_, thunkAPI) => {
    try {
        return await productService.getCarts();
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});


export const addToCarts = createAsyncThunk("products/add-cart", async (data: AddToCartType, thunkAPI) => {
    try {
        return await productService.addToCarts(data);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});


export const addToCartsLocal = createAsyncThunk("products/add-local-cart", async (data: AddToCartType, thunkAPI) => {
    try {
        return await productService.addToCartsLocal(data);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});


export const deleteCart = createAsyncThunk("products/delete--cart", async (data:{items: [number]}, thunkAPI) => {
    try {
        return await productService.deleteCart(data);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});



export const updateCart = createAsyncThunk("products/update-cart", async (formData: {id: string, data: {qty: number}}, thunkAPI) => {
    try {
        return await productService.updateCart(formData?.id, formData?.data);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});


const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
            state.products = {} as ProductResponse;
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(getProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.products = {} as ProductResponse;
                state.error = true;
                state.message = action.payload;
            }).addCase(getProductById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.product = action.payload;
            })
            .addCase(getProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.products = {} as ProductResponse;
                state.error = true;
                state.message = action.payload;
            }).addCase(getProductBySlug.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProductBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.product = action.payload;
            })
            .addCase(getProductBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.products = {} as ProductResponse;
                state.error = true;
                state.message = action.payload;
            }).addCase(getAllCategories.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload;
            })
            .addCase(getAllCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.categories = {} as ProductCategoriesResponse;
                state.error = true;
                state.message = action.payload;
            }).addCase(getCarts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCarts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.carts = action.payload;
            })
            .addCase(getCarts.rejected, (state, action) => {
                state.isLoading = false;
                state.categories = {} as ProductCategoriesResponse;
                state.error = true;
                state.message = action.payload;
            }).addCase(addToCarts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addToCarts.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(addToCarts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                state.message = action.payload;
            }).addCase(addToCartsLocal.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addToCartsLocal.fulfilled, (state, action) => {
                state.isLoading = false;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                state.localCart = action.payload;
            })
            .addCase(addToCartsLocal.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                state.message = action.payload;
            }).addCase(deleteCart.pending, (state) => {
            state.isLoading = true;
        })
            .addCase(deleteCart.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(deleteCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                state.message = action.payload;
            }).addCase(updateCart.pending, (state) => {
            state.isLoading = true;
        })
            .addCase(updateCart.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(updateCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                state.message = action.payload;
            })
    }
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
