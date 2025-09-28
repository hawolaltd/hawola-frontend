import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import generalService from "@/redux/general/generalService";
import {
  StateData,
  StateDataResponse,
  StateLocationsResponse,
} from "@/types/general";
import { RootState } from "@/store/store";
import { HomeData } from "@/types/home";

interface GeneralState {
  states: StateDataResponse;
  stateLocations: StateLocationsResponse;
  homePage: HomeData;
  homeInsight: HomeData;
  isLoading: boolean;
  error: string | null | unknown;
  message: string | null | unknown;
}

const initialState: GeneralState = {
  states: {} as StateDataResponse,
  stateLocations: {} as StateLocationsResponse,
  homePage: {} as HomeData,
  homeInsight: {} as HomeData,
  isLoading: false,
  error: null,
  message: "",
};

export const getHomePage = createAsyncThunk(
  "auth/homePage",
  async (_, thunkAPI) => {
    try {
      return await generalService.getHomePage();
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

export const getHomeInsight = createAsyncThunk(
  "auth/homeInsight",
  async (_, thunkAPI) => {
    try {
      return await generalService.getHomeInsight();
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

export const getAllStates = createAsyncThunk(
  "auth/allStates",
  async (_, thunkAPI) => {
    try {
      return await generalService.getAllStates();
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

export const getStateLocations = createAsyncThunk(
  "auth/state-location",
  async (id: string, thunkAPI) => {
    try {
      return await generalService.getStateLocations(id);
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

const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
      state.states = {} as StateDataResponse;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllStates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllStates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.states = action.payload;
      })
      .addCase(getAllStates.rejected, (state, action) => {
        state.isLoading = false;
        state.states = {} as StateDataResponse;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getStateLocations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStateLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stateLocations = action.payload;
      })
      .addCase(getStateLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.stateLocations = {} as StateLocationsResponse;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getHomePage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHomePage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.homePage = action.payload;
      })
      .addCase(getHomePage.rejected, (state, action) => {
        state.isLoading = false;
        state.homePage = {} as HomeData;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getHomeInsight.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHomeInsight.fulfilled, (state, action) => {
        state.isLoading = false;
        state.homeInsight = action.payload;
      })
      .addCase(getHomeInsight.rejected, (state, action) => {
        state.isLoading = false;
        state.homeInsight = {} as HomeData;
        state.error = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = generalSlice.actions;
export default generalSlice.reducer;
