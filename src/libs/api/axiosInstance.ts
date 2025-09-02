import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  API,
  authRefreshTokenStorageKeyName,
  authTokenStorageKeyName,
} from "@/constant";
import { handleLogout } from "@/util";
import Cookies from "js-cookie";

const baseURL = API;
console.log("refreshToken:", Cookies.get("csrftoken"));
// Create Axios instance with configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Helper function to get token from cookies
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return Cookies.get(authTokenStorageKeyName as string) || null;
  }
  return null;
};

// Add Authorization header to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Refresh Token Function
const refreshTokenRequest = async (): Promise<boolean> => {
  const refreshToken = Cookies.get("csrftoken" as string);
  console.log("refreshTokenoriginah:", refreshToken);
  if (!refreshToken) return false;

  try {
    const response = await axios.post(`${API}/api/authy/token/refresh`, {
      token: refreshToken,
    });
    if (response.data && response.data?.success) {
      console.log("refresh:", response);
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
    console.log("error:", error);
    console.log("originalRequest:", originalRequest);
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("got here");
      console.log("refreshToken:", Cookies.get("csrftoken"));
      console.log("document.cookie:", document.cookie);
      const refreshed = await refreshTokenRequest();
      console.log("refreshed1:", refreshed);
      if (refreshed) {
        // Retry the original request with the new token
        console.log("refreshed:", refreshed);
        const newToken = getToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } else {
        console.log("got here 2");
        handleLogout();
        window.location.href = `/auth/login`;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
