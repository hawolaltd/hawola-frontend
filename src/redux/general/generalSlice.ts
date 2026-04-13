import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import generalService from "@/redux/general/generalService";
import {
  StateData,
  StateDataResponse,
  StateLocationsResponse,
} from "@/types/general";
import { RootState } from "@/store/store";
import { HomeData } from "@/types/home";

export interface SiteSettingsData {
  site_under_construction?: boolean;
  date_time_till?: string | null;
  app_name?: string;
  app_slogan?: string;
  /** When false, storefront skips Paystack and shows direct-merchant cart notice */
  accept_escrow_payment?: boolean;
  /** Rich HTML (sanitized client-side) shown on cart when escrow is off */
  non_escrow_cart_notice_html?: string | null;
  /** Shown on checkout (plain or simple HTML) */
  offline_payment_disclaimer?: string | null;
  /** Public site origin, no trailing slash — used for canonical / og:url */
  seo_canonical_base_url?: string | null;
  seo_default_robots?: string | null;
  seo_site_default_description?: string | null;
  seo_site_default_keywords?: string | null;
  seo_twitter_site?: string | null;
  seo_og_locale?: string | null;
  seo_product_meta_title_template?: string | null;
  seo_product_meta_description_template?: string | null;
  seo_merchant_meta_title_template?: string | null;
  seo_merchant_meta_description_template?: string | null;
  facebook_support_link?: string | null;
  instagram_support_link?: string | null;
  twitter_support_link?: string | null;
  youtube_support_link?: string | null;
  email_support_link?: string | null;
  support_phone_number?: string | null;
  [key: string]: unknown;
}

interface GeneralState {
  states: StateDataResponse;
  stateLocations: StateLocationsResponse;
  homePage: HomeData;
  homeInsight: HomeData;
  siteSettings: SiteSettingsData | null;
  siteSettingsLoaded: boolean;
  isLoading: boolean;
  error: string | null | unknown;
  message: string | null | unknown;
}

const initialState: GeneralState = {
  states: {} as StateDataResponse,
  stateLocations: {} as StateLocationsResponse,
  homePage: {} as HomeData,
  homeInsight: {} as HomeData,
  siteSettings: null,
  siteSettingsLoaded: false,
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

export const getSiteSettings = createAsyncThunk(
  "general/siteSettings",
  async (_, thunkAPI) => {
    try {
      return await generalService.getSiteSettings();
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.detail || error.response.data.message)) ||
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
      })
      .addCase(getSiteSettings.pending, (state) => {
        state.siteSettingsLoaded = false;
      })
      .addCase(getSiteSettings.fulfilled, (state, action) => {
        state.siteSettings = action.payload as SiteSettingsData;
        state.siteSettingsLoaded = true;
      })
      .addCase(getSiteSettings.rejected, (state) => {
        state.siteSettings = null;
        state.siteSettingsLoaded = true;
      });
  },
});

export const { reset } = generalSlice.actions;
export default generalSlice.reducer;
