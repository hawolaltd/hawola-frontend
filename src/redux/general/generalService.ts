import axiosInstance from "@/libs/api/axiosInstance";
import {API, } from "@/constant";

const API_URL = "authy";


// get All States
const getAllStates = async () => {
    const response = await axiosInstance.get(API  + "location/all/states/");
    console.log("getAllStates:", response)

    return response;
};


// get State Location
const getStateLocations = async (id: string) => {

    const response = await axiosInstance.get(API  + `location/${id}/`);

    console.log("getStateLocations:", response)

    return response;
};




const generalService = {
    getAllStates,
    getStateLocations
};

export default generalService;