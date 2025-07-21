import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import productService from "@/redux/product/productService";
import {
  AddressResponse,
  AddToCartType,
  addWishListType,
  CartResponse,
  CategoriesProductResponse,
  deleteWishListType,
  LocalCart,
  OrderDetailsResponse,
  Product,
  ProductByIdResponse,
  ProductCategoriesResponse,
  ProductResponse,
  WishlistResponse,
} from "@/types/product";
import { RootState } from "@/store/store";

interface ProductsState {
  products: ProductResponse;
  product: ProductByIdResponse;
  categories: ProductCategoriesResponse;
  subCategories: ProductCategoriesResponse;
  secSubCategories: ProductCategoriesResponse;
  carts: CartResponse;
  orders: OrderDetailsResponse;
  localCart: LocalCart;
  addresses: AddressResponse;
  ordersHistory: OrderHistory;
  singleOrder: NewOrderDetailsResponse;
  reviews: null;
  wishLists: WishlistResponse;
  wishList: null;
  productBaseOnCategories: CategoriesProductResponse;
  productBaseOnSubCategories: CategoriesProductResponse;
  productBaseOnSecLevelSubCategories: CategoriesProductResponse;
  merchants: MerchantDetailsResponse;
  merchantsProducts: MerchantDetailsResponse;
  merchantReviews: MerchantReviewResponse;
  isLoading: boolean;
  error: string | null | unknown;
  message: string | null | unknown;
}

const initialState: ProductsState = {
  products: {} as ProductResponse,
  product: {} as ProductByIdResponse,
  categories: {} as ProductCategoriesResponse,
  subCategories: {} as ProductCategoriesResponse,
  secSubCategories: {} as ProductCategoriesResponse,
  carts: {} as CartResponse,
  orders: {} as OrderDetailsResponse,
  localCart: {} as LocalCart,
  addresses: {} as AddressResponse,
  ordersHistory: {} as OrderHistory,
  singleOrder: {} as NewOrderDetailsResponse,
  merchantReviews: {} as MerchantReviewResponse,
  reviews: null,
  productBaseOnCategories: {} as CategoriesProductResponse,
  productBaseOnSubCategories: {} as CategoriesProductResponse,
  productBaseOnSecLevelSubCategories: {} as CategoriesProductResponse,
  wishLists: {} as WishlistResponse,
  wishList: null,
  merchants: {} as MerchantDetailsResponse,
  merchantsProducts: {} as MerchantDetailsResponse,
  isLoading: false,
  error: null,
  message: "",
};

