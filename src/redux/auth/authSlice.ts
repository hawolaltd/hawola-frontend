import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ForgotPasswordConfirmFormType,
  ForgotPasswordFormType,
  LoginResponse,
  RegisterFormType,
  UpdateProfileDataType,
  UserProfileResponse,
  LoginCodeVerifyPayload,
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
    user: { email: string; password: string },
    thunkAPI
  ) => {
    // Log what the thunk receives
    console.log('[FRONTEND] authSlice.login - Thunk received user data:', {
      email: user.email,
      password: user.password ? '***' : 'MISSING',
      hasEmail: !!user.email,
      hasPassword: !!user.password,
      userType: typeof user,
      userKeys: Object.keys(user),
      userStringified: JSON.stringify(user)
    });
    
    try {
      console.log('[FRONTEND] authSlice.login - Calling authService.login with:', user);
      const result = await authService.login(user);
      console.log('[FRONTEND] authSlice.login - authService.login returned:', {
        hasResult: !!result,
        hasAccess: !!result?.access,
        hasRefresh: !!result?.refresh
      });
      return result;
    } catch (error: any) {
      console.error('[FRONTEND] authSlice.login - Error caught:', {
        error,
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status
      });
      
      // Extract error message from various possible formats
      let message = 'Unable to log in. Please check your credentials.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Handle format: {"error": ["message"]}
        if (errorData.error) {
          if (Array.isArray(errorData.error)) {
            message = errorData.error[0] || message;
          } else if (typeof errorData.error === 'string') {
            message = errorData.error;
          }
        }
        // Handle format: {"message": "..."}
        else if (errorData.message) {
          message = errorData.message;
        }
        // Handle format: {"detail": "..."}
        else if (errorData.detail) {
          message = errorData.detail;
        }
        // Handle format: string directly
        else if (typeof errorData === 'string') {
          message = errorData;
        }
        // Handle format: array of errors
        else if (Array.isArray(errorData)) {
          message = errorData[0] || message;
        }
      } else if (error?.message) {
        message = error.message;
      }

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

// Request one-time login code
export const requestLoginCode = createAsyncThunk(
  "auth/requestLoginCode",
  async (email: string, thunkAPI) => {
    try {
      return await authService.requestLoginCode(email);
    } catch (error: any) {
      console.log("error from slice", error);
      // For rate limit errors, pass through the full error response
      if (error.response?.status === 429) {
        return thunkAPI.rejectWithValue(error.response.data);
      }
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.message ||
            error.response.data.detail ||
            error.response.data.error)) ||
        error.message ||
        error.error ||
        error.toString();

      return thunkAPI.rejectWithValue(error.response?.data || { detail: message });
    }
  }
);

// Verify one-time login code
export const verifyLoginCode = createAsyncThunk(
  "auth/verifyLoginCode",
  async (data: LoginCodeVerifyPayload, thunkAPI) => {
    try {
      return await authService.verifyLoginCode(data);
    } catch (error: any) {
      console.log("error from slice", error);
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.message ||
            error.response.data.detail ||
            error.response.data.error)) ||
        error.message ||
        error.error ||
        error.toString();

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
      // For rate limit errors, pass through the full error response
      if (error.response?.status === 429) {
        return thunkAPI.rejectWithValue(error.response.data);
      }
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.error ||
        error.toString();

      return thunkAPI.rejectWithValue(error.response?.data || { detail: message });
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

// resend confirmation email
export const resendConfirmationEmail = createAsyncThunk(
  "auth/resendConfirmationEmail",
  async (email: string, thunkAPI) => {
    try {
      return await authService.resendConfirmationEmail(email);
    } catch (error: any) {
      console.log("error from slice", error);
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.message || error.response.data.detail || error.response.data.error)) ||
        error.message ||
        error.error ||
        "Failed to resend confirmation email";
      
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
        // dj-rest-auth login returns { access, refresh, user }
        // keep only user object in state.user for UI simplicity
        // but fall back gracefully if shape differs
        // @ts-ignore
        state.user = action.payload?.user || action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = true;
        // Ensure message is always a string to prevent crashes
        if (typeof action.payload === 'string') {
          state.message = action.payload;
        } else if (action.payload && typeof action.payload === 'object') {
          const payload = action.payload as { error?: string | string[]; message?: string; detail?: string };
          if (payload.error) {
            state.message = Array.isArray(payload.error) 
              ? payload.error[0] 
              : String(payload.error);
          } else if (payload.message) {
            state.message = String(payload.message);
          } else if (payload.detail) {
            state.message = String(payload.detail);
          } else {
            state.message = 'Unable to log in. Please check your credentials.';
          }
        } else {
          state.message = 'Unable to log in. Please check your credentials.';
        }
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
      .addCase(requestLoginCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestLoginCode.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(requestLoginCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(verifyLoginCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyLoginCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // Response shape from /login/code/verify/ matches normal login
        // @ts-ignore
        state.user = action.payload?.user || action.payload;
      })
      .addCase(verifyLoginCode.rejected, (state, action) => {
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
      .addCase(resendConfirmationEmail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendConfirmationEmail.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resendConfirmationEmail.rejected, (state, action) => {
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
