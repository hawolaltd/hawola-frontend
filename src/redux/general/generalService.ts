import axiosInstance from "@/libs/api/axiosInstance";
import { API } from "@/constant";

const API_URL = "authy";

// get Home Page
const getHomePage = async () => {
  const response = await axiosInstance.get(API + "home/");
  console.log("getHomePage:", response);
  return response;
};

// home insight

const getHomeInsight = async () => {
  const response = await axiosInstance.get(API + "home/insight/");
  console.log("getHomeInsights:", response);
  return response;
};

// get All States
const getAllStates = async () => {
  const response = await axiosInstance.get(API + "location/all/states/");
  console.log("getAllStates:", response);

  return response;
};

// get State Location
const getStateLocations = async (id: string) => {
  const response = await axiosInstance.get(API + `location/${id}/`);

  console.log("getStateLocations:", response);

  return response;
};

const generalService = {
  getAllStates,
  getStateLocations,
  getHomePage,
  getHomeInsight,
};

export default generalService;