export const getProducts = createAsyncThunk(
  "products/products",
  async (_, thunkAPI) => {
    try {
      return await productService.getProducts();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getProductById = createAsyncThunk(
  "products/product",
  async (id: string, thunkAPI) => {
    try {
      return await productService.getProductById(id);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const clearProductById = createAsyncThunk(
  "products/clear-product",
  async (_, thunkAPI) => {
    try {
      return await productService.clearProductById();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getProductBySlug = createAsyncThunk(
  "products/product-slug",
  async (slug: string, thunkAPI) => {
    try {
      return await productService.getProductBySlug(slug);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllCategories = createAsyncThunk(
  "products/product-categories",
  async (_, thunkAPI) => {
    try {
      return await productService.getAllCategories();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllSubCategories = createAsyncThunk(
  "products/product-sub-categories",
  async (_, thunkAPI) => {
    try {
      return await productService.getAllCategories();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllSubSecCategories = createAsyncThunk(
  "products/product-sec-sub-categories",
  async (_, thunkAPI) => {
    try {
      return await productService.getAllCategories();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllProductBaseOnCategories = createAsyncThunk(
  "products/product-base-on-categories",
  async (data: {slug: string, page?: string}, thunkAPI) => {
    try {
      return await productService.getAllProductBaseOnCategories(data?.slug, data?.page);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllProductBaseOnSubCategories = createAsyncThunk(
  "products/product-base-on-sub-categories",
  async (data: {slug: string, page?: string}, thunkAPI) => {
    try {
      return await productService.getAllProductBaseOnSubCategories(data?.slug, data?.page);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllProductBaseOnSecondLevelSubCategories = createAsyncThunk(
  "products/product-base-on-sec-level-sub-categories",
  async (data: {slug: string, page?: string}, thunkAPI) => {
    try {
      return await productService.getAllProductBaseOnSecondLevelSubCategories(
        data?.slug,
          data?.page
      );
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCarts = createAsyncThunk(
  "products/carts",
  async (_, thunkAPI) => {
    try {
      return await productService.getCarts();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addToCarts = createAsyncThunk(
  "products/add-cart",
  async (data: AddToCartType, thunkAPI) => {
    try {
      return await productService.addToCarts(data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addToCartsLocal = createAsyncThunk(
  "products/add-local-cart",
  async (data: LocalCart, thunkAPI) => {
    try {
      return await productService.addToCartsLocal(data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteCart = createAsyncThunk(
  "products/delete--cart",
  async (data: { items: [number] }, thunkAPI) => {
    try {
      return await productService.deleteCart(data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateCart = createAsyncThunk(
  "products/update-cart",
  async (formData: { id: string; data: { qty: number } }, thunkAPI) => {
    try {
      return await productService.updateCart(formData?.id, formData?.data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get all Address
export const getAddress = createAsyncThunk(
  "products/address",
  async (_, thunkAPI) => {
    try {
      return await productService.getAddress();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// add Order
export const addOrder = createAsyncThunk(
  "products/add-order",
  async (data: any, thunkAPI) => {
    try {
      return await productService.addOrder(data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get Order History
export const getOrderHistory = createAsyncThunk(
  "products/order-history",
  async (_, thunkAPI) => {
    try {
      return await productService.getOrderHistory();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get Single Order
export const getSingleOrder = createAsyncThunk(
  "products/single-order",
  async (id: string, thunkAPI) => {
    try {
      return await productService.getSingleOrder(id);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// update Payment
export const updatePayment = createAsyncThunk(
  "products/update-payment",
  async (data: any, thunkAPI) => {
    try {
      return await productService.updatePayment(data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// add Address
export const addAddress = createAsyncThunk(
  "products/add-address",
  async (data: any, thunkAPI) => {
    try {
      return await productService.addAddress(data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// delete Address
export const deleteAddress = createAsyncThunk(
  "products/delete-address",
  async (data: any, thunkAPI) => {
    try {
      return await productService.deleteAddress(data);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// getReviews
export const getReviews = createAsyncThunk(
  "products/reviews",
  async (_, thunkAPI) => {
    try {
      return await productService.getReviews();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get merchant reviews
export const getMerchantReviews = createAsyncThunk(
  "products/merchant-reviews",
  async (slug: string, thunkAPI) => {
    try {
      return await productService.getMerchantReviews(slug);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get WishList
export const getWishList = createAsyncThunk(
  "products/get-wishList",
  async (_, thunkAPI) => {
    try {
      return await productService.getWishList();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get WishList
export const getWishListById = createAsyncThunk(
  "products/get-wishList-id",
  async (slug: string, thunkAPI) => {
    try {
      return await productService.getWishListById(slug);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// add WishList
export const addWishList = createAsyncThunk(
  "products/add-wishList",
  async (payload: addWishListType, thunkAPI) => {
    try {
      return await productService.addWishList(payload);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// delete WishList
export const deleteWishList = createAsyncThunk(
  "products/delete-wishList",
  async (payload: deleteWishListType, thunkAPI) => {
    try {
      return await productService.deleteWishList(payload);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get merchants
export const getMerchants = createAsyncThunk(
  "products/get-merchants",
  async (slug: string, thunkAPI) => {
    try {
      return await productService.getMerchants(slug);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get merchants
export const getMerchantsProducts = createAsyncThunk(
  "products/get-merchants-products",
  async (data: {slug: string, }, thunkAPI) => {
    try {
      return await productService.getMerchantsProducts(data.slug, data.slug);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
      state.products = {} as ProductResponse;
    },
  },
  extraReducers: (builder) => {
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
        // state.products = {} as ProductResponse;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.product = {} as ProductByIdResponse;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(clearProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload as ProductByIdResponse;
      })
      .addCase(clearProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.product = {} as ProductByIdResponse;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getProductBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
      })
      .addCase(getProductBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getAllCategories.pending, (state) => {
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
      })
      .addCase(getCarts.pending, (state) => {
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
      })
      .addCase(addToCarts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCarts.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(addToCarts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(addToCartsLocal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCartsLocal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.localCart = action.payload;
      })
      .addCase(addToCartsLocal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(deleteCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCart.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(deleteCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(updateCart.pending, (state) => {
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
      .addCase(getAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
      })
      .addCase(getAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(addAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(addOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getOrderHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = false;
        state.ordersHistory = action.payload;
      })
      .addCase(getOrderHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getSingleOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSingleOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleOrder = action.payload;
      })
      .addCase(getSingleOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(updatePayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getMerchantReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMerchantReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.merchantReviews = action.payload;
      })
      .addCase(getMerchantReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getWishList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWishList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishLists = action.payload;
      })
      .addCase(getWishList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getWishListById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWishListById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishList = action.payload;
      })
      .addCase(getWishListById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(addWishList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addWishList.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(addWishList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getMerchants.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMerchants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.merchants = action.payload;
      })
      .addCase(getMerchants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      }).addCase(getMerchantsProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMerchantsProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.merchantsProducts = action.payload;
      })
      .addCase(getMerchantsProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getAllProductBaseOnCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllProductBaseOnCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productBaseOnCategories = action.payload;
      })
      .addCase(getAllProductBaseOnCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getAllProductBaseOnSubCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllProductBaseOnSubCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productBaseOnSubCategories = action.payload;
      })
      .addCase(getAllProductBaseOnSubCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getAllProductBaseOnSecondLevelSubCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getAllProductBaseOnSecondLevelSubCategories.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.productBaseOnSecLevelSubCategories = action.payload;
        }
      )
      .addCase(
        getAllProductBaseOnSecondLevelSubCategories.rejected,
        (state, action) => {
          state.isLoading = false;
          state.error = true;
          state.message = action.payload;
        }
      )
      .addCase(getAllSubCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllSubCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subCategories = action.payload;
      })
      .addCase(getAllSubCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getAllSubSecCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllSubSecCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.secSubCategories = action.payload;
      })
      .addCase(getAllSubSecCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
