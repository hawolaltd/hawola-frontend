import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

interface Product {
  id: number;
  name: string;
  sku: string;
  image: string;
  currentStock: number;
  threshold: number;
}

interface InventoryState {
  lowStockProducts: Product[];
  stockAlerts: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  lowStockProducts: [],
  stockAlerts: [],
  isLoading: false,
  error: null,
};

export const getLowStockProducts = createAsyncThunk(
  "inventory/getLowStockProducts",
  async (threshold: number) => {
    // TODO: Replace with actual API call
    return [
      {
        id: 1,
        name: "Wireless Headphones",
        sku: "WH-001",
        image: "/images/products/headphones.jpg",
        currentStock: 5,
        threshold: 10,
      },
      {
        id: 2,
        name: "Smart Watch",
        sku: "SW-002",
        image: "/images/products/watch.jpg",
        currentStock: 3,
        threshold: 15,
      },
      {
        id: 3,
        name: "Bluetooth Speaker",
        sku: "BS-003",
        image: "/images/products/speaker.jpg",
        currentStock: 8,
        threshold: 20,
      },
    ];
  }
);

export const getStockAlerts = createAsyncThunk(
  "inventory/getStockAlerts",
  async () => {
    // TODO: Replace with actual API call
    return [
      {
        id: 1,
        name: "Wireless Headphones",
        sku: "WH-001",
        image: "/images/products/headphones.jpg",
        currentStock: 5,
        threshold: 10,
      },
      {
        id: 2,
        name: "Smart Watch",
        sku: "SW-002",
        image: "/images/products/watch.jpg",
        currentStock: 3,
        threshold: 15,
      },
    ];
  }
);

export const updateStockLevel = createAsyncThunk(
  "inventory/updateStockLevel",
  async ({ productId, quantity }: { productId: number; quantity: number }) => {
    // TODO: Replace with actual API call
    return { productId, quantity };
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLowStockProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLowStockProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lowStockProducts = action.payload;
      })
      .addCase(getLowStockProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || "Failed to fetch low stock products";
      })
      .addCase(getStockAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStockAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stockAlerts = action.payload;
      })
      .addCase(getStockAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch stock alerts";
      })
      .addCase(updateStockLevel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStockLevel.fulfilled, (state, action) => {
        state.isLoading = false;
        const { productId, quantity } = action.payload;
        state.lowStockProducts = state.lowStockProducts.map((product) =>
          product.id === productId
            ? { ...product, currentStock: quantity }
            : product
        );
        state.stockAlerts = state.stockAlerts.map((product) =>
          product.id === productId
            ? { ...product, currentStock: quantity }
            : product
        );
      })
      .addCase(updateStockLevel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to update stock level";
      });
  },
});

export const selectInventory = (state: RootState) => state.inventory;

export default inventorySlice.reducer;
