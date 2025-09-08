import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ForgotPasswordConfirmFormType,
  ForgotPasswordFormType,
  LoginResponse,
  RegisterFormType,
  UpdateProfileDataType,
  UserProfileResponse,
} from "@/types/auth";
import authService from "@/redux/auth/authService";
import { toast } from "sonner";
import { ChangePasswordType } from "@/types/auth";
import { RootState } from "@/store/store";

interface AuthState {
  isAuthenticated: boolean;
  hasPermission: boolean;
  user: LoginResponse["user"] | null;
  profile: UserProfileResponse | null;
  isLoading: boolean;
  error: string | null | unknown;
  message: string | null | unknown;
}

const initialState: AuthState = {
  isAuthenticated: false,
  hasPermission: false,
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  message: "",
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    user: { username: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      return await authService.login(user);
    } catch (error: any) {
      const message =
        error.response.data ||
        error.response.data.message ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// register user
export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterFormType, thunkAPI) => {
    try {
      return await authService.register(data);
    } catch (error: any) {
      const message =
        error.response.data ||
        error.response.data.message ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// change Password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: ChangePasswordType, thunkAPI) => {
    try {
      return await authService.changePassword(data);
    } catch (error: any) {
      console.log("error from slice", error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.error ||
        error.toString();
      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: ForgotPasswordFormType, thunkAPI) => {
    try {
      return await authService.forgotPassword(data);
    } catch (error: any) {
      console.log("error from slice", error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.error ||
        error.toString();
      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// reset Password
export const resetPassword = createAsyncThunk(
  "auth/reset-Password",
  async (data: ForgotPasswordConfirmFormType, thunkAPI) => {
    try {
      return await authService.resetPassword(data);
    } catch (error: any) {
      console.log("error from slice", error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.error ||
        error.toString();
      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// get User Profile
export const getUserProfile = createAsyncThunk(
  "auth/profile",
  async (_, thunkAPI) => {
    try {
      return await authService.getUserProfile();
    } catch (error: any) {
      console.log("error from slice", error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.error ||
        error.toString();
      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// update Profile
export const updateProfile = createAsyncThunk(
  "auth/update-profile",
  async (data: UpdateProfileDataType, thunkAPI) => {
    try {
      return await authService.updateProfile(data);
    } catch (error: any) {
      console.log("error from slice", error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.error ||
        error.toString();
      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = null;
      state.user = null;
      state.profile = null;
      state.message = null;
    },
    clearAuthState: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.error = null;
      state.message = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.profile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.profile = null;
        state.error = null;
        state.message = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
