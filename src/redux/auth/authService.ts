import axios from "axios";
import axiosInstance from "@/libs/api/axiosInstance";
import Cookies from 'js-cookie';
import {API, authRefreshTokenStorageKeyName, authTokenStorageKeyName} from "@/constant";
import {ChangePasswordType, LoginFormType, RegisterFormType} from "@/types/auth";
const API_URL = "authy";

//Register user
const register = async (userData: RegisterFormType) => {
    const response = await axios.post(API + API_URL + "/registration/", userData);

    return response.data;
};

//Logout user
const logout = () => {
    console.log('lll')
    localStorage.removeItem(authRefreshTokenStorageKeyName as string);
    localStorage.removeItem(authTokenStorageKeyName as string);
    Cookies.remove(authRefreshTokenStorageKeyName as string);
    Cookies.remove(authTokenStorageKeyName as string);

};

//login user
const login = async (userData: LoginFormType) => {
    const response = await axiosInstance.post(API + API_URL + "/login/", userData);
    console.log("Loginresponse:", response)
    if (response.data) {
        Cookies.set(authTokenStorageKeyName as string, response.data.access)
        Cookies.set(authRefreshTokenStorageKeyName as string, response.data.refresh)
        localStorage.setItem(authTokenStorageKeyName as string, response.data.access)
        localStorage.setItem(authRefreshTokenStorageKeyName as string, response.data.refresh)
    }

    return response.data;
};


const changePassword = async (data?: ChangePasswordType) => {
    const response = await axiosInstance.put(API_URL + `update-password`, data);

    console.log("changePassword:", response)

    return response.data;
}



const authService = {
    register, logout, login,changePassword,
};

export default authService;