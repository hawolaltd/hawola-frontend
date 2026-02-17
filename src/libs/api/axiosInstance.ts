import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import {
    API,
    authRefreshTokenStorageKeyName,
    authTokenStorageKeyName,
} from '@/constant';
import { handleLogout, clearAllStorage, forceLogout } from '@/util';
import Cookies from 'js-cookie';
import storage from 'redux-persist/lib/storage';

if (typeof window !== 'undefined') {
    console.log('storage:', storage);
    console.log('storage getItem:', storage.getItem('persist:root'));

    const gettingFromStorage = async () => {
        const data = await storage.getItem('persist:root');
    };

    console.log('gettingFromStorage:', gettingFromStorage());
}

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
        
        // Log request details for login endpoint
        if (config.url?.includes('/login/')) {
            console.log('[FRONTEND] axiosInstance - Request interceptor for login:', {
                url: config.url,
                method: config.method,
                headers: config.headers,
                data: config.data,
                dataStringified: config.data ? JSON.stringify(config.data) : 'NO DATA',
                contentType: config.headers['Content-Type'],
                hasData: !!config.data,
                dataKeys: config.data ? Object.keys(config.data) : []
            });
        }
        
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Refresh Token Function
const refreshTokenRequest = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const refreshToken = Cookies.get(authRefreshTokenStorageKeyName as string);
    console.log('refreshTokenoriginah:', refreshToken);
    if (!refreshToken) return false;

    try {
        const response = await axios.post(`${API}/api/authy/token/refresh`, {
            token: refreshToken,
        });
        if (response.data && response.data?.success) {
            // console.log(response)
            const { access, refresh } = response.data;

            // Store new tokens
            Cookies.set(authTokenStorageKeyName as string, access);
            Cookies.set(authRefreshTokenStorageKeyName as string, refresh);

            return true;
        }
    } catch (err) {
        return false;
    }
    return false;
};

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        // Ensure error.config is defined
        if (!error.config) return Promise.reject(error);

        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (typeof window !== 'undefined') {
                console.log('document.cookie:', document.cookie);
            }
            const refreshed = await refreshTokenRequest();
            if (refreshed) {
                // Retry the original request with the new token

                const newToken = getToken();
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } else {
                // Only force logout if we had tokens to begin with
                // If no tokens exist, just reject the request without redirecting
                const hadToken =
                    getToken() !== null ||
                    Cookies.get(authRefreshTokenStorageKeyName as string);
                if (hadToken) {
                    // Force logout - clears all storage and redirects
                    forceLogout();
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
