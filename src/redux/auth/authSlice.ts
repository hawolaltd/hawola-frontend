import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {LoginResponse, RegisterFormType} from "@/types/auth";
import authService from "@/redux/auth/authService";
import {toast} from "react-toastify";
import {ChangePasswordType} from "@/types/auth";

interface AuthState {
    isAuthenticated: boolean;
    hasPermission: boolean;
    user: LoginResponse['user'] | null;
    isLoading: boolean;
    error: string | null | unknown;
    message: string | null | unknown;
}

const initialState: AuthState = {
    isAuthenticated: false,
    hasPermission: false,
    user: null,
    isLoading: false,
    error: null,
    message: "",
};

export const login = createAsyncThunk("auth/login", async (user:{ email: string; password: string;}, thunkAPI) => {
    try {
        return await authService.login(user);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();

        return thunkAPI.rejectWithValue(message);
    }
});


// register user
export const register = createAsyncThunk(
    "auth/register",
    async (data: RegisterFormType, thunkAPI) => {
        try {
            return await authService.register(data);
        } catch (error: any) {
            console.log("error from slice", error)
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message || error.error ||
                error.toString();
            toast.error(message)

            return thunkAPI.rejectWithValue(message);
        }
    }
);


// change Password
export const changePassword= createAsyncThunk(
    "auth/changePassword",
    async (data: ChangePasswordType, thunkAPI) => {
        try {
            return await authService.changePassword(data);
        } catch (error: any) {
            console.log("error from slice", error)
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message || error.error ||
                error.toString();
            toast.error(message)

            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const logout = createAsyncThunk("auth/logout", async () => {
    await authService.logout();
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.error = null;
            state.user = null;
        },
    },
    extraReducers: (builder)=>{
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
            }).addCase(register.pending, (state) => {
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
            }).addCase(changePassword.pending, (state) => {
            state.isLoading = true;
        })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                state.message = action.payload;
            }).addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        })
    }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
