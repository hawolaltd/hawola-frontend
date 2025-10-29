import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import searchService from "./searchService";
import { GeneralSearchResponse, SearchSuggestions, SearchParams } from "@/types/search";

interface SearchState {
  searchResults: GeneralSearchResponse | null;
  searchHistory: any[];
  suggestions: SearchSuggestions | null;
  popularSearches: any[];
  isLoading: boolean;
  error: string | null;
  currentQuery: string;
}

const initialState: SearchState = {
  searchResults: null,
  searchHistory: [],
  suggestions: null,
  popularSearches: [],
  isLoading: false,
  error: null,
  currentQuery: "",
};

// Async thunks
export const performSearch = createAsyncThunk(
  "search/generalSearch",
  async (params: SearchParams, thunkAPI) => {
    try {
      return await searchService.generalSearch(params);
    } catch (error: any) {
      const message =
        (error.response?.data?.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchSearchHistory = createAsyncThunk(
  "search/getHistory",
  async (limit: number = 10, thunkAPI) => {
    try {
      return await searchService.getSearchHistory(limit);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchSuggestions = createAsyncThunk(
  "search/getSuggestions",
  async (limit: number = 5, thunkAPI) => {
    try {
      return await searchService.getSearchSuggestions(limit);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchPopularSearches = createAsyncThunk(
  "search/getPopular",
  async (_, thunkAPI) => {
    try {
      return await searchService.getPopularSearches();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const clearHistory = createAsyncThunk(
  "search/clearHistory",
  async (_, thunkAPI) => {
    try {
      return await searchService.clearSearchHistory();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setCurrentQuery: (state, action) => {
      state.currentQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
      state.currentQuery = "";
    },
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Perform Search
      .addCase(performSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
        state.currentQuery = action.payload.query;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Search History
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.searchHistory = action.payload;
      })
      
      // Fetch Suggestions
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      
      // Fetch Popular Searches
      .addCase(fetchPopularSearches.fulfilled, (state, action) => {
        state.popularSearches = action.payload;
      })
      
      // Clear History
      .addCase(clearHistory.fulfilled, (state) => {
        state.searchHistory = [];
      });
  },
});

export const { setCurrentQuery, clearSearchResults, reset } = searchSlice.actions;
export default searchSlice.reducer;

