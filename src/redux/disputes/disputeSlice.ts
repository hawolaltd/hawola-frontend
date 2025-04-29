import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import disputeService from "@/redux/disputes/disputeService";
import {AddDisputeType} from "@/types/disputes";

interface DisputeState {
    disputes: any;
    isLoading: boolean;
    error: string | null;
}

const initialState: DisputeState = {
    disputes: null,
    isLoading: false,
    error: null,
};

export const getDisputes = createAsyncThunk(
    'disputes/getDisputes',
    async (orderitem_number: string, { rejectWithValue }) => {
        try {
            const response = await disputeService.getDisputes(orderitem_number);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch disputes');
        }
    }
);

export const createDispute = createAsyncThunk(
    'disputes/createDispute',
    async (data: FormData, thunkAPI) => {
        try {
            const response = await disputeService.createDispute(data);
            return response.data;
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();

            return thunkAPI.rejectWithValue(message);
        }
    }
);

const disputeSlice = createSlice({
    name: 'disputes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDisputes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDisputes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.disputes = action.payload;
            })
            .addCase(getDisputes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createDispute.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDispute.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(createDispute.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default disputeSlice.reducer;