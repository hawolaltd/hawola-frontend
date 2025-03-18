import axios, {AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import { API, authRefreshTokenStorageKeyName, authTokenStorageKeyName } from "@/constant";
import { handleLogout } from "@/util";
import Cookies from "js-cookie";

const baseURL = API;

// Create Axios instance with configuration
const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Helper function to get token from cookies
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return Cookies.get(authTokenStorageKeyName as string) || null;
    }
    return null;
};

// Add Authorization header to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Refresh Token Function
const refreshTokenRequest = async (): Promise<boolean> => {
    const refreshToken = Cookies.get(authRefreshTokenStorageKeyName as string);
    if (!refreshToken) return false;

    try {
        const response = await axios.post(`${API}/auth/auth/refresh-token`, { token: refreshToken });
        if (response.data && response.data?.success) {
            // console.log(response)
            const { access_token, refresh_token } = response.data.data;

            // Store new tokens
            Cookies.set(authTokenStorageKeyName as string, access_token);
            Cookies.set(authRefreshTokenStorageKeyName as string, refresh_token);

            return true;
        }
    } catch (err) {
        return false;
    }
    return false;
};

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    async (error: AxiosError) => {
        // Ensure error.config is defined
        if (!error.config) return Promise.reject(error);

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshed = await refreshTokenRequest();
            if (refreshed) {
                // Retry the original request with the new token
                const newToken = getToken();
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } else {
                handleLogout();
                window.location.href = `/login`;
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
