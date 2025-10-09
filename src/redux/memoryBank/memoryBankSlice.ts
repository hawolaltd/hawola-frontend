import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { MemoryBankState } from '@/types/memoryBank';
import memoryBankService from './memoryBankService';
import { Product } from '@/types/product';
import { toast } from 'react-toastify';

const initialState: MemoryBankState = {
    items: [],
    isLoading: false,
    error: null,
    message: '',
};

// Get memory bank items
export const getMemoryBankItems = createAsyncThunk(
    'memoryBank/getItems',
    async (_, thunkAPI) => {
        try {
            return await memoryBankService.getMemoryBankItems();
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

// Add item to memory bank
export const addToMemoryBank = createAsyncThunk(
    'memoryBank/addItem',
    async (
        { product, notes }: { product: Product; notes?: string },
        thunkAPI
    ) => {
        try {
            const result = await memoryBankService.addToMemoryBank(
                product,
                notes
            );
            toast.success('Item added to Memory Bank');
            return result;
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Remove item from memory bank
export const removeFromMemoryBank = createAsyncThunk(
    'memoryBank/removeItem',
    async (itemId: string, thunkAPI) => {
        try {
            const result = await memoryBankService.removeFromMemoryBank(itemId);
            toast.success('Item removed from Memory Bank');
            return result;
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update item notes
export const updateMemoryBankItemNotes = createAsyncThunk(
    'memoryBank/updateNotes',
    async ({ itemId, notes }: { itemId: string; notes: string }, thunkAPI) => {
        try {
            const result = await memoryBankService.updateMemoryBankItemNotes(
                itemId,
                notes
            );
            toast.success('Notes updated');
            return result;
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Clear memory bank
export const clearMemoryBank = createAsyncThunk(
    'memoryBank/clear',
    async (_, thunkAPI) => {
        try {
            const result = await memoryBankService.clearMemoryBank();
            toast.success('Memory Bank cleared');
            return result;
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const memoryBankSlice = createSlice({
    name: 'memoryBank',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMemoryBankItems.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMemoryBankItems.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(getMemoryBankItems.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(addToMemoryBank.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addToMemoryBank.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(addToMemoryBank.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(removeFromMemoryBank.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(removeFromMemoryBank.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(removeFromMemoryBank.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateMemoryBankItemNotes.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateMemoryBankItemNotes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(updateMemoryBankItemNotes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(clearMemoryBank.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(clearMemoryBank.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(clearMemoryBank.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { reset } = memoryBankSlice.actions;
export default memoryBankSlice.reducer;
