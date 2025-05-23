import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerServiceService from "./customerServiceService";
import { RootState } from "@/store/store";

interface CustomerServiceState {
  faqs: any[];
  tickets: any[];
  returnRequests: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerServiceState = {
  faqs: [],
  tickets: [],
  returnRequests: [],
  isLoading: false,
  error: null,
};

export const getFAQs = createAsyncThunk(
  "customerService/getFAQs",
  async (_, thunkAPI) => {
    try {
      return await customerServiceService.getFAQs();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch FAQs"
      );
    }
  }
);

export const submitSupportTicket = createAsyncThunk(
  "customerService/submitTicket",
  async (data: any, thunkAPI) => {
    try {
      return await customerServiceService.submitSupportTicket(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to submit support ticket"
      );
    }
  }
);

export const getReturnRequests = createAsyncThunk(
  "customerService/getReturns",
  async (_, thunkAPI) => {
    try {
      return await customerServiceService.getReturnRequests();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch return requests"
      );
    }
  }
);

export const submitReturnRequest = createAsyncThunk(
  "customerService/submitReturn",
  async (data: any, thunkAPI) => {
    try {
      return await customerServiceService.submitReturnRequest(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to submit return request"
      );
    }
  }
);

const customerServiceSlice = createSlice({
  name: "customerService",
  initialState,
  reducers: {
    reset: (state) => {
      state.faqs = [];
      state.tickets = [];
      state.returnRequests = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFAQs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFAQs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.faqs = action.payload;
      })
      .addCase(getFAQs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(submitSupportTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitSupportTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets.push(action.payload);
      })
      .addCase(submitSupportTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getReturnRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReturnRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.returnRequests = action.payload;
      })
      .addCase(getReturnRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(submitReturnRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitReturnRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.returnRequests.push(action.payload);
      })
      .addCase(submitReturnRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reset } = customerServiceSlice.actions;
export default customerServiceSlice.reducer;
