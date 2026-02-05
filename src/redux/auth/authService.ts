import axios from "axios";
import axiosInstance from "@/libs/api/axiosInstance";
import Cookies from "js-cookie";
import {
  API,
  authRefreshTokenStorageKeyName,
  authTokenStorageKeyName,
} from "@/constant";
import {
  ChangePasswordType,
  ForgotPasswordConfirmFormType,
  ForgotPasswordFormType,
  LoginFormType,
  RegisterFormType,
  UpdateProfileDataType,
  UserProfileResponse,
  LoginCodeVerifyPayload,
} from "@/types/auth";
import { AddToCartType } from "@/types/product";
import storage from "redux-persist/lib/storage";
import { clearAllStorage } from "@/util";
const API_URL = "authy";

//Register user
const register = async (userData: RegisterFormType) => {
  const response = await axios.post(API + API_URL + "/registration/", userData);

  return response.data;
};

//Logout user
const logout = async () => {
  // const response = await axiosInstance.post(API + API_URL + "/logout/");
  // console.log("logout:", response)

  // Clear all storage (cookies, localStorage, Redux persist)
  clearAllStorage();

  // Redirect to home
  window.location.href = "/";
};

//login user
const login = async (userData: LoginFormType) => {
  const response = await axiosInstance.post(
    API + API_URL + "/login/",
    userData
  );

  if (response.data) {
    Cookies.set(authTokenStorageKeyName as string, response.data.access);
    Cookies.set(
      authRefreshTokenStorageKeyName as string,
      response.data.refresh
    );
    // localStorage.setItem(authTokenStorageKeyName as string, response.data.access)
    // localStorage.setItem(authRefreshTokenStorageKeyName as string, response.data.refresh)
  }

  return response.data;
};

// Request one-time login code (magic link)
const requestLoginCode = async (email: string) => {
  const response = await axiosInstance.post(API + API_URL + "/login/code/request/", {
    email,
  });

  return response.data;
};

// Verify one-time login code and receive JWT tokens
const verifyLoginCode = async (data: LoginCodeVerifyPayload) => {
  const response = await axiosInstance.post(
    API + API_URL + "/login/code/verify/",
    data
  );

  if (response.data) {
    Cookies.set(authTokenStorageKeyName as string, response.data.access);
    Cookies.set(
      authRefreshTokenStorageKeyName as string,
      response.data.refresh
    );
  }

  return response.data;
};

const changePassword = async (data?: ChangePasswordType) => {
  const response = await axiosInstance.post(API + API_URL + `/update-password/`, data);

  console.log("changePassword:", response);

  return response.data;
};

const forgotPassword = async (data?: ForgotPasswordFormType) => {
  const response = await axiosInstance.post(API_URL + `/password/reset/`, data);

  console.log("forgotPassword:", response);

  return response.data;
};

// Resend confirmation email
const resendConfirmationEmail = async (email: string) => {
  // Use the full endpoint URL as specified
  const response = await axiosInstance.post(
    API_URL + `/account-re-confirm-email/`,
    { email }
  );

  console.log("resendConfirmationEmail:", response);

  return response.data;
};

const resetPassword = async (data?: ForgotPasswordConfirmFormType) => {
  const response = await axiosInstance.post(
    API_URL + `/password/reset/confirm/`,
    data
  );

  console.log("resetPassword:", response);

  return response.data;
};

// User Profile

const getUserProfile = async () => {
  const response = await axiosInstance.get(API_URL + `/user/`);

  console.log("getUserProfile:", response);

  return response.data;
};

// update profile

const updateProfile = async (data: UpdateProfileDataType) => {
  const response = await axiosInstance.patch(API_URL + `/user/`, data);

  console.log("resetPassword:", response);

  return response.data;
};

// get all carts
const getCarts = async () => {
  const response = await axiosInstance.get("products/" + `cart/`);
  console.log("carts:", response);
  return response.data;
};

// add to carts
const addToCarts = async (data: AddToCartType) => {
  const response = await axiosInstance.post("products/" + `cart/add/`, data);
  console.log("addcarts:", response);
  return response.data;
};

const authService = {
  register,
  logout,
  login,
  requestLoginCode,
  verifyLoginCode,
  changePassword,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile,
  getCarts,
  addToCarts,
  resendConfirmationEmail,
};

export default authService;
